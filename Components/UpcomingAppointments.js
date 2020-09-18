import React, {Component} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {getAuthedAPI} from '../api';
import moment from 'moment';
import HeaderWithBackButton from './HeaderWithBackButton';
import {ListItem, Text} from 'react-native-elements';
import {boundMethod} from 'autobind-decorator';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {APPOINTMENT_TIME_FORMAT} from '../consts';


class AppointmentListItem extends Component {
    constructor(props) {
        super(props);

        // console.log("appointment", this.props.appointment.startTime);
    }

    @boundMethod
    onTap() {
        Actions.push("viewAppointment", {
            uuid: this.props.uuid
        });
    }

    render(): React.ReactNode {
        return (
            <TouchableOpacity
                style={styles.listItemTouchableOpacity}
                onPress={this.onTap}
            >
                <View style={styles.listItemView}>
                    <Text style={{fontWeight: "600"}}>{this.props.name} @ {this.props.startTime}</Text>
                    <Icon
                        name="chevron-right"
                    />
                </View>
            </TouchableOpacity>
        );
    }
}


export default class UpcomingAppointments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appointments: null
        }
    }

    componentDidMount() {
        getAuthedAPI()
            .getMyAppointments()
            .then((response) => {
                const serverAppointments = response.result;
                if (serverAppointments.length === 0) {
                    this.setState({
                        appointments: []
                    });
                } else {
                    const appointments  = [];

                    for (const appointment of serverAppointments) {
                        appointments.push({
                            uuid: appointment.uuid,
                            providerUUID: appointment.providerUUID,
                            startTime: moment.utc(appointment.start_time),
                            endTime: moment.utc(appointment.end_time),
                            fullName: appointment.patient_full_name
                        })
                    }

                    this.setState({
                        appointments
                    });
                }
            })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <HeaderWithBackButton
                    headerText="Appointments"
                />
                <ScrollView>
                    {this.state.appointments !== null &&
                        <View style={{flex: 1}}>
                            {this.state.appointments.map((appointment, i) =>
                                <ListItem
                                    key={i}
                                    Component={AppointmentListItem}
                                    name={appointment.fullName}
                                    uuid={appointment.uuid}
                                    startTime={appointment.startTime.local().format(APPOINTMENT_TIME_FORMAT)}
                                />
                            )}
                        </View> ||
                        <ActivityIndicator />
                        }
                </ScrollView>
            </View>
        );
    }
}

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
