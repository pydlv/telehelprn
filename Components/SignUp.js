import React, {Component} from "react";
import {View} from "react-native";
import globalStyles from "../globalStyles";
import strings from "../strings";
import {Button, Input, Text} from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import {boundMethod} from "autobind-decorator";
import {StyleSheet} from "react-native";

export default class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            email: "",
            password: "",
            passwordConfirm: "",
            emailValidationError: null,
            passwordValidationError: null,
            passwordConfirmValidationError: ""
        }
    }

    @boundMethod
    handleEmail(text) {
        this.setState({email: text});
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
    handlePasswordConfirm(text) {
        this.setState({passwordConfirm: text}, this.checkPasswordConfirm);
    }

    @boundMethod
    checkPasswordConfirm() {
        this.setState({
            passwordConfirmValidationError:
                this.state.password !== this.state.passwordConfirm && this.state.passwordConfirm
                ? "The passwords do not match."
                : null
        });
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
                    onBlur={this.checkPasswordConfirm}
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
                />

                <Button
                    title={strings.pages.signUp.signUpButton.toUpperCase()}
                    containerStyle={styles.loginButton}
                    disabled={this.state.loading ||
                        !this.state.email ||
                        !this.state.password ||
                        !this.state.passwordConfirm ||
                        this.state.password !== this.state.passwordConfirm
                    }
                    // onPress={this.doSignup}
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
