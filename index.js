/**
 * @format
 */

import {Client} from 'bugsnag-react-native';

const bugsnag = new Client("d6d84807bf87e7f452415373ff2070ed");

import * as notifications from './notifications';

notifications.setup();

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
