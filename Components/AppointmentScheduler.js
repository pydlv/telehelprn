import React, {Component} from "react";
import {ActivityIndicator, ScrollView, View, StyleSheet} from "react-native";
import {getAuthedAPI} from "../api";
import {connect} from "react-redux";
import {ListItem, Text, Button} from "react-native-elements";
import HeaderWithBackButton from "./HeaderWithBackButton";
import {AvailabilitySchedule} from "../util";
import ScheduleViewer from "./ScheduleViewer";
import moment from "moment";
import {boundMethod} from "autobind-decorator";
import {Actions} from "react-native-router-flux";
import strings from "../strings";
import {sprintf} from "sprintf-js";
import DateTimePicker from "react-native-modal-datetime-picker";

class PossibleAppointment {
    constructor(moment) {
        this.moment = moment;
    }
}

const APPOINTMENT_TIME_FORMAT = "ddd, MMMM Do, h:mm a";

class AppointmentScheduler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            schedules: undefined,
            possibleAppointments: undefined,
            startDate: moment(),
            endDate: moment().add(7, "days"),
            startDatePickerVisible: false,
            endDatePickerVisible: false,
            searchDateValidationError: null,
            appointmentRequests: null
        };
    }

    componentDidMount() {
        // Fetch availability schedules
        getAuthedAPI()
            .getAvailabilitySchedules(this.props.provider.uuid)
            .then((response) => {
                const schedules = response.result.map((serverObj) => AvailabilitySchedule.fromServerObject(serverObj));
                this.setState({
                    schedules
                })
            });

        // Fetch appointment requests
        getAuthedAPI()
            .getAppointmentRequests()
            .then((requests) => {
                this.setState({
                    appointmentRequests: requests
                })
            });

        this.updateSearch();
    }

    @boundMethod
    onAppointmentSelect(appointment) {
        Actions.push("confirmPrompt", {
            title: strings.pages.appointmentScheduler.confirmAppointment,
            subtitle: sprintf(
                strings.pages.appointmentScheduler.confirmSubtitle,
                appointment.moment.format(APPOINTMENT_TIME_FORMAT)
            ),
            onConfirm: () => {
                getAuthedAPI()
                    .requestAppointment(appointment.moment)
                    .then(() => {
                        alert("Appointment requested successfully. You will be notified when your provider accepts the request.");
                        Actions.refresh({key: Math.random()})
                    })
            },
            onCancel: () => {}
        });
    }

    @boundMethod
    toggleStartDatePicker() {
        this.setState((oldState) => {
            return {
                startDatePickerVisible: !oldState.startDatePickerVisible
            }
        })
    }

    @boundMethod
    toggleEndDatePicker() {
        this.setState((oldState) => {
            return {
                endDatePickerVisible: !oldState.endDatePickerVisible
            }
        })
    }

    calcSearchDateValidationError(dateEnd, dateStart) {
        let searchDateValidationError = null;
        if (dateEnd.diff(dateStart, "days") > 7) {
            searchDateValidationError = strings.pages.appointmentScheduler.searchDatesTooFarApart;
        }
        return searchDateValidationError;
    }

    @boundMethod
    onSelectStartDate(date) {
        const startMoment = moment(date);

        const searchDateValidationError = this.calcSearchDateValidationError(this.state.endDate, startMoment);

        this.setState({
            possibleAppointments: undefined,
            startDate: startMoment,
            startDatePickerVisible: false,
            searchDateValidationError
        }, searchDateValidationError === null ? this.updateSearch : undefined);
    }

    @boundMethod
    onSelectEndDate(date) {
        const endMoment = moment(date);

        const searchDateValidationError = this.calcSearchDateValidationError(endMoment, this.state.startDate);

        this.setState({
            possibleAppointments: undefined,
            endDate: endMoment,
            endDatePickerVisible: false,
            searchDateValidationError
        }, searchDateValidationError === null ? this.updateSearch : undefined);
    }

    @boundMethod
    onDateSelectCancel() {
        this.setState({
            startDatePickerVisible: false,
            endDatePickerVisible: false
        })
    }

    @boundMethod
    updateSearch() {
        getAuthedAPI()
            .getAvailableAppointments(this.state.startDate, this.state.endDate)
            .then((response) => {
                const times = response.result;
                const possibleAppointments = [];
                times.forEach((time) => {
                    possibleAppointments.push(new PossibleAppointment(moment.utc(time).local()))
                });

                this.setState({
                    possibleAppointments
                });
            })
    }

    @boundMethod
    cancelRequest(uuid) {
        getAuthedAPI()
            .declineAppointmentRequest(uuid)
            .then(() => {
                alert("Appointment request canceled successfully.");
                Actions.refresh({key: Math.random()});
            })
    }

    render() {
        return (
            <ScrollView>
                <HeaderWithBackButton headerText={strings.pages.appointmentScheduler.headerText} />
                <View style={{margin: 20, marginBottom: 0}}>
                    <Text h4>Your appointment requests:</Text>
                    {this.state.appointmentRequests === null &&
                        <Text>Loading</Text> ||
                        <View>
                            {this.state.appointmentRequests.length &&
                                this.state.appointmentRequests.map(request =>
                                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                                        <Text style={style.appointmentRequest}>{moment.utc(request.start_time).local().format("ddd, MM/DD @ h:mma")}</Text>
                                        <Button
                                            title="Cancel"
                                            buttonStyle={{backgroundColor: "red"}}
                                            onPress={() => this.cancelRequest(request.uuid)}
                                        />
                                    </View>
                                ) ||
                                <Text>You do not have any pending appointment requests. You can create one by selecting a time below.</Text>
                            }
                        </View>
                    }
                    <Text h4 style={{marginTop: 10}}>{strings.pages.appointmentScheduler.yourProvidersSchedule}</Text>
                    <ScheduleViewer
                        schedules={this.state.schedules}
                    />
                    <View style={{marginTop: 20, marginBottom: 0}}>
                        <Text h4 style={{marginBottom: 10}}>Search</Text>
                        <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            <Text>Start date:</Text>
                            <Button
                                title={this.state.startDate.format("M-D-YYYY")}
                                onPress={this.toggleStartDatePicker}
                            />
                            <DateTimePicker
                                isVisible={this.state.startDatePickerVisible}
                                mode="date"
                                date={this.state.startDate.toDate()}
                                onConfirm={this.onSelectStartDate}
                                onCancel={this.onDateSelectCancel}
                            />
                            <Text>End date:</Text>
                            <Button
                                title={this.state.endDate.format("M-D-YYYY")}
                                onPress={this.toggleEndDatePicker}
                            />
                            <DateTimePicker
                                isVisible={this.state.endDatePickerVisible}
                                mode="date"
                                date={this.state.startDate.toDate()}
                                onConfirm={this.onSelectEndDate}
                                onCancel={this.onDateSelectCancel}
                            />
                        </View>
                        {this.state.searchDateValidationError &&
                            <Text style={{color: "red"}}>{this.state.searchDateValidationError}</Text>
                        }
                    </View>
                </View>
                {this.state.possibleAppointments !== undefined &&
                    this.state.possibleAppointments.map((appointment, i) => {
                        return (
                            <ListItem
                                key={i}
                                bottomDivider
                                onPress={() => this.onAppointmentSelect(appointment)}
                            >
                                <ListItem.Content>
                                    <ListItem.Title>
                                        {appointment.moment.format(APPOINTMENT_TIME_FORMAT)}
                                    </ListItem.Title>
                                </ListItem.Content>
                                <ListItem.Chevron />
                            </ListItem>
                        );
                    })
                    ||
                    <ActivityIndicator style={{marginTop: 20}} />
                }
            </ScrollView>
        );
    }
}


const style = StyleSheet.create({
    appointmentRequest: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 18
    }
});


function mapStateToProps(state) {
    return {
        provider: state.provider
    }
}

export default connect(mapStateToProps)(AppointmentScheduler);
