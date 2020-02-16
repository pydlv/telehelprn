import React, { Component } from 'react';
import { Text, Button } from 'react-native';
import {uuidv4} from '../util';
import AWS from 'aws-sdk';
import Video from 'react-native-video';

const KVSWebRTC = require('amazon-kinesis-video-streams-webrtc');
const SignalingClient = KVSWebRTC.SignalingClient;

export default class Home extends Component {
    render() {
        return (
            <>
                <Text>Video Chat</Text>
                <Video
                    ref={(ref) => {
                        this.localPlayer = ref;
                    }}
                />
                <Video
                    ref={(ref) => {
                        this.remotePlayer = ref;
                    }}
                />
                <Button
                    title="Press me"
                    onPress={this.onPressMe}
                />
            </>
        )
    }

    async onPressMe() {
        // DescribeSignalingChannel API can also be used to get the ARN from a channel name.
        const channelARN = 'arn:aws:kinesisvideo:us-east-1:838649631748:channel/testing/1581877891049';

        // AWS Credentials
        const accessKeyId = 'AKIAJB7DYLR6Q2QMAUEQ';
        const secretAccessKey = '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';

        // <video> HTML elements to use to display the local webcam stream and remote stream from the master
        // const localView = document.getElementsByTagName('video')[0];
        // const remoteView = document.getElementsByTagName('video')[1];

        const region = 'us-east-1';
        const clientId = uuidv4();

        const kinesisVideoClient = new AWS.KinesisVideo({
            region,
            accessKeyId,
            secretAccessKey,
        });

        const getSignalingChannelEndpointResponse = await kinesisVideoClient
            .getSignalingChannelEndpoint({
                ChannelARN: channelARN,
                SingleMasterChannelEndpointConfiguration: {
                    Protocols: ['WSS', 'HTTPS'],
                    Role: KVSWebRTC.Role.VIEWER,
                },
            }).promise();
        const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
            return endpoints;
        }, {});

        const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
            region,
            accessKeyId,
            secretAccessKey,
            endpoint: endpointsByProtocol.HTTPS,
        });

        const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
            .getIceServerConfig({
                ChannelARN: channelARN,
            })
            .promise();
        const iceServers = [
            { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` }
        ];
        getIceServerConfigResponse.IceServerList.forEach(iceServer =>
            iceServers.push({
                urls: iceServer.Uris,
                username: iceServer.Username,
                credential: iceServer.Password,
            }),
        );

        const peerConnection = new RTCPeerConnection({ iceServers });

        const signalingClient = new KVSWebRTC.SignalingClient({
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

        // Once the signaling channel connection is open, connect to the webcam and create an offer to send to the master
        signalingClient.on('open', async () => {
            // Get a stream from the webcam, add it to the peer connection, and display it in the local view
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: true,
                });
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
                this.localPlayer.srcObject = localStream;
            } catch (e) {
                // Could not find webcam
                return;
            }

            // Create an SDP offer and send it to the master
            const offer = await viewer.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await peerConnection.setLocalDescription(offer);
            signalingClient.sendSdpOffer(viewer.peerConnection.localDescription);
        });

        // When the SDP answer is received back from the master, add it to the peer connection.
        signalingClient.on('sdpAnswer', async answer => {
            await peerConnection.setRemoteDescription(answer);
        });

        // When an ICE candidate is received from the master, add it to the peer connection.
        signalingClient.on('iceCandidate', candidate => {
            peerConnection.addIceCandidate(candidate);
        });

        signalingClient.on('close', () => {
            // Handle client closures
        });

        signalingClient.on('error', error => {
            // Handle client errors
        });

        // Send any ICE candidates generated by the peer connection to the other peer
        peerConnection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate) {
                signalingClient.sendIceCandidate(candidate);
            } else {
                // No more ICE candidates will be generated
            }
        });

        // As remote tracks are received, add them to the remote view
        peerConnection.addEventListener('track', event => {
            if (this.remotePlayer.srcObject) {
                return;
            }
            this.remotePlayer.srcObject = event.streams[0];
        });

        signalingClient.open();
    }
}
