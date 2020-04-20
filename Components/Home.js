import React, {Component} from "react";
import {View} from "react-native";
import {Text} from "react-native-elements";
import {connect} from "react-redux";

class Home extends Component {
    render() {
        return (
            <View>
                <Text>Hello, name</Text>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {

    };
}

export default connect(mapStateToProps)(Home);