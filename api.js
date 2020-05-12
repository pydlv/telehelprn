import Config from "react-native-config";
import axios from "axios";
import buildUrl from "build-url";
import moment from "moment";

const partial = (func, ...args) => (...rest) => func(...args, ...rest);

const API_HOST = Config.API_HOST;

// Wrapper function so we don't have to manually provide the same host for every endpoint.
const hostUrl = partial(buildUrl, "http://" + API_HOST);


export async function login(email, password) {
    const url = hostUrl({
        path: '/login'
    });

    const result = await axios.post(url, {
        email,
        password
    });

    return result.data;
}


export async function signUp(email, password) {
    const url = hostUrl({
        path: "/signup"
    });

    const result = await axios.post(url, {
        email,
        password
    });

    return result.data;
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
                    session: this.token // todo: Make sure this is a secure place for it
                }
            }
        });
    }

    async signOut() {
        const url = hostUrl({
            path: "/signout"
        });

        const result = await this.instance.post(url);

        return result.data;
    }

    async editProfile(firstName, lastName, birthDate, bio) {
        const url = hostUrl({
            path: "/editprofile"
        });

        const result = await this.instance.post(url, {
            first_name: firstName,
            last_name: lastName,
            birthday: birthDate,
            bio
        });

        return result.data;
    }

    async getProfile() {
        const url = hostUrl({
            path: "/getprofile"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async getAssignedProvider() {
        const url = hostUrl({
            path: "/getassignedprovider"
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

        const result = await this.instance.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
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

    async scheduleAppointment(time) {
        const url = hostUrl({
            path: "/schedule-appointment"
        });

        const result = await this.instance.post(url, {
            time: time.toISOString()
        });

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
}

let authedAPI = null;

export function createAuthedAPI(token): AuthenticatedAPI {
    authedAPI = new AuthenticatedAPI(token);

    return authedAPI;
}

export function getAuthedAPI(): AuthenticatedAPI {
    return authedAPI;
}
