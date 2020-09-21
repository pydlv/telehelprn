import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-elements';
import globalStyles from '../globalStyles';
import {boundMethod} from 'autobind-decorator';
import {Actions} from 'react-native-router-flux';

export default class AcceptDeclinePrompt extends Component {
    @boundMethod
    onDecline() {
        Actions.pop();
        this.props.onDecline();
    }

    @boundMethod
    onAccept() {
        Actions.pop();
        this.props.onAccept();
    }

    render() {
        return (
            <View style={globalStyles.container}>
                <View style={styles.container}>
                    <Text h3 style={styles.title}>{this.props.title}</Text>
                    {this.props.subtitle &&
                        <Text style={styles.subtitle}>{this.props.subtitle}</Text>
                    }
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Decline"
                            onPress={this.onDecline}
                            buttonStyle={{backgroundColor: "red", height: "100%"}}
                            containerStyle={styles.button}
                            raised
                        />
                        <Button
                            title="Accept"
                            onPress={this.onAccept}
                            buttonStyle={{height: "100%"}}
                            containerStyle={styles.button}
                            raised
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 40
    },

    container: {
        padding: 10,
        minHeight: "40%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    button: {
        width: "40%",
        height: 45,
        marginLeft: 20,
        marginRight: 20
    },

    title: {
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20
    },

    subtitle: {
        marginLeft: 20,
        marginRight: 20
    }
});

AcceptDeclinePrompt.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    onAccept: PropTypes.func,
    onDecline: PropTypes.func
}

AcceptDeclinePrompt.defaultProps = {
    onAccept: () => {},
    onDecline: () => {}
}
