// based off https://github.com/colinwitkamp/react-native-webrtc-sample/blob/master/App.js
// and https://www.scaledrone.com/blog/webrtc-tutorial-simple-video-chat

import React, {Component} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';

import {mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, RTCView} from 'react-native-webrtc';
import PropTypes from "prop-types";

import {Button, Text} from "react-native-elements";

import Scaledrone from 'scaledrone-react-native';
import {Actions} from "react-native-router-flux";
import {boundMethod} from "autobind-decorator";
import {AccountType} from "../consts";
import {connect} from "react-redux";

const isFront = true; // Use Front camera?
const dimensions = Dimensions.get('window');

const configuration = {
    iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: ["turn:207.148.23.14:3478"],
            "username":"someuser",
            "credential":"somepassword"
        }
    ]
};

function onError(error) {
    console.error(error);
}

class VideoSession extends Component {
    constructor(props) {
        super(props);

        if (!this.props.appointmentUUID) {
            throw new Error("Invalid appointment UUID");
        }

        // Method bindings
        this.setupRoom = this.setupRoom.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.initializeRTCPeer = this.initializeRTCPeer.bind(this);
        this.startListeningToSignals = this.startListeningToSignals.bind(this);
        this.localDescCreated = this.localDescCreated.bind(this);
        this.negotiate = this.negotiate.bind(this);
        this.processCandidatesQueueIfReady = this.processCandidatesQueueIfReady.bind(this);
        this.setupLocalVideo = this.setupLocalVideo.bind(this);
        this.handleDisconnectPress = this.handleDisconnectPress.bind(this);

        this.alreadyPerformedDisconnectSteps = false;

        this.localStream = null;
        this.setupLocalVideo().then(() => {
            this.drone = new Scaledrone('S2ktEkKPVRBiKCka');
            this.candidatesQueue = [];

            this.isOfferer = this.props.accountType !== AccountType.User;

            this.setupRoom();
        });

        this.state = {
            connected: false,
            localStreamURL: null,
            remoteStreamURL: null,
            partnerWaitingMessage: "Waiting for your video partner to connect."
        };
    }

    processCandidatesQueueIfReady() {
        if (this.peer.localDescription && this.peer.remoteDescription) {
            console.log("Processing ICE candidates.");
            while (this.candidatesQueue.length > 0) {
                const candidate = this.candidatesQueue.shift();
                this.peer.addIceCandidate(
                    new RTCIceCandidate(candidate)
                ).catch(onError);
            }
        } else {
            console.log("Received candidate, but a description has not been set yet.");
        }
    }

    setupRoom() {
        this.roomName = `observable-${this.props.appointmentUUID}`;

        this.room = this.drone.subscribe(this.roomName);

        this.room.on('open', (error) => {
            if (error) {
                return onError(error);
            }
            console.info("Scaledrone ID:", this.drone.clientId);
        });

        this.room.on('members', (members) => {
            this.initializeRTCPeer();
            this.startListeningToSignals();
        });
    }

    sendMessage(message) {
        this.drone.publish({
            room: this.roomName,
            message
        });
    }

