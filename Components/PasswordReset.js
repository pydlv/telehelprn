import React, {Component} from "react";
import {View} from 'react-native';
import {Button, Input, Text} from 'react-native-elements';
import globalStyles from '../globalStyles';
import strings from '../strings';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';
import {boundMethod} from 'autobind-decorator';
import {getAuthedAPI} from '../api';
import * as api from '../api';

export default class PasswordReset extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            email: ''
        }
    }

    @boundMethod
    requestReset() {
        this.setState({
            loading: true
        });

        api.requestPasswordReset(this.state.email)
            .then(() => {
                alert("If an account with that email exists, then you will receive a password reset email.");
                Actions.pop();
            })
            .catch(() => {
                alert("Failed to request password reset.");
            })
            .finally(() => {
                this.setState({
                    loading: false
                });
            });
    }

    @boundMethod
    handleEmail(newEmail) {
        this.setState({
            email: newEmail
        });
    }

    render() {
        return (
            <View style={globalStyles.container}>
                <Text h2 style={{marginTop: 20, marginBottom: 20}}>Reset Password</Text>
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
                    containerStyle={{margin: 5}}
                    disabled={this.state.loading}
                    onChangeText={this.handleEmail}
                    // errorMessage={this.state.emailValidationError}
                    autoCapitalize="none"
                />

                <Button
                    title="Request Reset"
                    containerStyle={{width: "40%", marginTop: 10}}
                    disabled={this.state.loading}
                    onPress={this.requestReset}
                />
            </View>
        );
    }
}
