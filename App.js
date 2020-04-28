import React, {Component} from 'react';
import {Provider} from "react-redux";
import {store, persistor} from "./redux/store";
import Routes from "./routes";
import {PersistGate} from "redux-persist/integration/react";
import LoadingView from "./Components/LoadingView";
import {ThemeProvider} from "react-native-elements";
import theme from "./theme";

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <PersistGate loading={<LoadingView />} persistor={persistor}>
                    <ThemeProvider theme={theme}>
                        <Routes/>
                    </ThemeProvider>
                </PersistGate>
            </Provider>
        );
    }
};
