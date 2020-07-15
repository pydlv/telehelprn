import React, {Component} from "react";
import PropTypes from "prop-types";
import {Dimensions, StatusBar, StyleSheet, View} from "react-native";
import {Button, Text} from "react-native-elements";
import {getAuthedAPI} from "../api";
import {OTPublisher, OTSession, OTSubscriber} from "opentok-react-native";
import InCallManager from 'react-native-incall-manager';
import {boundMethod} from "autobind-decorator";
import {Actions} from "react-native-router-flux";


const dimensions = Dimensions.get('window');

const TokBoxAPIKey = '46836644';

class VideoSession extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sessionId: null,
            token: null,
            connected: false,
            partnerConnected: false,
            hasLocalStream: false,
            hasRemoteStream: false,
            localMessage: "Waiting to connect to session.",
            remoteMessage: "Waiting for partner to join."
        }

        this.sessionEventHandlers = {
            // connectionCreated: event =>  {
            //     console.log("connection created", event);
            // },
            // connectionDestroyed: event =>  {
            //     console.log("connection destroyed", event);
            // },
            sessionConnected: event => {
                console.log("Connected to session.");
                this.setState({
                    connected: true,
                    localMessage: "Connected to session. Waiting for local video."
                });
            },
            sessionDisconnected: event => {
                console.log("Disconnected from session");
                this.setState({
                    connected: false,
                    localMessage: "Disconnected from session."
                });
            },
            sessionReconnected: event => {
                console.log("Reconnected to session.");
                this.setState({
                    connected: true,
                    localMessage: "Reconnected to session. Waiting for local video."
                });
            },
        };

        this.publisherProperties = {
            resolution: '1280x720',
            frameRate: 30
        };

        this.publisherEventHandlers = {
            streamCreated: event => {
                console.log("Got local stream.");
                this.setState({
                    hasLocalStream: true,
                    localMessage: "Got local stream."
                });
            },

            streamDestroyed: event => {
                console.log("Lost local stream.");
                this.setState( {
                    hasLocalStream: false,
                    localMessage: "Lost local stream."
                });
            },

            error: event => {
                console.log("Local stream error.");
                this.setState({
                    hasLocalStream: false,
                    localMessage: "An error occurred while publishing the local stream."
                })
            }
        };

        this.subscriberEventHandlers = {
            connected: event => {
                console.log("Partner connected.");
                this.setState({
                    partnerConnected: true,
                    remoteMessage: "Partner has connected. Waiting for their video."
                });
            },

            disconnected: event => {
                console.log("Partner disconnected.");
                this.setState({
                    partnerConnected: false,
                    hasRemoteStream: false,
                    remoteMessage: "Your partner has disconnected."
                });
            },

            videoEnabled: event => {
                console.log("Got remote video.");
                this.setState({
                    hasRemoteStream: true,
                    remoteMessage: "Got remote video stream."
                });
            },

            videoDisabled: event => {
                console.log("Lost remote video.");
                this.setState({
                    hasRemoteStream: false,
                    remoteMessage: "Partner stopped their video."
                });
            }
        };

        this.setup();
    }

    async setup() {
        console.log("Joining appointment with ID:", this.props.appointmentUUID);

        // Get the session ID and token for TokBox
        const result = await getAuthedAPI().getOTSessionIdAndToken(this.props.appointmentUUID);

        await this.setState({
            sessionId: result.session_id,
            token: result.token
        });

        console.log("OT Session ID:", this.state.sessionId, "Token:", this.state.token);
    }

    render() {
        return (
            <View>
                <StatusBar hidden />
                { this.state.sessionId && this.state.token ?
                    <OTSession
                        apiKey={TokBoxAPIKey}
                        sessionId={this.state.sessionId}
                        token={this.state.token}
                        eventHandlers={this.sessionEventHandlers}
                        style={{width: dimensions.width, height: dimensions.height}}
                    >
                        <View style={style.container}>
                            <View style={style.localVideo}>
                                <OTPublisher
                                    properties={this.publisherProperties}
                                    style={style.rtcView}
                                    eventHandlers={this.publisherEventHandlers}
                                />
                                {!this.state.hasLocalStream &&
                                    <Text>
                                        {this.state.localMessage}
                                    </Text>
                                }
                            </View>
                            <View style={style.remoteVideo}>
                                    <OTSubscriber
                                        style={style.rtcView}
                                        eventHandlers={this.subscriberEventHandlers}
                                    />
                                    {!this.state.hasRemoteStream &&
                                        <Text>
                                            {this.state.remoteMessage}
                                        </Text>
                                    }
                            </View>
                            <View>
                                <Button
                                    style={style.disconnectButton}
                                    title="Disconnect"
                                    onPress={this.handleDisconnectPress}
                                />
                            </View>
                        </View>
                    </OTSession>
                    :
                    <Text>
                        Trying to connect. Please wait.
                    </Text>
                }
            </View>
        );
    }

    @boundMethod
    handleDisconnectPress() {
        Actions.pop({type: "reset"});
    }

    componentDidMount() {
        InCallManager.start({media: "video"});
    }

    componentWillUnmount() {
        InCallManager.stop();
    }
}

VideoSession.propTypes = {
    appointmentUUID: PropTypes.string
}

const style = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    localVideo: {
        backgroundColor: '#aaf',
        flex: 1,
        display: "flex",
        flexDirection: "column"
    },
    remoteVideo: {
        backgroundColor: '#faa',
        flex: 1,
        display: "flex",
        flexDirection: "column"
    },
    rtcView: {
        backgroundColor: '#f00',
        width: "100%",
        height: "100%"
    },
    disconnectButton: {

    }
});

export default VideoSession;
