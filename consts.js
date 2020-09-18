import Config from "react-native-config";

export const AccountType = Object.freeze({
    User: "u",
    Provider: "p"
});

export const DayOfWeek = Object.freeze({
    Sunday: 1,
    Monday: 1 << 1,
    Tuesday: 1 << 2,
    Wednesday: 1 << 3,
    Thursday: 1 << 4,
    Friday: 1 << 5,
    Saturday: 1 << 6
});

export const S3_HOST = Config.S3_HOST;

export const DEBUG = Config.ENV === "development";  // Are we debugging?

export const APPOINTMENT_TIME_FORMAT = "dddd, MMMM Do, LT";
