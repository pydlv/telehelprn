import React, {Component} from 'react';
import {View} from 'react-native';
import Login from "./Components/Login";
import {Provider} from "react-redux";
import store from "./redux/store";
import Routes from "./routes";

export default class App extends Component {
    render() {
        return (
            <>
                <Provider store={store}>
                    <Routes/>
                    {/*<View>*/}
                    {/*    <Login/>*/}
                    {/*    /!*<VideoSession />*!/*/}
                    {/*</View>*/}
                </Provider>
            </>
        );
    }
};
