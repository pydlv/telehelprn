// based off https://github.com/colinwitkamp/react-native-webrtc-sample/blob/master/App.js

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
import * as KVSWebRTC from 'amazon-kinesis-video-streams-webrtc';
import AWS from 'aws-sdk';

const isFront = true; // Use Front camera?


// DescribeSignalingChannel API can also be used to get the ARN from a channel name.
const channelARN = 'arn:aws:kinesisvideo:us-east-1:838649631748:channel/testing/1581877891049';

// AWS Credentials
const accessKeyId = 'AKIAJB7DYLR6Q2QMAUEQ';
const secretAccessKey = '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';

const region = 'us-east-1';
const clientId = uuidv4();

const iceServers = [
    { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` }
];

const DEFAULT_ICE = {
// we need to fork react-native-webrtc for relay-only to work.
//  iceTransportPolicy: "relay",
    iceServers
};

const kinesisVideoClient = new AWS.KinesisVideo({
    region,
    accessKeyId,
    secretAccessKey,
});

export default class Home extends Component {
    constructor(props) {
        super(props);

        // Bind stuff
        this.setupSignalingClient = this.setupSignalingClient.bind(this);
        this.setupWebRTC = this.setupWebRTC.bind(this);
        this.handleConnect = this.handleConnect.bind(this);
        this.onIceConnectionStateChange = this.onIceConnectionStateChange.bind(this);
        this.onAddStream = this.onAddStream.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);

        this.signalingClient = null;
        this.setupSignalingClient()
            .then(() => {
                console.log("Finished setting up signaling client.");
            })
            .catch((e) => {
                console.error("Error", e);
        });

        this.localStream = null;

        this.peer = null;

        this.state = {
            connected: false,
            localStreamURL: null,
            remoteStreamURL: null,

            iceConnectionState: null,
            pendingCandidates: [],
            offerReceived: false
        };
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
                    <TouchableOpacity onPress={this.handleConnect} disabled={this.state.offer_received}>
                        <Text>
                            Connect
                        </Text>
                    </TouchableOpacity>
                    { // Offer received and offer not answered
                        (this.state.offer_received && !this.state.offer_answered) &&
                        <TouchableOpacity onPress={this.handleAnswer}>
                            <Text>
                                Answer
                            </Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        );
    }

    componentDidMount() {
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
                    this.localStream = stream
                })
                .catch(error => {
                    // Log error
                    console.log(error);
                });
        });
    }

    async setupSignalingClient() {
        const getSignalingChannelEndpointResponse = await kinesisVideoClient
            .getSignalingChannelEndpoint({
                ChannelARN: channelARN,
                SingleMasterChannelEndpointConfiguration: {
                    Protocols: ['WSS', 'HTTPS'],
                    Role: KVSWebRTC.Role.VIEWER,
                },
            })
            .promise();
        const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
            return endpoints;
        }, {});

        this.signalingClient = new KVSWebRTC.SignalingClient({
            channelARN,
            channelEndpoint: endpointsByProtocol.WSS,
            clientId,
            role: KVSWebRTC.Role.VIEWER,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        this.signalingClient.on('open', async () => {
            console.info("Signaling client opened.");

            // Create an SDP offer and send it to the master
            const offer = await this.peer.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await this.peer.setLocalDescription(offer);
            this.signalingClient.sendSdpOffer(this.peer.localDescription);
        });

        // When the SDP answer is received back from the master, add it to the peer connection.
        this.signalingClient.on('sdpAnswer', async answer => {
            await this.peer.setRemoteDescription(answer);
        });

        // When an ICE candidate is received from the master, add it to the peer connection.
        this.signalingClient.on('iceCandidate', candidate => {
            this.peer.addIceCandidate(candidate);
        });

        this.signalingClient.on('close', () => {
            // Handle client closures
            console.info("Signaling client received close.");
        });

        this.signalingClient.on('error', error => {
            // Handle client errors
            console.error(error);
        });

        console.info("Done setting up signaling client.");
    }

    async setupWebRTC() {
        const peer = new RTCPeerConnection(DEFAULT_ICE);

        // peer.oniceconnectionstatechange = this.onIceConnectionStateChange;
        // peer.onaddstream = this.onAddStream;
        // peer.onicecandidate = this.onIceCandidate;

        // Send any ICE candidates generated by the peer connection to the other peer
        peer.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate) {
                this.signalingClient.sendIceCandidate(candidate);
            } else {
                // No more ICE candidates will be generated
            }
        });

        // As remote tracks are received, add them to the remote view
        peer.addEventListener('track', event => {
            if (this.remoteStream) {
                return;
            }
            this.remoteStream = event.streams[0];
        });

        peer.addStream(this.localStream);

        this.peer = peer;

        this.signalingClient.open();
    }

    async handleConnect(e) {
        console.log(crypto);
        await this.setupWebRTC();
    }

    onIceConnectionStateChange(e) {
        console.info('ICE Connection State Changed:', e.target.iceConnectionState);

        this.setState({
            ice_connection_state: e.target.iceConnectionState
        });

        switch (e.target.iceConnectionState) {
            case 'closed':
            case 'disconnected':
            case 'failed':
                if (this.peer) {
                    this.peer.close();
                    this.setState({
                        remoteStreamURL: null
                    });
                    this.remoteStream = null
                }
                break
        }
    }

    onAddStream(e) {
        console.info('Remote Stream Added:', e.stream);
        this.setState({
            remoteStreamURL: e.stream.toURL()
        });
        this.remoteStream = e.stream;
    }

    onIceCandidate(e) {
        const { candidate } = e;
        console.info('Ice candidate found:', candidate);

        if (candidate) {
            let pendingRemoteIceCandidates = this.state.pendingCandidates;
            if (Array.isArray(pendingRemoteIceCandidates)) {
                this.setState({
                    pendingCandidates: [...pendingRemoteIceCandidates, candidate]
                });
            } else {
                this.setState({
                    pendingCandidates: [candidate]
                })
            }
        } else {
            if (this.state.pendingCandidates.length > 1) {
                this.sendMessage({
                    type: this.state.offerReceived ? 'answer' : 'offer',
                    payload: {
                        description: this.peer.localDescription,
                        candidates: this.state.pendingCandidates
                    }
                })
            } else {
                console.error('No candidates found.');
            }
        }
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
