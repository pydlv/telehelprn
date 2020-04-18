import React from "react";
import {Router, Scene} from "react-native-router-flux";
import Login from "./Components/Login";

const Routes = () => (
    <Router>
        <Scene key="root" headerMode="none">
            <Scene key="login" component={Login} title="Login" initial={true} />
        </Scene>
    </Router>
);

export default Routes;