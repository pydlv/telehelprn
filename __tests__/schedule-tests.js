import {AvailabilitySchedule} from "../util";

it("schedule overlap test", () => {
    const t1 = AvailabilitySchedule.fromServerObject({
        start_date: "2019-10-02",
        end_date: "2019-10-10",
        start_time: "10:00",
        end_time: "18:00",
        days_of_week: 127
    });

    const t2 = AvailabilitySchedule.fromServerObject({
        start_date: "2019-10-01",
        end_date: "2019-10-03",
        start_time: "00:00",
        end_time: "10:01",
        days_of_week: 127
    });

    expect(t1.overlaps(t2)).toBe(true);
});
