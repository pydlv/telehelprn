import {View, StyleSheet, ActivityIndicator} from "react-native";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {daysOfWeekString} from "../util";
import {Button, Text} from "react-native-elements";

class ScheduleViewer extends Component {
    renderScheduleRow(uuid, days, startTime, endTime) {
        return (
            <View style={styles.row} key={uuid}>
                <Text style={styles.cell}>{days}</Text>
                <Text style={styles.cell}>{startTime} - {endTime}</Text>
                {this.props.showDelete &&
                    <Button
                        title="Delete"
                        buttonStyle={{backgroundColor: "red"}}
                        onPress={() => this.props.onDeletePress(uuid)}
                    />
                }
            </View>
        );
    }

    render() {
        return (
            <View>
                {this.props.schedules !== undefined &&
                    this.props.schedules.map((schedule) => {
                        const days = daysOfWeekString(schedule.daysOfWeek);
                        const start = schedule.startTime.format("h:mm a");
                        const end = schedule.endTime.format("h:mm a");
                        const uuid = schedule.uuid;

                        return this.renderScheduleRow(uuid, days, start, end);
                    }) ||
                    <ActivityIndicator />
                }
            </View>
        );
    }
}

ScheduleViewer.defaultProps = {
    schedules: undefined,
    showDelete: false,
    onDeletePress: () => {}
}

ScheduleViewer.propTypes = {
    schedules: PropTypes.array,
    showDelete: PropTypes.bool,
    onDeletePress: PropTypes.func
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
    }
});

export default ScheduleViewer;