import React, {Component} from "react";
import {StyleSheet, View} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import strings from "../strings";
import {boundMethod} from "autobind-decorator";
import api from "../api";
import globalStyles from "../globalStyles";
import {Actions} from "react-native-router-flux";
import {connect, useDispatch} from "react-redux";
import {ACTION_TYPES, createAction} from "../redux/actions";

class Login extends Component {
    constructor() {
        super();

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
            this.props.setToken(response.token);
        }).catch((error) => {
            const {response} = error;

            console.log(response.data);

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
        }).finally(() => {
            this.setState({
                password: "",
                loading: false
            });
        });
    }

    render() {
        return (
            <View style={globalStyles.container}>
                <Text h1>{strings.appName}</Text>

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
                />

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
    }
});

function mapDispatchToProps(dispatch) {
    return {
        setToken: (token) => dispatch(createAction(ACTION_TYPES.STORE_TOKEN, token))
    };
}

export default connect(null, mapDispatchToProps)(Login);