import React from "react";
import {Router, Scene} from "react-native-router-flux";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import {useSelector} from "react-redux";
import Home from "./Components/Home";

const Routes = () => {
    const token = useSelector(state => state.token);

    return (
        <Router>
            <Scene key="root" headerMode="none">
                <Scene key="login" component={Login} initial={!token}/>
                <Scene key="signUp" component={SignUp}/>
                <Scene key="home" component={Home} initial={token}/>
            </Scene>
        </Router>
    );
}

export default Routes;