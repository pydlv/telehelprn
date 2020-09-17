import React, {Component} from "react";
import {StyleSheet, View} from "react-native";
import globalStyles from "../globalStyles";
import strings from "../strings";
import {Button, Input, Text} from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import {boundMethod} from "autobind-decorator";
import * as api from "../api";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {connect} from "react-redux";
import {setLogin} from "../common";
import {AccountType} from "../consts";


function isValidEmail(text)
{
    return /\S+@\S+\.\S+/.test(text);
}


class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            email: "",
            password: "",
            passwordConfirm: "",
            emailValidationError: "",
            passwordValidationError: "",
            passwordConfirmValidationError: ""
        }
    }

    @boundMethod
    handleEmail(text) {
        this.setState({email: text});
    }

    @boundMethod
    emailBlur() {
        this.validateEmail();
    }

    @boundMethod
    handlePassword(text) {
        this.setState({password: text}, () => {
            if (this.state.passwordConfirm) {
                this.checkPasswordConfirm();
            }
        });
    }

    @boundMethod
    onPasswordBlur() {
        this.setState({
            passwordValidationError: this.state.password.length < 6 ?
                strings.pages.signUp.doesNotMeetPasswordRequirements
                : ""
        });

        this.checkPasswordConfirm();
    }

    @boundMethod
    handlePasswordConfirm(text) {
        this.setState({passwordConfirm: text}, this.checkPasswordConfirm);
    }

    @boundMethod
    validateEmail() {
        this.setState({
            emailValidationError: isValidEmail(this.state.email) ? "" : strings.pages.signUp.invalidEmail
        })
    }

    @boundMethod
    checkPasswordConfirm() {
        this.setState({
            passwordConfirmValidationError:
                this.state.password !== this.state.passwordConfirm && this.state.passwordConfirm
                ? strings.pages.signUp.noPasswordMatch
                : null
        });
    }

    @boundMethod
    doSignUp() {
        if (!this.state.email || !this.state.password) {
            return;
        }

        api.signUp(this.state.email, this.state.password)
            .then((response) => {
                if ("email" in response) {
                    this.setState({
                        emailValidationError: response.email[0]
                    });
                    return;
                }

                if ("password" in response) {
                    this.setState({
                        passwordValidationError: response.password[0]
                    });
                    return;
                }

                setLogin(this.props.dispatch, response.uuid, response.token, AccountType.User);
            })
            // .catch((error) => {
            //     const {response} = error;
            //
            //     if (response !== undefined) {
            //         if (response.status === 400) {
            //             if (response.data.error === "User already exists.") {
            //                 this.setState({
            //                     emailValidationError: strings.pages.signUp.userAlreadyExists
            //                 });
            //                 return;
            //             } else if ("email" in response.data.errors) {
            //                 this.setState({
            //                     emailValidationError: strings.pages.signUp.invalidEmail
            //                 });
            //                 return;
            //             } else if ("password" in response.data.errors) {
            //                 this.setState({
            //                     passwordValidationError: strings.pages.signUp.doesNotMeetPasswordRequirements
            //                 })
            //                 return;
            //             }
            //
            //             console.log("Got unknown 400:", response.data.error, response.data.errors);
            //         }
            //     }
            //
            //     return Promise.reject(error);
            // })
    }

    render() {
        return (
            <View style={globalStyles.container}>
                <Text h1>{strings.pages.signUp.headerText}</Text>

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
                    onBlur={this.emailBlur}
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
                    onBlur={this.onPasswordBlur}
                    autoCapitalize="none"
                />

                <Input
                    placeholder={strings.pages.signUp.confirmPassword}
                    secureTextEntry={true}
                    leftIcon={
                        <Icon
                            name='check'
                            size={20}
                            color='black'
                            style={{marginRight: 6}}
                        />
                    }
                    containerStyle={styles.smallMargin}
                    disabled={this.state.loading}
                    onChangeText={this.handlePasswordConfirm}
                    errorMessage={this.state.passwordConfirmValidationError}
                    onBlur={this.checkPasswordConfirm}
                    autoCapitalize="none"
                />

                <Button
                    title={strings.pages.signUp.signUpButton.toUpperCase()}
                    containerStyle={styles.loginButton}
                    disabled={this.state.loading ||
                        !this.state.email ||
                        !this.state.password ||
                        !this.state.passwordConfirm ||
                        !!this.state.emailValidationError ||
                        !!this.state.passwordValidationError ||
                        !!this.state.passwordConfirmValidationError ||
                        this.state.password !== this.state.passwordConfirm ||
                        !isValidEmail(this.state.email)
                    }
                    onPress={this.doSignUp}
                />
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
    }
});

function mapDispatchToProps(dispatch) {
    return {
        setToken: (token) => dispatch(createAction(ACTION_TYPES.SET_TOKEN, token)),
        dispatch
    };
}

export default connect(null, mapDispatchToProps)(SignUp);