    initializeRTCPeer(sendRequestRestart=true) {
        const peer = new RTCPeerConnection(configuration);

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendMessage({
                    'candidate': event.candidate
                });
            }
        };

        peer.onaddstream = (event) => {
            console.log("Remote stream added.");
            this.setState({
                remoteStreamURL: event.stream.toURL()
            });
        };

        peer.addStream(this.localStream);

        if (this.isOfferer) {
            peer.onnegotiationneeded = this.negotiate;
        } else if (sendRequestRestart) {
            this.sendMessage("request restart");
        }

        this.peer = peer;
    }

    setupLocalVideo() {
        // Setup Camera & Audio
        return mediaDevices.enumerateDevices().then(sourceInfos => {
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if(sourceInfo.kind === "videoinput" && sourceInfo.facing === (isFront ? "front" : "environment")) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }
            mediaDevices.getUserMedia({
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 100, // Provide your own width, height and frame rate here
                        minHeight: 100,
                        minFrameRate: 10
                    },
                    facingMode: (isFront ? "user" : "environment"),
                    optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
                }
            })
                .then((stream) => {
                    // Got stream!
                    console.log("Got video device.");
                    this.setState({
                        localStreamURL: stream.toURL()
                    });
                    this.localStream = stream;
                })
                .catch(onError);
        });
    }

    startListeningToSignals() {
        this.room.on('data', (message, client) => {
            if (!client || client.id === this.drone.clientId) {
                // We are the sender
                return;
            }

            if (message.sdp) {
                // Called after receiving offer or answer from peer
                this.peer.setRemoteDescription(
                    new RTCSessionDescription(message.sdp)
                ).then(() => {
                    console.log("Received remote description.");

                    // Received offer, so answer it
                    if (this.peer.remoteDescription.type === 'offer') {
                        this.peer.createAnswer().then(this.localDescCreated).catch(onError);
                    }

                    this.processCandidatesQueueIfReady();
                }).catch(onError);
            } else if (message.candidate) {
                this.candidatesQueue.push(message.candidate);
                this.processCandidatesQueueIfReady();
            } else if (message === "request restart") {
                console.log("Restarting WebRTC.");
                this.peer.close();
                this.initializeRTCPeer();
            } else if (message === "disconnecting") {
                this.setState({
                    partnerWaitingMessage: "Your partner has disconnected.",
                    remoteStreamURL: null,
                    connected: false
                });
                this.peer.close();
                this.initializeRTCPeer(false);
            } else {
                console.log("Received unknown message:", message);
            }
        });
    }

    negotiate() {
        console.log("Negotiation was needed.");
        this.peer.createOffer().then(this.localDescCreated).catch(onError);
    }

    localDescCreated(desc) {
        this.peer.setLocalDescription(
            desc
        ).then(() => {
            console.log("Received local description.");

            this.sendMessage({
                    'sdp': this.peer.localDescription
                }
            );

            this.processCandidatesQueueIfReady();
        }
        ).catch(onError);
    }

    componentWillUnmount() {
        console.log("UNMOUNTING!!!");
        // Leave room and close connection to scaledrone
        if (!this.alreadyPerformedDisconnectSteps) {
            this.sendMessage("disconnecting");
            // We want to wait for the message to finish sending before closing this stuff.
            // Unfortunately there's not a nice way to do it.
            setTimeout(() => {
                if (this.room) {
                    this.room.unsubscribe();
                }
                if (this.drone) {
                    this.drone.close();
                }
            }, 100);
            this.peer.close();
            this.alreadyPerformedDisconnectSteps = true;
        }
    }

    @boundMethod
    handleDisconnectPress() {
        console.log("Disconnecting");

        this.setState({
            localStreamURL: null,
            remoteStreamURL: null,
            connected: false
        });

        if (!this.alreadyPerformedDisconnectSteps) {
            this.sendMessage("disconnecting");
            // We want to wait for the message to finish sending before closing this stuff.
            // Unfortunately there's not a nice way to do it.
            setTimeout(() => {
                if (this.room) {
                    this.room.unsubscribe();
                }
                if (this.drone) {
                    this.drone.close();
                }
            }, 100);
            this.peer.close();
            this.alreadyPerformedDisconnectSteps = true;
        }

        Actions.pop({type: "reset"});
    }

    render() {
        return (
            <View style={style.container}>
                <View style={style.video}>
                    <View style={style.localVideo}>
                        <View style={style.videoWidget}>
                            {this.state.localStreamURL &&
                                <RTCView
                                    streamURL={this.state.localStreamURL}
                                    style={style.rtcView}

                                /> ||
                                <Text>
                                    Waiting for local stream.
                                </Text>
                            }
                        </View>
                    </View>
                    <View style={style.remoteVideo}>
                        <View style={style.videoWidget}>
                            {this.state.remoteStreamURL &&
                                <RTCView
                                    streamURL={this.state.remoteStreamURL}
                                    style={style.rtcView}
                                /> ||
                                <Text>
                                    {this.state.partnerWaitingMessage}
                                </Text>
                            }
                        </View>
                    </View>
                </View>

                <View>
                    <Button
                        title="Disconnect"
                        onPress={this.handleDisconnectPress}
                    />
                </View>
            </View>
        );
    }
}

VideoSession.propTypes = {
    appointmentUUID: PropTypes.string
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    bottomView: {
        height: 20,
        flex: 1,
        bottom: 80,
        position: 'absolute',
        alignItems: 'center'
    },
    connect: {
        fontSize: 30
    },
    video: {
        flex: 1,
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#eee',
        alignSelf: 'stretch'
    },
    onlineCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1e1',
        position: 'absolute',
        top: 10,
        left: 10
    },
    offlineCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#333'
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: '#faa',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    localVideo: {
        flex: 1,
        backgroundColor: '#aaf',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    videoWidget: {
        position: 'relative',
        flex: 1,
        backgroundColor: '#fff',
        width: dimensions.width,
        borderWidth: 1,
        borderColor: '#eee'
    },
    rtcView: {
        flex: 1,
        backgroundColor: '#f00',
        position: 'relative'
    }
});

function mapStateToProps(state) {
    return {
        accountType: state.accountType
    }
}

export default connect(mapStateToProps)(VideoSession);
