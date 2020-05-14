import React, {Component} from "react";
import {ScrollView, View} from "react-native";
import {Button, Card, Header, Text} from "react-native-elements";
import {connect} from "react-redux";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {boundMethod} from "autobind-decorator";
import {getAuthedAPI} from "../api";
import Icon from "react-native-vector-icons/FontAwesome";
import strings from "../strings";
import {sprintf} from "sprintf-js";
import {loadProfile, loadProvider} from "../common";
import {Actions} from "react-native-router-flux";
import {AccountType} from "../consts";
import NextAppointmentCard from "./NextAppointmentCard";

class Home extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(): void {
        loadProvider(this.props.dispatch);

        loadProfile(this.props.dispatch)
            .then((profile) => {
                if (!profile.firstName || !profile.lastName || !profile.birthDate) {
                    // Profile is loaded, but our profile is not complete. Redirect user to edit profile.
                    // Set timeout 0 due to this bug https://github.com/aksonov/react-native-router-flux/issues/1125
                    setTimeout(()=>Actions.settings({showBackButton: false, type: "replace"}), 0);
                }
            })
    }

    @boundMethod
    signOut() {
        getAuthedAPI().signOut().finally(() => {
            this.props.resetStore();
        });
    }

    render() {
        return (
            <ScrollView>
                <Header
                    placement="left"
                    centerComponent={{ text: sprintf(strings.pages.home.greetingText, this.props.profile && this.props.profile.firstName), style: { color: '#fff', fontSize: 24 } }}
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
                                onPress={Actions.settings}
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
                <View>
                    {this.props.accountType === AccountType.User &&
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
                                        {sprintf(strings.pages.home.yourProviderIs, this.props.provider.fullName)}
                                    </Text>
                                    <Button
                                        buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                                        title={strings.pages.home.changeProviderButton}
                                        onPress={Actions.providerList}
                                    />
                                </View>
                            }
                        </Card>
                    }
                    {(this.props.provider || this.props.accountType === AccountType.Provider) &&
                        <NextAppointmentCard />
                    }
                </View>
            </ScrollView>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.profile,
        provider: state.provider,
        token: state.token,
        accountType: state.accountType
    };
}

function mapDispatchToProps(dispatch) {
    return {
        resetStore: () => dispatch(createAction(ACTION_TYPES.RESET_STORE)),
        dispatch
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);