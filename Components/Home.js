import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Card, Header, Text} from 'react-native-elements';
import {connect} from 'react-redux';
import {ACTION_TYPES, createAction} from '../redux/actions';
import {boundMethod} from 'autobind-decorator';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon5 from "react-native-vector-icons/FontAwesome5";
import strings from '../strings';
import {sprintf} from 'sprintf-js';
import {loadProfile, loadProvider} from '../common';
import {Actions} from 'react-native-router-flux';
import {AccountType} from '../consts';
import NextAppointmentCard from './NextAppointmentCard';
import {getAuthedAPI} from '../api';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            numPendingAppointmentRequests: null
        }
    }

    componentDidMount(): void {
        // Load current provider
        loadProvider(this.props.dispatch);

        // Load profile
        loadProfile(this.props.dispatch)
            .then((profile) => {
                if (!profile.firstName || !profile.lastName || !profile.birthDate) {
                    // Profile is loaded, but our profile is not complete. Redirect user to edit profile.
                    // Set timeout 0 due to this bug https://github.com/aksonov/react-native-router-flux/issues/1125
                    setTimeout(()=>Actions.settings({showBackButton: false, type: "replace"}), 0);
                }
            });

        // Load num pending requests
        if (this.props.accountType === AccountType.Provider) {
            getAuthedAPI()
                .getNumPendingAppointmentRequests()
                .then((response) => {
                    this.setState({
                        numPendingAppointmentRequests: response.result
                    });
                })
        }
    }

    @boundMethod
    signOut() {
        this.props.resetStore();
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
                                    <Icon5
                                        name='sync'
                                        size={24}
                                        color="white"
                                    />
                                }
                                onPress={() => Actions.refresh({key: Math.random()})}
                                containerStyle={{marginRight:10}}
                            />
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
                    {this.state.numPendingAppointmentRequests !== null && this.state.numPendingAppointmentRequests > 0 &&
                        <Card>
                            <Card.Title style={{alignSelf: "flex-start"}}>
                                Pending Requests
                            </Card.Title>
                            <View>
                                <Text>You have {this.state.numPendingAppointmentRequests} pending request{this.state.numPendingAppointmentRequests > 1 ? 's' : ''}.</Text>
                                <Button
                                    containerStyle={{marginTop: 10}}
                                    title="View"
                                    onPress={Actions.pendingRequests}
                                />
                            </View>
                        </Card>
                    }

                    {this.props.accountType === AccountType.User &&
                        <Card>
                            <Card.Title style={{alignSelf: "flex-start"}}>
                                {strings.pages.home.yourProviderCardHeader}
                            </Card.Title>
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
                    {this.props.accountType === AccountType.Provider &&
                        <Card>
                            <Card.Title style={{alignSelf: "flex-start"}}>
                                Upcoming Appointments
                            </Card.Title>
                            <Button
                                title="View Upcoming Appointments"
                                onPress={() => Actions.push("upcomingAppointments")}
                            />
                        </Card>
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
