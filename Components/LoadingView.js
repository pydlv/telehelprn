import React, {Component} from "react";
import {View} from "react-native";
import {Text} from "react-native-elements";

class LoadingView extends Component {
    render() {
        return (
            <View style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}>
                <Text h4>Loading... please wait.</Text>
            </View>
        );
    }
}

export default LoadingView;