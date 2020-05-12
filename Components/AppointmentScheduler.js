import React, {Component} from "react";
import {ActivityIndicator, ScrollView, View} from "react-native";
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
            endDatePickerVisible: false
        };
    }

    componentDidMount() {
        getAuthedAPI()
            .getAvailabilitySchedules(this.props.provider.uuid)
            .then((response) => {
                const schedules = response.map((serverObj) => AvailabilitySchedule.fromServerObject(serverObj));
                this.setState({
                    schedules
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
                    .scheduleAppointment(appointment.moment)
                    .then(Actions.home)
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

    @boundMethod
    onSelectStartDate(date) {
        this.setState({
            possibleAppointments: undefined,
            startDate: moment(date),
            startDatePickerVisible: false,
        }, this.updateSearch);
    }

    @boundMethod
    onSelectEndDate(date) {
        this.setState({
            possibleAppointments: undefined,
            endDate: moment(date),
            endDatePickerVisible: false
        }, this.updateSearch);
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
            .then((times) => {
                const possibleAppointments = [];
                times.forEach((time) => {
                    possibleAppointments.push(new PossibleAppointment(moment.utc(time).local()))
                });

                this.setState({
                    possibleAppointments
                });
            })
    }

    render() {
        return (
            <ScrollView>
                <HeaderWithBackButton headerText={strings.pages.appointmentScheduler.headerText} />
                <View style={{margin: 20, marginBottom: 0}}>
                    <Text h4>{strings.pages.appointmentScheduler.yourProvidersSchedule}</Text>
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
                        {/*<Button*/}
                        {/*    title="Search"*/}
                        {/*    containerStyle={{width: "25%"}}*/}
                        {/*/>*/}
                    </View>
                </View>
                {this.state.possibleAppointments !== undefined &&
                    this.state.possibleAppointments.map((appointment, i) => {
                        return (
                            <ListItem
                                key={i}
                                title={appointment.moment.format(APPOINTMENT_TIME_FORMAT)}
                                bottomDivider
                                chevron
                                onPress={() => this.onAppointmentSelect(appointment)}
                            />
                        );
                    })
                    ||
                    <ActivityIndicator />
                }
            </ScrollView>
        );
    }
}

function mapStateToProps(state) {
    return {
        provider: state.provider
    }
}

export default connect(mapStateToProps)(AppointmentScheduler);