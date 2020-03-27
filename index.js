/**
 * @format
 */

import './shim.js';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import crypto from 'isomorphic-webcrypto';

crypto.ensureSecure().then(() => {
    global.crypto = crypto;

    AppRegistry.registerComponent(appName, () => App);
});
