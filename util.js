import {DayOfWeek} from "./consts";
import moment from "moment";

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function shiftDowFlagByDelta(dowFlag, delta) {
    if (delta === 1) {
        // Left shift the week days by 1, since we overflowed
        // If Saturday is 1, then we need to remove the greatest bit and move it to the last one.
        // I.e. Saturday -> Sunday
        const appendOne = DayOfWeek.Saturday & dowFlag;
        dowFlag <<= 1;
        dowFlag &= 127;
        if (appendOne) {
            dowFlag |= DayOfWeek.Sunday
        }
    } else if (delta === -1) {
        // We underflowed. Shift right
        const prependOne = DayOfWeek.Sunday & dowFlag;
        dowFlag >>= 1;
        if (prependOne) {
            dowFlag |= DayOfWeek.Saturday;
        }
    } else {
        console.assert(delta === 0);
    }
    return dowFlag;
}

export class AvailabilitySchedule {
    constructor(uuid, startTime, endTime, daysOfWeek) {
        this.uuid = uuid;
        this.startTime = startTime;
        this.endTime = endTime;
        this.daysOfWeek = daysOfWeek;
    }

    static fromServerObject(obj) {
        const startTimeUTC = moment.utc(obj.start_time, "H:m");
        const endTimeUTC = moment.utc(obj.end_time, "H:m");
        const startTimeLocal = startTimeUTC.clone().local();
        const endTimeLocal = endTimeUTC.clone().local();
        const daysOfWeekUTC = obj.days_of_week;
        const uuid = obj.uuid;

        const delta = startTimeLocal.date() - startTimeUTC.date();
        let dowFlag = daysOfWeekUTC;

        // We have to adjust the week dates, since converting to UTC may overflow or underflow the day of week
        dowFlag = shiftDowFlagByDelta(dowFlag, delta);

        return new AvailabilitySchedule(uuid, startTimeLocal, endTimeLocal, dowFlag);
    }

    overlaps(other): boolean {
        if (this.startDate < other.endDate && other.startDate < this.endDate) {
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

export function daysOfWeekString(dowInt) {
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