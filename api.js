import Config from "react-native-config";
import axios from "axios";
import buildUrl from "build-url";

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

    async editProfile(firstName, lastName, birthDate) {
        const url = hostUrl({
            path: "/editprofile"
        });

        const result = await this.instance.post(url, {
            first_name: firstName,
            last_name: lastName,
            birthday: birthDate
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

    async getProvider() {
        const url = hostUrl({
            path: "/getprovider"
        });

        const result = await this.instance.get(url);

        return result.data;
    }

    async listProviders() {
        const url = hostUrl({
            path: "/listproviders"
        });

        const result = await this.instance.get(url);

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
