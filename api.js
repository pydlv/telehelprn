import Config from "react-native-config";
import axios from "axios";
import buildUrl from "build-url";

const partial = (func, ...args) => (...rest) => func(...args, ...rest);

const API_HOST = Config.API_HOST;

const hostUrl = partial(buildUrl, "http://" + API_HOST);

export async function getHome() {
    // Just wrote this as a connection test
    const url = hostUrl({
        path: '/'
    });

    console.log("URL: ", url);

    const result = await axios.get(url);

    return result.data;
}
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

export default {
    getHome,
    login
}