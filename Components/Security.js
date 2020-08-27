import React, {Component} from "react";
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Input, Text} from "react-native-elements";
import strings from "../strings";
import {boundMethod} from "autobind-decorator";
import {getAuthedAPI} from "../api";

const initialPasswordFieldsState = {
    oldPassword: null,
    newPassword: null,
    confirmPassword: null,
    oldPasswordValidationError: null,
    newPasswordValidationError: null,
    confirmPasswordValidationError: null
}

export default class Security extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...initialPasswordFieldsState,
            verificationStatus: false,
            emailSent: false
        }

        getAuthedAPI().getEmailVerificationStatus().then((status) => {
            this.setState({verificationStatus: status});
        })
    }

    @boundMethod
    handleOldPassword(text) {
        this.setState({oldPassword: text});
    }

    @boundMethod
    handleNewPassword(text) {
        this.setState({newPassword: text});
    }

    @boundMethod
    onNewPasswordBlur() {
        this.setState({
            newPasswordValidationError: this.state.newPassword.length < 6 ?
                strings.pages.signUp.doesNotMeetPasswordRequirements
                : ""
        });

        this.checkPasswordConfirm();
    }

    @boundMethod
    handleConfirmPassword(text) {
        this.setState({confirmPassword: text}, this.checkPasswordConfirm);
    }

    @boundMethod
    checkPasswordConfirm() {
        this.setState({
            confirmPasswordValidationError:
                this.state.newPassword !== this.state.confirmPassword && this.state.confirmPassword
                    ? strings.pages.signUp.noPasswordMatch
                    : null
        });
    }

    @boundMethod
    doChangePassword() {
        getAuthedAPI()
            .changePassword(this.state.oldPassword, this.state.newPassword)
            .then(() => {
                this.setState({
                    ...initialPasswordFieldsState
                });
                alert("Password was successfully changed.");
            })
            .catch(() => {
                alert("Failed to update password. Check that you entered your old password correctly.");
            })
    }

    changePasswordButtonEnabled() {
        return !this.state.newPasswordValidationError
            && !this.state.passwordConfirmValidationError
            && !this.state.oldPasswordValidationError
            && this.state.oldPassword
            && this.state.newPassword
            && this.state.confirmPassword;
    }

    @boundMethod
    requestResendVerification() {
        getAuthedAPI().resendVerificationEmail().then(() => {
            this.setState({emailSent: true});
        })
    }

    render() {
        return (
            <ScrollView style={{margin: 15}}>
                <View>
                    <Text h4>Change Password</Text>
                    <Input
                        placeholder="Old Password"
                        secureTextEntry={true}
                        containerStyle={styles.smallMargin}
                        disabled={this.state.loading}
                        onChangeText={this.handleOldPassword}
                        errorMessage={this.state.oldPasswordValidationError}
                        autoCapitalize="none"
                        value={this.state.oldPassword}
                    />

                    <Input
                        placeholder="New Password"
                        secureTextEntry={true}
                        containerStyle={styles.smallMargin}
                        disabled={this.state.loading}
                        onChangeText={this.handleNewPassword}
                        errorMessage={this.state.newPasswordValidationError}
                        autoCapitalize="none"
                        onBlur={this.onNewPasswordBlur}
                        value={this.state.newPassword}
                    />

                    <Input
                        placeholder="Confirm New Password"
                        secureTextEntry={true}
                        containerStyle={styles.smallMargin}
                        disabled={this.state.loading}
                        onChangeText={this.handleConfirmPassword}
                        errorMessage={this.state.confirmPasswordValidationError}
                        onBlur={this.checkPasswordConfirm}
                        value={this.state.confirmPassword}
                        autoCapitalize="none"
                    />

                    <Button
                        title="Update Password"
                        containerStyle={styles.smallMargin}
                        onPress={this.doChangePassword}
                        disabled={!this.changePasswordButtonEnabled()}
                    />
                </View>
                <View style={{marginTop: 10}}>
                    <Text h4>Email Verification</Text>
                    {this.state.verificationStatus ?
                        <Text>Your email is verified!</Text>
                        :
                        <View>
                            {this.state.emailSent ?
                                <Text>Email sent! Please check your inbox.</Text>
                            :
                                <View>
                                    <Text>Please check your inbox for a verification email.</Text>
                                    <Button
                                        title="Resend"
                                        containerStyle={styles.smallMargin}
                                        onPress={this.requestResendVerification}
                                    />
                                </View>
                            }
                        </View>
                    }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    smallMargin: {
        margin: 5
    },
});
