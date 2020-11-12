import Config from 'react-native-config';
import axios, {AxiosError, AxiosInstance} from 'axios';
import buildUrl from 'build-url';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {Platform} from "react-native";

const handleError = (error: AxiosError) => {
    // Do something with response error
    if (error.response && error.response.data) {
        if (error.response.data.error) {
            alert(error.response.data.error);
        } else if (error.response.status >= 400 && error.response.status < 500 && typeof(error.response.data) === "object") {
            const keys = Object.keys(error.response.data);
            for (const key of keys) {
                const value = error.response.data[key];

                if (value) {
                    alert(key + ": " + value);
                }
            }
        } else if (error.response.status === 500) {
            alert("Something unexpected went wrong. Please try again and report this problem if it persists.");
        }
    }
    return Promise.reject(error);
}

axios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, handleError);

const partial = (func: Function, ...args: any[]) => (...rest: any[]) => func(...args, ...rest);

const API_HOST = Config.API_HOST + "/api";

// Wrapper function so we don't have to manually provide the same host for every endpoint.
const hostUrl = partial(buildUrl, API_HOST);


export async function login(email: string, password: string) {
    const url = hostUrl({
        path: '/api-token-auth/'
    });

    const result = await axios.post(url, {
        username: email.toLowerCase(),
        password
    });

    return result.data;
}


export async function signUp(email: string, password: string) {
    const url = hostUrl({
        path: "/signup/"
    });

    const result = await axios.post(url, {
        email,
        password,
        confirm_password: password
    });

    return result.data;
}


export async function requestPasswordReset(email: string) {
    const url = hostUrl({
        path: "/request-password-reset/"
    });

    const result = await axios.post(
        url,
        {
            email: email.toLowerCase()
        }
    );

    return result.status >= 200 && result.status < 300;
}

const createFormData = (photo: any, body={}) => {
    const data = new FormData();
    // @ts-ignore
    data.append("file", {
        // @ts-ignore
        name: photo.filename !== undefined ? photo.filename : "file",
        uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        type: "image/jpeg"
    });

    Object.keys(body).forEach(key => {
        // @ts-ignore
        data.append(key, body[key]);
    });

    return data;
};

class AuthenticatedAPI {
    private readonly token: string;
    private instance: AxiosInstance;

    constructor(token: string) {
        this.token = token;

        this.instance = axios.create({
            headers: {
                common: {
                    Authorization: `Token ${this.token}`
                }
            }
        });

        this.instance.interceptors.response.use(
            response => response,
            handleError
        );
    }

    async editProfile(firstName: string, lastName: string, birthDate: string, bio: string) {
        const url = hostUrl({
            path: "/editprofile"
        });

        const result = await this.instance.post(url, {
            first_name: firstName,
            last_name: lastName,
            birthday: moment(birthDate, "MM-DD-YYYY").format("YYYY-MM-DD"),
            bio
        });

        return result.data;
    }

