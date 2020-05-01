import React from "react";
import {Router, Scene} from "react-native-router-flux";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import {useSelector} from "react-redux";
import Home from "./Components/Home";
import EditProfile from "./Components/EditProfile";
import {createAuthedAPI} from "./api";
import ProviderList from "./Components/ProviderList";
import ConfirmPrompt from "./Components/ConfirmPrompt";
import ProviderProfile from "./Components/ProviderProfile";

const Routes = () => {
    const token = useSelector(state => state.token);

    const needsLogin = !token;

    if (token !== null) {
        createAuthedAPI(token);
    }

    return (
        <Router>
            <Scene key="root" headerMode="none">
                <Scene key="preAuth" initial={needsLogin}>
                    <Scene key="login" component={Login} initial={true} init={true}/>
                    <Scene key="signUp" component={SignUp}/>
                </Scene>
                <Scene key="postAuth" initial={!needsLogin}>
                    <Scene key="home" component={Home} initial={true}/>
                    <Scene key="editProfile" component={EditProfile} />
                    <Scene key="providerList" component={ProviderList} />
                    <Scene key="confirmPrompt" component={ConfirmPrompt} />
                    <Scene key="viewProvider" component={ProviderProfile} />
                </Scene>
            </Scene>
        </Router>
    );
}

export default Routes;