import {ScrollView, StyleSheet, View} from "react-native";
import React, {Component} from "react";
import {Button, CheckBox, Text} from "react-native-elements";
import {getAuthedAPI} from "../api";
import moment from "moment";
import {DayOfWeek} from "../consts";
import strings from "../strings";
import DateTimePicker from "react-native-modal-datetime-picker";
import {boundMethod} from "autobind-decorator";
import {sprintf} from "sprintf-js";
import {Actions} from "react-native-router-flux";
import {AvailabilitySchedule, daysOfWeekString, shiftDowFlagByDelta} from "../util";
import ScheduleViewer from "./ScheduleViewer";

class ProviderSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            schedules: undefined,
            selectedDays: {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            },
            startTimePickerVisible: false,
            endTimePickerVisible: false,
            startTime: moment().hour(10).minutes(0).toDate(),
            endTime: moment().hour(16).minutes(0).toDate()
        };
    }

    componentDidMount() {
        getAuthedAPI()
            .getAvailabilitySchedules()
            .then((response) => {
                const schedules = response.result.map((serverObj) => AvailabilitySchedule.fromServerObject(serverObj));
                this.setState({
                    schedules
                })
            });
    }

    @boundMethod
    deleteSchedule(uuid) {
        getAuthedAPI()
            .deleteScheduleByUUID(uuid)
            .then(() => {
                Actions.refresh({tabIndex: 2, key: Math.random()});
            })
    }

    onDayPressed(key) {
        const selectedDays = {
            ...this.state.selectedDays
        };
        selectedDays[key] = !selectedDays[key];
        this.setState({
            selectedDays
        });
    }

    @boundMethod
    onSelectStartTime(date) {
        this.setState({
            startTime: date,
            startTimePickerVisible: false
        });
    }

    @boundMethod
    onSelectEndTime(date) {
        this.setState({
            endTime: date,
            endTimePickerVisible: false
        });
    }

    @boundMethod
    onTimeSelectCancel() {
        this.setState({
            startTimePickerVisible: false,
            endTimePickerVisible: false
        });
    }

    @boundMethod
    onSubmit() {
        const {
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            sunday
        } = this.state.selectedDays;

        const dowFlag =
            (monday && DayOfWeek.Monday) |
            (tuesday && DayOfWeek.Tuesday) |
            (wednesday && DayOfWeek.Wednesday) |
            (thursday && DayOfWeek.Thursday) |
            (friday && DayOfWeek.Friday) |
            (saturday && DayOfWeek.Saturday) |
            (sunday && DayOfWeek.Sunday)
        ;

        const startTime = moment(this.state.startTime);
        const endTime = moment(this.state.endTime);
        const startTimeUTC = startTime.clone().utc();
        const endTimeUTC = endTime.clone().utc();

        // We have to adjust the week dates, since converting to UTC may overflow or underflow the day of week
        const delta = startTimeUTC.date() - startTime.date();

        const daysOfWeekUTC = shiftDowFlagByDelta(dowFlag, delta);

        getAuthedAPI()
            .createAvailabilitySchedule(daysOfWeekUTC, startTimeUTC.format("HH:mm"), endTimeUTC.format("HH:mm"))
            .then((response) => {
                Actions.refresh({tabIndex: 2, key: Math.random()});
            })
            .catch(() => {
                alert("Failed to create schedule. Please make sure that it doesn't overlap with any existing schedule.");
            })
    }

    render() {
        return (
            <ScrollView style={{margin: 15}}>
                <Text h4>{strings.pages.providerSettings.yourAvailabilitySchedule}</Text>

                <ScheduleViewer
                    schedules={this.state.schedules}
                    showDelete={true}
                    onDeletePress={this.deleteSchedule}
                />

                <View style={{marginTop: 20}}>
                    {/* days of the week */}
                    <Text h4>{strings.pages.providerSettings.addNewSchedule}</Text>
                    <View style={styles.formInput}>
                        <Text>{strings.pages.providerSettings.selectDaysOfWeek}</Text>
                        {Object.keys(this.state.selectedDays).map((key, i) => {
                            const isChecked = this.state.selectedDays[key];
                            return (
                                <CheckBox
                                    checked={isChecked}
                                    onPress={() => this.onDayPressed(key)}
                                    key={i}
                                    title={key[0].toUpperCase() + key.slice(1)}
                                />
                            );
                        })}
                    </View>

                    {/* start time */}
                    <View style={styles.formInput}>
                        <Text>{sprintf(strings.pages.providerSettings.selectedStartTime, moment(this.state.startTime).format("h:mm A"))}</Text>
                        <Button
                            title={strings.pages.providerSettings.changeStartTime}
                            onPress={() => this.setState({startTimePickerVisible: true})}
                            containerStyle={{width: "25%"}}
                        />
                        <DateTimePicker
                            isVisible={this.state.startTimePickerVisible}
                            mode="time"
                            date={this.state.startTime}
                            onConfirm={this.onSelectStartTime}
                            onCancel={this.onTimeSelectCancel}
                        />
                    </View>

                    {/* end time */}
                    <View style={styles.formInput}>
                        <Text>{sprintf(strings.pages.providerSettings.selectedEndTime, moment(this.state.endTime).format("h:mm A"))}</Text>
                        <Button
                            title={strings.pages.providerSettings.changeEndTime}
                            onPress={() => this.setState({endTimePickerVisible: true})}
                            containerStyle={{width: "25%"}}
                        />
                        <DateTimePicker
                            isVisible={this.state.endTimePickerVisible}
                            mode="time"
                            date={this.state.endTime}
                            onConfirm={this.onSelectEndTime}
                            onCancel={this.onTimeSelectCancel}
                        />
                    </View>

                    <Button
                        title={strings.pages.providerSettings.submitButton}
                        onPress={this.onSubmit}
                        containerStyle={{marginTop: 20}}
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formInput: {
        marginTop: 10,
        marginBottom: 10
    }
});

export default ProviderSettings;