    async getProfile() {
        const url = hostUrl({
            path: "/profile/"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async getAssignedProvider() {
        const url = hostUrl({
            path: "/providers/getassignedprovider/"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async assignProvider(uuid: string) {
        const url = hostUrl({
            path: "/providers/assignprovider"
        });

        const result = await this.instance.post(url, {
            uuid
        });

        return result.data;
    }

    async listProviders() {
        const url = hostUrl({
            path: "/providers/listproviders"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async getProvider(uuid: string) {
        const url = hostUrl({
            path: `/providers/getprovider/${uuid}`,
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async uploadProfilePicture(photo: any) {
        const formData = createFormData(photo);

        const url = hostUrl({
            path: "/upload-profile-picture"
        });

        const result = await this.instance.put(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                // "Content-Disposition": "attachment; filename=file.jpg"
            }
        });

        return result.data;
    }

    async getAvailabilitySchedules(uuid=null) {
        const url = hostUrl({
            path: "/get-availability-schedules" + (uuid ? `/${uuid}` : "")
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async deleteScheduleByUUID(uuid: string) {
        const url = hostUrl({
            path: "/availability-schedules/delete"
        });

        const result = await this.instance.post(url, {
            uuid
        });

        return result.data;
    }

    async createAvailabilitySchedule(daysOfWeek: number, startTime: string, endTime: string) {
        const url = hostUrl({
            path: "/availability-schedules/create"
        });

        const result = await this.instance.post(url, {
            start_date: null,
            end_date: null,
            days_of_week: daysOfWeek,
            start_time: startTime,
            end_time: endTime
        });

        return result.data;
    }

    async getMyAppointments() {
        const url = hostUrl({
            path: "/get-my-appointments"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async getAvailableAppointments(startDate: moment.Moment, endDate: moment.Moment) {
        const url = hostUrl({
            path: "/get-available-appointments"
        });

        const result = await this.instance.post(url, {
            start_date: startDate.clone().format("YYYY-MM-DD"),
            end_date: endDate.clone().format("YYYY-MM-DD")
        });

        return result.data;
    }

    async requestAppointment(time: moment.Moment) {
        const url = hostUrl({
            path: "/appointments/create-request/"
        });

        const result = await this.instance.post(url, {
            time: time.toISOString()
        });

        return result.data;
    }


    async getNumPendingAppointmentRequests() {
        const url = hostUrl({
            path: "/appointments/num-pending-requests/"
        });

        const result = await this.instance.get(url);

        return result.data;
    }


    async getAppointmentRequests() {
        const url = hostUrl({
            path: "/appointments/get-my-requests/"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async declineAppointmentRequest(uuid: string) {
        const url = hostUrl({
            path: `/appointments/decline-request/${uuid}`
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async acceptAppointmentRequest(uuid: string) {
        const url = hostUrl({
            path: `/appointments/accept-request/${uuid}`
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async cancelAppointment(uuid: string) {
        const url = hostUrl({
            path: "/cancel-appointment"
        });

        const result = await this.instance.post(url, {
            uuid
        });

        return result.data;
    }

    async endAppointmentEarly(uuid: string) {
        const url = hostUrl({
            path: `/end-appointment/${uuid}`
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async getOTSessionIdAndToken(appointmentUUID: string) {
        const url = hostUrl({
            path: `/get-ot-token/${appointmentUUID}`
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async changePassword(oldPassword: string, newPassword: string) {
        const url = hostUrl({
            path: '/change-password/'
        });

        const result = await this.instance.post(
            url,
            {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: newPassword
            }
        );

        return result.data;
    }

    async getEmailVerificationStatus() {
        const url = hostUrl({
            path: '/verify/status/'
        });

        const result = await this.instance.get(url);

        return result.data.result;
    }

    async resendVerificationEmail() {
        const url = hostUrl({
            path: '/verify/resend/'
        });

        const result = await this.instance.post(url);

        return result.data.message;
    }

    async registerDevice(token: string) {
        const isAndroid = DeviceInfo.getSystemName() === "Android";

        const url = hostUrl({
            path: isAndroid ? "/device/gcm/" : "/device/apns/"
        });

        const result = await this.instance.post(url, {
            registration_id: token,
            cloud_message_type: isAndroid ? "FCM" : "APNS",
            application_id: isAndroid ? "telehelp_push_fcm" : "telehelp_push_apns"
        });

        return result.data;
    }
}

// https://stackoverflow.com/a/42304473/2621270
const globalAny: any = global;

let authedAPI: AuthenticatedAPI | null = null;

export function createAuthedAPI(token: string): AuthenticatedAPI {
    authedAPI = new AuthenticatedAPI(token);

    const registerCallback = (token: string) => {
        authedAPI!
            .registerDevice(token)
            .catch((error) => {
                const data = error.response.data;
                if (error.response.status === 400 && data.registration_id) {
                    console.log("Device already registered!");
                }
            })
    }

    if (globalAny.deviceToken) {
        registerCallback(globalAny.deviceToken);
    } else {
        globalAny.registerCallback = registerCallback;
    }


    return authedAPI;
}

export function getAuthedAPI(): AuthenticatedAPI | null {
    return authedAPI;
}
