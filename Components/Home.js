import React, {Component} from "react";
import {View} from "react-native";
import {Button, Card, Header, Text} from "react-native-elements";
import {connect} from "react-redux";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {boundMethod} from "autobind-decorator";
import {getAuthedAPI} from "../api";
import Icon from "react-native-vector-icons/FontAwesome";
import strings from "../strings";
import {sprintf} from "sprintf-js";
import {loadProvider} from "../common";
import {Actions} from "react-native-router-flux";

class Home extends Component {
    componentDidMount(): void {
        // Make sure the profile is completed
        if (!this.props.isProfileComplete) {
            // Set timeout 0 due to this bug https://github.com/aksonov/react-native-router-flux/issues/1125
            setTimeout(()=>Actions.editProfile(), 0);
            return; // No need to continue to fetch the provider.
        }

        loadProvider(this.props.dispatch);
    }

    @boundMethod
    signOut() {
        getAuthedAPI().signOut().finally(() => {
            this.props.resetStore();
        });
    }

    render() {
        return (
            <View>
                <Header
                    placement="left"
                    centerComponent={{ text: sprintf(strings.pages.home.greetingText, this.props.firstName), style: { color: '#fff', fontSize: 24 } }}
                    rightComponent={
                        <View style={{display: "flex", flexDirection: "row"}}>
                            <Button
                                icon={
                                    <Icon
                                        name='cog'
                                        size={24}
                                        color="white"
                                    />
                                }
                                onPress={Actions.editProfile}
                                containerStyle={{marginRight:10}}
                            />
                            <Button
                                icon={
                                    <Icon
                                        name='sign-out'
                                        size={24}
                                        color="white"
                                    />
                                }
                                onPress={this.signOut}
                            />
                        </View>
                    }
                />
                <Card
                    title={strings.pages.home.yourProviderCardHeader}
                    titleStyle={{alignSelf: "flex-start"}}
                >
                    {this.props.provider === null ?
                        <View>
                            <Text style={{marginBottom: 20}}>
                                {strings.pages.home.noProviderSelected}
                            </Text>
                            <Button
                                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                                title={strings.pages.home.selectProviderButton.toUpperCase()}
                                onPress={Actions.providerList}
                            />
                        </View>
                        : <View>
                            <Text style={{marginBottom: 10}}>
                                Your provider is {this.props.provider.name}.
                            </Text>
                        </View>
                    }
                </Card>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        fullName: state.firstName + ' ' + state.lastName,
        firstName: state.firstName,
        provider: state.provider,
        isProfileComplete: state.firstName && state.lastName && state.birthDate,
        token: state.token
    };
}

function mapDispatchToProps(dispatch) {
    return {
        resetStore: () => dispatch(createAction(ACTION_TYPES.RESET_STORE)),
        dispatch
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);