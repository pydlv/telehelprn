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


export default {
    login,
    signUp
}