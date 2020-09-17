import React, {Component} from "react";
import {Dimensions, ImageBackground, ScrollView, StyleSheet, View} from "react-native";
import {Button, Image, Input, Text} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import strings from "../strings";
import {boundMethod} from "autobind-decorator";
import * as api from "../api";
import globalStyles from "../globalStyles";
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {setLogin} from "../common";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const backgroundImage = require("../assets/AFFORDABLE_notitle.png");

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            email: "",
            password: "",
            emailValidationError: null,
            passwordValidationError: null
        }
    }

    @boundMethod
    handleEmail(text) {
        this.setState({email: text});
    }

    @boundMethod
    handlePassword(text) {
        this.setState({password: text});
    }

    @boundMethod
    tryLogin() {
        if (!this.state.email || !this.state.password) {
            return;
        }

        this.setState({
            loading: true,
            emailValidationError: null,
            passwordValidationError: null
        });

        api.login(this.state.email, this.state.password).then((response) => {
            setLogin(this.props.dispatch, response.uuid, response.token, response.account_type);
        }).catch((error) => {
            const {response} = error;

            if (response === undefined) {
                console.error(error);
            }

            if (response.status === 400) {
                if ("errors" in response.data) {
                    const {errors} = response.data;
                    if ("email" in errors) {
                        this.setState({emailValidationError: strings.pages.login.invalidEmailFormat});
                    } else if ("password" in errors) {
                        this.setState({passwordValidationError: strings.pages.login.passwordIsIncorrect});
                    }
                }
            } else if (response.status === 403) {
                if ("error" in response.data) {
                    const {error} = response.data;
                    if (error === "User does not exist.") {
                        this.setState({emailValidationError: strings.pages.login.userDoesNotExist});
                    } else if (error === "Login is invalid.") {
                        this.setState({passwordValidationError: strings.pages.login.passwordIsIncorrect});
                    }
                }
            } else {
                console.error(error);
            }

            this.setState({
                password: "",
                loading: false
            });
        });
    }

    render() {
        return (
            <View style={globalStyles.container}>
                {/*<ImageBackground source={backgroundImage} style={styles.imageBackground}>*/}
                {/*    <Image source={backgroundImage} style={{width: windowWidth * .75, height: windowWidth * .75, resizeMode: "stretch"}}/>*/}
                <Image
                    source={backgroundImage}
                    style={{width: windowWidth * .5, height: windowWidth * .5, resizeMode: "stretch"}}
                />
                <Text h2 style={{marginTop: 20, marginBottom: 20}}>Telemental Health</Text>

                <Input
                    placeholder={strings.pages.login.email}
                    leftIcon={
                        <Icon
                            name='user'
                            size={24}
                            color='black'
                            style={{marginRight: 8}}
                        />
                    }
                    containerStyle={styles.smallMargin}
                    disabled={this.state.loading}
                    onChangeText={this.handleEmail}
                    errorMessage={this.state.emailValidationError}
                    autoCapitalize="none"
                />

                <Input
                    placeholder={strings.pages.login.password}
                    secureTextEntry={true}
                    leftIcon={
                        <Icon
                            name='lock'
                            size={24}
                            color='black'
                            style={{marginRight: 10}}
                        />
                    }
                    containerStyle={styles.smallMargin}
                    disabled={this.state.loading}
                    onChangeText={this.handlePassword}
                    errorMessage={this.state.passwordValidationError}
                    value={this.state.password}
                    autoCapitalize="none"
                />

                <Text
                    style={{alignSelf: "flex-start", marginLeft: 20, marginBottom: 5}}
                    onPress={() => Actions.push("passwordReset")}
                >
                    Forgot password?
                </Text>

                <Button
                    title={strings.pages.login.login.toUpperCase()}
                    containerStyle={styles.loginButton}
                    disabled={this.state.loading || !this.state.email || !this.state.password}
                    onPress={this.tryLogin}
                />

                <Text style={styles.orDivider}>{ strings.pages.login.or.toUpperCase() }</Text>

                <Button
                    title={strings.pages.login.signup.toUpperCase()}
                    containerStyle={styles.signupButton}
                    disabled={this.state.loading}
                    onPress={Actions.signUp}
                />
                {/*</ImageBackground>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
    },

    imageBackground: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
});

function mapDispatchToProps(dispatch) {
    return {
        setToken: (token) => dispatch(createAction(ACTION_TYPES.SET_TOKEN, token)),
        dispatch
    };
}

export default connect(null, mapDispatchToProps)(Login);
