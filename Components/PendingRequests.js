import React, {Component} from 'react';
import HeaderWithBackButton from './HeaderWithBackButton';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {getAuthedAPI} from '../api';
import {ListItem, Text} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import {boundMethod} from 'autobind-decorator';
import {Actions} from 'react-native-router-flux';


class AppointmentRequestListItem extends Component {
    @boundMethod
    onAcceptAppointment() {
        getAuthedAPI()
            .acceptAppointmentRequest(this.props.uuid)
            .then(() => {
                alert("Appointment accepted successfully!");
                Actions.refresh({key: Math.random()});
            })
    }

    @boundMethod
    onDeclineAppointment() {
        getAuthedAPI()
            .declineAppointmentRequest(this.props.uuid)
            .then(() => {
                Actions.refresh({key: Math.random()});
            });
    }

    @boundMethod
    onTap() {
        Actions.push("acceptDeclinePrompt", {
            title: "Would you like to accept this appointment?",
            subtitle: `Would you like to accept ${this.props.name}'s appointment request for ${this.props.startTime}`,
            onAccept: this.onAcceptAppointment,
            onDecline: this.onDeclineAppointment
        });
    }

    render() {
        return (
            <View>
                <TouchableOpacity
                    style={styles.listItemTouchableOpacity}
                    onPress={this.onTap}
                >
                    <View style={styles.listItemView}>
                        <Text style={{fontWeight: "600"}}>{this.props.name} requests an appointment for {this.props.startTime}</Text>
                        <Icon
                            name="chevron-right"
                        />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}


export default class PendingRequests extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appointmentRequests: null
        }
    }

    componentDidMount() {
        // Fetch pending appointment requests
        getAuthedAPI()
            .getAppointmentRequests()
            .then((result) => {
                this.setState({
                    appointmentRequests: result
                })
            });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <HeaderWithBackButton
                    headerText="Pending Requests"
                    backType="reset"
                />
                <ScrollView>
                    {this.state.appointmentRequests !== null &&
                        <View>
                            {this.state.appointmentRequests.length &&
                                <View style={{flex: 1}}>
                                    {this.state.appointmentRequests.map((request, i) =>
                                        <ListItem
                                            key={i}
                                            Component={AppointmentRequestListItem}
                                            name={request.patient.first_name + " " + request.patient.last_name}
                                            uuid={request.uuid}
                                            startTime={moment.utc(request.start_time).local().format("dddd, MMMM Do [at] LT")}
                                        />
                                    )}
                                </View> ||
                                <Text>You have no more pending requests.</Text>
                            }
                        </View> ||
                        <Text>Loading</Text>
                    }
                </ScrollView>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    listItemTouchableOpacity: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingTop: 20,
        paddingBottom: 20
    },

    listItemView: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        marginLeft: 15,
        marginRight: 40,
        alignItems: "center"
    }
});
