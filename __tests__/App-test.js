/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {AvailabilitySchedule} from "../Components/ProviderSettings";

it('renders correctly', () => {
  renderer.create(<App />);
});