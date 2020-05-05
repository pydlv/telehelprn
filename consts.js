import Config from "react-native-config";

export const AccountType = Object.freeze({
    User: 1,
    Provider: 2,
    Admin: 3
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
