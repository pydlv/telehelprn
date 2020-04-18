import React, {Component} from 'react';
import {View} from 'react-native';
import Login from "./Components/Login";
import { AuthenticationContext } from "./contexts";

export default class App extends Component {

    render() {
        return (
            <>
                {/*<React.StrictMode>*/}
                <View>
                    <Login/>
                    {/*<VideoSession />*/}
                </View>
                {/*</React.StrictMode>*/}
            </>
        );
    }
};
