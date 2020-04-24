import React from "react";
import {Router, Scene} from "react-native-router-flux";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import {useSelector} from "react-redux";
import Home from "./Components/Home";
import EditProfile from "./Components/EditProfile";

const Routes = () => {
    const token = useSelector(state => state.token);

    const needsLogin = !token;
    const needEditProfile = useSelector(state => !state.firstName || !state.lastName || !state.birthDate);

    return (
        <Router>
            <Scene key="root" headerMode="none">
                <Scene key="preAuth" initial={needsLogin}>
                    <Scene key="login" component={Login} initial={true} init={true}/>
                    <Scene key="signUp" component={SignUp}/>
                </Scene>
                <Scene key="postAuth" initial={!needsLogin}>
                    <Scene key="editProfile" component={EditProfile} initial={needEditProfile} />
                    <Scene key="home" component={Home} initial={!needEditProfile}/>
                </Scene>
            </Scene>
        </Router>
    );
}

export default Routes;