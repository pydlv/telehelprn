import React from "react";
import {Router, Scene} from "react-native-router-flux";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";

const Routes = () => (
    <Router>
        <Scene key="root" headerMode="none">
            <Scene key="login" component={Login} initial={true} />
            <Scene key="signUp" component={SignUp} />
        </Scene>
    </Router>
);

export default Routes;