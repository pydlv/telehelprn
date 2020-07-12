import ConnectyCube from "react-native-connectycube";
import {DEBUG} from './consts';

const CREDENTIALS = {
    appId: 21,
    authKey: "hhf87hfushuiwef",
    authSecret: "jjsdf898hfsdfk"
};

const CONFIG = {
    debug: { mode: DEBUG ? 1 : 0 } // enable DEBUG mode (mode 0 is logs off, mode 1 -> console.log())
};

ConnectyCube.init(CREDENTIALS);
