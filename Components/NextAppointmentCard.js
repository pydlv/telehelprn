import React, {Component} from "react";
import {connect} from "react-redux";
import {ActivityIndicator, View} from "react-native";
import {Button, Card, Divider, Text} from "react-native-elements";
import strings from "../strings";
import {getAuthedAPI} from "../api";
import {Actions} from "react-native-router-flux";
import moment from "moment";
import {boundMethod} from "autobind-decorator";
import {AccountType, APPOINTMENT_TIME_FORMAT} from "../consts";

function pretty(days, hours, minutes) {
    const plurality = (s, v) => v === 1 ? s : s + "s";
    const daysStr = days + " " + plurality("day", days);
    const hoursStr = hours + " " + plurality("hour", hours);
    const minutesStr = minutes + " " + plurality("minute", minutes);

    const toJoin = [];
    if (days) toJoin.push(daysStr);
    if (hours) toJoin.push(hoursStr);
    if (minutes) toJoin.push(minutesStr);

    if (toJoin.length === 1) {
        return toJoin[0];
    } else if (toJoin.length === 2) {
        return toJoin.join(" and ");
    } else if (toJoin.length === 3) {
        const firstPart = toJoin.slice(0, 2);
        const lastPart = toJoin[2];
        return [firstPart.join(", "), lastPart].join(", and ");
    }
}

class NextAppointmentCard extends Component {
    intervalID = 0;

    constructor(props) {
        super(props);

        this.state = {
            appointment: undefined
        };
    }

    componentDidMount() {
        getAuthedAPI()
            .getMyAppointments()
            .then((response) => {
                const appointments = response.result;
                if (appointments.length === 0) {
                    this.setState({
                        appointment: null
                    });
                } else {
                    const nextAppointment = appointments[0];

                    const appointment = {
                        uuid: nextAppointment.uuid,
                        providerUUID: nextAppointment.providerUUID,
                        startTime: moment.utc(nextAppointment.start_time),
                        endTime: moment.utc(nextAppointment.end_time)
                    }

                    this.setState({
                        appointment
                    });
                }
            })

        // Necessary to update the "You will be able to join in ... and join session button every second.
        this.intervalID = setInterval(() => this.forceUpdate(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    timeUntilAbleToJoin() {
        const now = moment.utc().subtract(1, "minute");
        const start = this.state.appointment.startTime;
        const difDays = start.diff(now, "days");
        const difHours = start.diff(now, "hours") - (difDays * 24);
        const difMinutes = start.diff(now, "minutes") - (difDays * 1440 + difHours * 60);
        return pretty(difDays, difHours, difMinutes);
    }

    @boundMethod
    onConfirmCancelAppointment() {
        getAuthedAPI()
            .cancelAppointment(this.state.appointment.uuid)
            .then(() => Actions.refresh({key: Math.random()}))
    }

    @boundMethod
    onCancelPress() {
        Actions.push("confirmPrompt", {
            title: strings.pages.appointmentCard.cancelConfirmTitle,
            subtitle: sprintf(strings.pages.appointmentCard.cancelConfirmSubtitle, this.state.appointment.startTime.local().format(APPOINTMENT_TIME_FORMAT)),
            onConfirm: this.onConfirmCancelAppointment
        })
    }

    @boundMethod
    onEndEarlyConfirm() {
        getAuthedAPI()
            .endAppointmentEarly(this.state.appointment.uuid)
            .then(() => {
                Actions.refresh({key: Math.random()});
            })
            .catch(() => {
                alert("Failed to end appointment.");
                Actions.refresh({key: Math.random()});
            });
    }

    @boundMethod
    onEndEarly() {
        Actions.push("confirmPrompt", {
            title: "Are you sure you want to end your appointment early?",
            subtitle: "If you choose to end your appointment then you will be unable to join it again.",
            onConfirm: this.onEndEarlyConfirm
        })
    }

    @boundMethod
    onJoinSessionPress() {
        Actions.push("videoSession", {
            appointmentUUID: this.state.appointment.uuid
        })
    }

    render() {
        let cardContent;

        if (!this.state.appointment || this.state.appointment.endTime.clone().add(30, "minutes") < moment.utc()) {
            // The appointment is over and we're not within 30 minutes of it ending.
            cardContent = (
                <View>
                    <Text style={{marginBottom: 20}}>{strings.pages.appointmentCard.noAppointment}</Text>
                    {this.props.accountType === AccountType.User &&
                    <Button
                        buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                        title={strings.pages.appointmentCard.scheduleOneNow}
                        onPress={Actions.appointmentScheduler}
                    />
                    }
                </View>
            )
        } else if (this.state.appointment.endTime < moment.utc() && this.state.appointment.endTime.clone().add(30, "minutes") >= moment.utc()) {
            // The appointment has ended, and we are within 30 minutes of it ending.
            cardContent = (
                <View>
                    <Text style={{marginBottom: 20}}>Your appointment has ended!</Text>
                    {this.props.accountType === AccountType.User &&
                    <Button
                        buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                        title="Schedule Another Appointment"
                        onPress={Actions.appointmentScheduler}
                    />
                    }
                </View>
            )
        } else {
            cardContent = (
                <View>
                    {/*<Text>{strings.pages.appointmentCard.youHaveAnAppointment}</Text>*/}
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 3}}>
                        <Text>
                            {strings.pages.appointmentCard.startTime}
                        </Text>
                        <Text>{this.state.appointment.startTime.local().format(APPOINTMENT_TIME_FORMAT)}</Text>
                    </View>
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 3}}>
                        <Text>
                            {strings.pages.appointmentCard.endTime}
                        </Text>
                        <Text>{this.state.appointment.endTime.local().format(APPOINTMENT_TIME_FORMAT)}</Text>
                    </View>
                    <Divider style={{marginTop: 10, marginBottom: 10}} />
                    {this.state.appointment.startTime > moment.utc() &&
                    <Text style={{marginBottom: 10}}>
                        {sprintf(strings.pages.appointmentCard.youWillBeAbleToJoinIn, this.timeUntilAbleToJoin())}
                    </Text>
                    }
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                        <Button
                            title={strings.pages.appointmentCard.joinSession}
                            disabled={this.state.appointment.startTime > moment.utc()}
                            onPress={this.onJoinSessionPress}
                        />
                        {this.state.appointment.startTime > moment.utc() ?
                            <Button
                                title={strings.pages.appointmentCard.changeOrCancel}
                                onPress={this.onCancelPress}
                            />
                            :
                            <Button
                                title="End Early"
                                onPress={this.onEndEarly}
                            />
                        }
                    </View>
                </View>
            )
        }

        return (
            <View>
                {(this.props.provider || this.props.accountType === AccountType.Provider) &&
                    <Card
                        title={strings.pages.appointmentCard.titleText}
                        titleStyle={{alignSelf: "flex-start"}}
                    >
                        {this.state.appointment === undefined ?
                            <ActivityIndicator />
                            :
                            cardContent
                        }
                    </Card>
                }
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        provider: state.provider,
        accountType: state.accountType
    };
}

export default connect(mapStateToProps)(NextAppointmentCard);
