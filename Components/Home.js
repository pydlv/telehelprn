import React, {Component} from "react";
import {View} from "react-native";
import {Button, Header} from "react-native-elements";
import {connect} from "react-redux";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {boundMethod} from "autobind-decorator";
import {getAuthedAPI} from "../api";
import Icon from "react-native-vector-icons/FontAwesome";
import strings from "../strings";
import { sprintf } from "sprintf-js";

class Home extends Component {
    @boundMethod
    signOut() {
        getAuthedAPI().signOut().then(() => {
            this.props.resetStore();
        });
    }

    render() {
        return (
            <View>
                <Header
                    placement="left"
                    centerComponent={{ text: sprintf(strings.pages.home.greetingText, this.props.firstName), style: { color: '#fff', fontSize: 24 } }}
                    rightComponent={
                        <Button
                            icon={
                                <Icon
                                    name='sign-out'
                                    size={24}
                                    color="white"
                                />
                            }
                            onPress={this.signOut}
                        />
                    }
                />
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        fullName: state.firstName + ' ' + state.lastName,
        firstName: state.firstName
    };
}

function mapDispatchToProps(dispatch) {
    return {
        resetStore: () => dispatch(createAction(ACTION_TYPES.RESET_STORE))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);