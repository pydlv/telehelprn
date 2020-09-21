import Config from "react-native-config";
import axios from "axios";
import buildUrl from "build-url";
import moment from 'moment';

const handleError = (error) => {
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

const partial = (func, ...args) => (...rest) => func(...args, ...rest);

const API_HOST = Config.API_HOST + "/api";

// Wrapper function so we don't have to manually provide the same host for every endpoint.
const hostUrl = partial(buildUrl, API_HOST);


export async function login(email, password) {
    const url = hostUrl({
        path: '/api-token-auth/'
    });

    const result = await axios.post(url, {
        username: email,
        password
    });

    return result.data;
}


export async function signUp(email, password) {
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


export async function requestPasswordReset(email) {
    const url = hostUrl({
        path: "/request-password-reset/"
    });

    const result = await axios.post(
        url,
        {email}
    );

    return result.status >= 200 && result.status < 300;
}

const createFormData = (photo, body={}) => {
    const data = new FormData();
    data.append("file", {
        name: photo.filename !== undefined ? photo.filename : "file",
        uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        type: "image/jpeg"
    });

    Object.keys(body).forEach(key => {
        data.append(key, body[key]);
    });

    return data;
};

class AuthenticatedAPI {
    constructor(token) {
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

    async editProfile(firstName, lastName, birthDate, bio) {
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
            path: "/getassignedprovider/"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async assignProvider(uuid) {
        const url = hostUrl({
            path: "/assignprovider"
        });

        const result = await this.instance.post(url, {
            uuid
        });

        return result.data;
    }

    async listProviders() {
        const url = hostUrl({
            path: "/listproviders"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async getProvider(uuid) {
        const url = hostUrl({
            path: `/getprovider/${uuid}`,
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async uploadProfilePicture(photo) {
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

    async deleteScheduleByUUID(uuid) {
        const url = hostUrl({
            path: "/availability-schedules/delete"
        });

        const result = await this.instance.post(url, {
            uuid
        });

        return result.data;
    }

    async createAvailabilitySchedule(daysOfWeek, startTime, endTime) {
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

    async getAvailableAppointments(startDate, endDate) {
        const url = hostUrl({
            path: "/get-available-appointments"
        });

        const result = await this.instance.post(url, {
            start_date: startDate.clone().format("YYYY-MM-DD"),
            end_date: endDate.clone().format("YYYY-MM-DD")
        });

        return result.data;
    }

    async requestAppointment(time) {
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

    async declineAppointmentRequest(uuid) {
        const url = hostUrl({
            path: `/appointments/decline-request/${uuid}`
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async acceptAppointmentRequest(uuid) {
        const url = hostUrl({
            path: `/appointments/accept-request/${uuid}`
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async cancelAppointment(uuid) {
        const url = hostUrl({
            path: "/cancel-appointment"
        });

        const result = await this.instance.post(url, {
            uuid
        });

        return result.data;
    }

    async endAppointmentEarly(uuid) {
        const url = hostUrl({
            path: `/end-appointment/${uuid}`
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async getOTSessionIdAndToken(appointmentUUID) {
        const url = hostUrl({
            path: `/get-ot-token/${appointmentUUID}`
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async changePassword(oldPassword, newPassword) {
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
}

let authedAPI = null;

export function createAuthedAPI(token): AuthenticatedAPI {
    authedAPI = new AuthenticatedAPI(token);

    return authedAPI;
}

export function getAuthedAPI(): AuthenticatedAPI {
    return authedAPI;
}
