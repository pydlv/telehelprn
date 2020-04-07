// based off https://github.com/colinwitkamp/react-native-webrtc-sample/blob/master/App.js
// and https://www.scaledrone.com/blog/webrtc-tutorial-simple-video-chat

import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';

import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    registerGlobals
} from 'react-native-webrtc';

import strings from '../strings';
import {uuidv4} from '../util';

import Scaledrone from 'scaledrone-react-native';

const isFront = true; // Use Front camera?

const clientId = uuidv4();

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

function onSuccess() {

}

function onError(error) {
    console.error(error);
}

export default class Home extends Component {
    constructor(props) {
        super(props);

        // Method bindings
        this.setupRoom = this.setupRoom.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.startWebRTC = this.startWebRTC.bind(this);
        this.startListeningToSignals = this.startListeningToSignals.bind(this);
        this.localDescCreated = this.localDescCreated.bind(this);
        this.negotiate = this.negotiate.bind(this);
        this.processCandidatesQueueIfReady = this.processCandidatesQueueIfReady.bind(this);

        this.drone = new Scaledrone('S2ktEkKPVRBiKCka');
        this.candidatesQueue = [];

        this.isOfferer = false;
        this.peerWantsOfferer = false;

        this.setupRoom();

        this.localStream = null;

        this.state = {
            connected: false,
            localStreamURL: null,
            remoteStreamURL: null,
        };
    }

    processCandidatesQueueIfReady() {
        if (this.peer.localDescription && this.peer.remoteDescription) {
            console.log("Processing ICE candidates.");
            while (this.candidatesQueue.length > 0) {
                const candidate = this.candidatesQueue.shift();
                this.peer.addIceCandidate(
                    new RTCIceCandidate(candidate),
                    onSuccess,
                    onError
                )
            }
        } else {
            console.log("Received candidate, but a description has not been set yet.");
            // console.log("Local:", this.peer.localDescription);
            // console.log("Remote:", this.peer.remoteDescription);
        }
    }

    setupRoom() {
        this.roomHash = uuidv4();
        this.roomName = 'observable-59ab74';

        this.room = this.drone.subscribe(this.roomName);

        this.room.on('open', (error) => {
            if (error) {
                return onError(error);
            }
            console.info("Scaledrone ID:", this.drone.clientId);
        });

        this.room.on('members', (members) => {
            // if (members.length > 2) {
            //     console.error("Room is full.");
            //     this.room.unsubscribe();
            // }

            const membersWithoutDebugger = members.filter(el => el.authData === undefined || !el.authData.user_is_from_scaledrone_debugger);

            const isOfferer = false;

            this.startWebRTC(isOfferer);
            this.startListeningToSignals();
        });
    }

    sendMessage(message) {
        this.drone.publish({
            room: this.roomName,
            message
        });
    }

    startWebRTC(isOfferer) {
        const peer = new RTCPeerConnection(configuration);

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendMessage({
                    'candidate': event.candidate
                });
            }
        };

        // only offerer handles negotiation needed
        if (isOfferer) {
            peer.onnegotiationneeded = this.negotiate;
        }

        peer.onaddstream = (event) => {
            console.log("Remote stream added.");
            this.setState({
                remoteStreamURL: event.stream.toURL()
            });
        };

        // Setup Camera & Audio
        mediaDevices.enumerateDevices().then(sourceInfos => {
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
                        minFrameRate: 30
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
                    peer.addStream(stream);
                })
                .catch(onError);
        });

        this.peer = peer;
    }

    startListeningToSignals() {
        this.room.on('data', (message, client) => {
            // We sent the message
            if (!client || client.id === this.drone.clientId) {
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

                // this.peer.addIceCandidate(
                //     new RTCIceCandidate(message.candidate),
                //     onSuccess,
                //     onError
                // );
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
        // Leave room and close connection to scaledrone
        this.room.unsubscribe();
        this.drone.close();
    }

    render() {
        return (
            <View>
                <Text>{strings.appName}</Text>
                <View>
                    <View>
                        <View>
                            <Text> {this.state.localStreamURL }</Text>
                            { this.state.localStreamURL &&
                            <RTCView
                                streamURL={this.state.localStreamURL}
                                style={styles.rtcView}
                            />
                            }
                        </View>
                    </View>
                    <View>
                        <View>
                            { this.state.remoteStreamURL &&
                            <RTCView streamURL={this.state.remoteStreamURL} style={styles.rtcView}/>
                            }
                        </View>
                    </View>
                </View>
                <View style={ this.state.connected ? styles.onlineCircle : styles.offlineCircle}/>
                <View>
                    {/*<TouchableOpacity onPress={this.handleConnect} disabled={this.state.offer_received}>*/}
                    {/*    <Text>*/}
                    {/*        Connect*/}
                    {/*    </Text>*/}
                    {/*</TouchableOpacity>*/}
                    { // Offer received and offer not answered
                        // (this.state.offer_received && !this.state.offer_answered) &&
                        // <TouchableOpacity onPress={this.handleAnswer}>
                        //     <Text>
                        //         Answer
                        //     </Text>
                        // </TouchableOpacity>
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: '#fff',
    //     alignItems: 'center',
    //     justifyContent: 'flex-start'
    // },
    // bottomView: {
    //     height: 20,
    //     flex: 1,
    //     bottom: 80,
    //     position: 'absolute',
    //     alignItems: 'center'
    // },
    // connect: {
    //     fontSize: 30
    // },
    // video: {
    //     flex: 1,
    //     flexDirection: 'row',
    //     position: 'relative',
    //     backgroundColor: '#eee',
    //     alignSelf: 'stretch'
    // },
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
    // callerVideo: {
    //     flex: 0.5,
    //     backgroundColor: '#faa',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     flexDirection: 'column'
    // },
    // calleeVideo: {
    //     flex: 0.5,
    //     backgroundColor: '#aaf',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     flexDirection: 'column'
    // },
    // videoWidget: {
    //     position: 'relative',
    //     flex: 0.5,
    //     backgroundColor: '#fff',
    //     width: dimensions.width / 2,
    //     borderWidth: 1,
    //     borderColor: '#eee'
    // },
    rtcView: {
        width: 150,
        height: 150,
        backgroundColor: '#f00',
        borderColor: '#000'
    }
});
