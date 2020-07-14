import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Dimensions, StyleSheet, View} from "react-native";
import {Text} from "react-native-elements";


const dimensions = Dimensions.get('window');


class VideoSession extends Component {
    constructor(props) {
        super(props);

        this.state = {
            localStream: null,
            remoteStream: null,
            partnerMessage: "Waiting for partner..."
        }

        this.setup();
    }

    async setup() {
        const {userUUID, token} = this.props;
    }

    render() {
        return (
            <View style={style.container}>
                <View style={style.video}>
                    <View style={style.localVideo}>
                        <View style={style.videoWidget}>
                            {this.state.localStream &&
                            <RTCView
                                streamURL={this.state.localStream.toURL()}
                                // style={style.rtcView}

                            /> ||
                            <Text>
                                Waiting for local stream.
                            </Text>
                            }
                        </View>
                    </View>
                    <View style={style.remoteVideo}>
                        <View style={style.videoWidget}>
                            {this.state.remoteStream &&
                            <RTCView
                                streamURL={this.state.remoteStream.toURL()}
                                // style={style.rtcView}
                            /> ||
                            <Text>
                                {this.state.partnerMessage}
                            </Text>
                            }
                        </View>
                    </View>
                </View>

                {/*<View>*/}
                {/*    <Button*/}
                {/*        title="Disconnect"*/}
                {/*        onPress={this.handleDisconnectPress}*/}
                {/*    />*/}
                {/*</View>*/}
            </View>
        );
    }
}

VideoSession.propTypes = {
    sessionId: PropTypes.string,
    partnerId: PropTypes.string
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
        userUUID: state.userUUID,
        token: state.token
    }
}

export default connect(mapStateToProps)(VideoSession);
