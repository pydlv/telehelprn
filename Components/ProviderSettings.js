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

export class AvailabilitySchedule {
    constructor(uuid, startDate, endDate, startTime, endTime, daysOfWeek) {
        this.uuid = uuid;
        this.startDate = startDate;
        this.endDate = endDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.daysOfWeek = daysOfWeek;
    }

    static fromServerObject(obj) {
        const startDate = moment.utc(obj.start_date, "YYYY-MM-DD");
        const endDate = moment.utc(obj.end_date, "YYYY-MM-DD");
        const startTime = moment.utc(obj.start_time, "H:m");
        const endTime = moment.utc(obj.end_time, "H:m");
        const daysOfWeek = obj.days_of_week;
        const uuid = obj.uuid;

        return new AvailabilitySchedule(uuid, startDate, endDate, startTime, endTime, daysOfWeek);
    }

    overlaps(other): boolean {
        if (this.startDate < other.endDate && other.startDate <= this.endDate) {
            // The two schedules are active over the same dates
            if (this.daysOfWeek & other.daysOfWeek) {
                // The two schedules share the same days of week, so now we must validate the times.
                if (this.startTime < other.endTime && other.startTime < this.endTime) {
                    return true;
                }
            }
        }

        return false;
    }
}

function daysOfWeekString(dowInt) {
    let result = [];
    if (dowInt & DayOfWeek.Monday) result.push("Mon");
    if (dowInt & DayOfWeek.Tuesday) result.push("Tue");
    if (dowInt & DayOfWeek.Wednesday) result.push("Wed");
    if (dowInt & DayOfWeek.Thursday) result.push("Thu");
    if (dowInt & DayOfWeek.Friday) result.push("Fri");
    if (dowInt & DayOfWeek.Saturday) result.push("Sat");
    if (dowInt & DayOfWeek.Sunday) result.push("Sun");
    return result.join(", ");
}

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
                const schedules = response.map((serverObj) => AvailabilitySchedule.fromServerObject(serverObj));
                this.setState({
                    schedules
                })
            });
    }

    deleteSchedule(uuid) {
        getAuthedAPI()
            .deleteScheduleByUUID(uuid)
            .then(() => {
                Actions.refresh({tabIndex: 1, key: Math.random()});
            })
    }

    renderScheduleRow(uuid, days, startTime, endTime) {
        return (
            <View style={styles.row} key={uuid}>
                <Text style={styles.cell}>{days}</Text>
                <Text style={styles.cell}>{startTime} - {endTime}</Text>
                <Button
                    title="Delete"
                    buttonStyle={{backgroundColor: "red"}}
                    onPress={() => this.deleteSchedule(uuid)}
                />
            </View>
        );
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

        const startTime = moment(this.state.startTime).format("HH:mm");
        const endTime = moment(this.state.endTime).format("HH:mm");

        getAuthedAPI()
            .createAvailabilitySchedule(dowFlag, startTime, endTime)
            .then((response) => {
                Actions.refresh({tabIndex: 1, key: Math.random()});
            })
            .catch(error => console.error(error));
    }

    render() {
        return (
            <ScrollView style={{margin: 15}}>
                <Text h4>{strings.pages.providerSettings.yourAvailabilitySchedule}</Text>
                {this.state.schedules !== undefined &&
                    this.state.schedules.map((schedule) => {
                        const days = daysOfWeekString(schedule.daysOfWeek);
                        const start = schedule.startTime.format("h:mm a");
                        const end = schedule.endTime.format("h:mm a");
                        const uuid = schedule.uuid;

                        return this.renderScheduleRow(uuid, days, start, end);
                    })
                }

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
    row: {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'row',
        marginTop: 20,
        alignItems: "center"
    },

    cell: {
        flex: 1,
        alignItems: "flex-end",
        textAlign: "left",
        marginRight: 20
    },

    formInput: {
        marginTop: 10,
        marginBottom: 10
    }
});

export default ProviderSettings;