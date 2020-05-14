/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {Client} from 'bugsnag-react-native';

const bugsnag = new Client("d6d84807bf87e7f452415373ff2070ed");

AppRegistry.registerComponent(appName, () => App);
