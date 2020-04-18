import React, {Component} from "react";
import {View, StyleSheet} from "react-native";
import {Button, Divider, Input, Text} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import strings from "../strings";

export default class Login extends Component {
    constructor() {
        super();

        this.state = {
            loading: false
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text h1>{ strings.appName }</Text>

                <Input
                    placeholder={strings.pages.login.email}
                    leftIcon={
                        <Icon
                            name='user'
                            size={24}
                            color='black'
                        />
                    }
                    containerStyle={styles.smallMargin}
                    disabled={this.state.loading}
                />

                <Input
                    placeholder={strings.pages.login.password}
                    secureTextEntry={true}
                    leftIcon={
                        <Icon
                            name='lock'
                            size={24}
                            color='black'
                        />
                    }
                    containerStyle={styles.smallMargin}
                    disabled={this.state.loading}
                />

                <Button
                    title={strings.pages.login.login.toUpperCase()}
                    containerStyle={styles.loginButton}
                    disabled={this.state.loading}
                />

                <Text style={styles.orDivider}>{ strings.pages.login.or.toUpperCase() }</Text>

                <Button
                    title={strings.pages.login.signup.toUpperCase()}
                    containerStyle={styles.signupButton}
                    disabled={this.state.loading}
                />

                {/*<View style={{*/}
                {/*    borderBottomColor: 'black',*/}
                {/*    borderBottomWidth: StyleSheet.hairlineWidth,*/}
                {/*    alignSelf: 'stretch',*/}
                {/*    marginTop: -35*/}
                {/*}} />*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%"
    },

    loginButton: {
        width: "40%",
        marginTop: 15
    },

    signupButton: {
        width: "40%",
        marginTop: 10
    },

    smallMargin: {
        margin: 5
    },

    orDivider: {
        margin: 20,
        fontSize: 24
    }
});