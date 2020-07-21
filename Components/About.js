import React, {Component} from "react";
import {ScrollView, View} from "react-native";
import {Text} from "react-native-elements";
import strings from "../strings";
import DeviceInfo from 'react-native-device-info';
import HeaderWithBackButton from "./HeaderWithBackButton";

export default class About extends Component {
    render() {
        return (
            <ScrollView>
                <HeaderWithBackButton
                    headerText={`About ${strings.appName}`}
                />
                <View style={{margin: 15}}>
                    <Text>Version {DeviceInfo.getVersion()} Build {DeviceInfo.getBuildNumber()}</Text>
                </View>
            </ScrollView>
        );
    }
}