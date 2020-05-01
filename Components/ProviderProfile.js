import React, {Component} from "react";
import PropTypes from "prop-types";
import {StyleSheet, View} from "react-native";
import {Button, Text} from "react-native-elements";
import {getAuthedAPI} from "../api";
import HeaderWithBackButton from "./HeaderWithBackButton";
import strings from "../strings";
import {Actions} from "react-native-router-flux";
import {sprintf} from "sprintf-js";
import {boundMethod} from "autobind-decorator";

class ProviderProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullName: null,
            firstName: null,
            lastName: null,
        }
    }

    @boundMethod
    onConfirmProvider() {
        getAuthedAPI()
            .assignProvider(this.props.uuid)
            .then(() => {
                Actions.home()
            })
    }

    @boundMethod
    onProviderSelectButtonPress() {
        Actions.push("confirmPrompt", {
            title: strings.pages.providerProfile.confirmRequestProviderTitle,
            subtitle: sprintf(strings.pages.providerProfile.confirmRequestProviderSubtitle, this.state.fullName),
            onConfirm: this.onConfirmProvider,
            onCancel: () => {}
        });
    }

    componentDidMount() {
        // Load the provider information
        getAuthedAPI()
            .getProvider(this.props.uuid)
            .then((response) => {
                this.setState({
                    fullName: response.full_name,
                    firstName: response.first_name,
                    lastName: response.last_name,
                    bio: response.bio
                })
            });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <HeaderWithBackButton />
                <View style={styles.containerStyle}>
                    <Text style={styles.providerName} h4>{this.state.fullName}</Text>
                    <Text>Therapist</Text>
                    <Button
                        title={strings.pages.providerProfile.selectProvider}
                        containerStyle={styles.selectProviderButton}
                        onPress={this.onProviderSelectButtonPress}
                    />
                    <View style={styles.bioContainer}>
                        <Text style={styles.bioHeader}>{strings.pages.providerProfile.bioHeader}</Text>
                        {this.state.bio ?
                            <Text>{this.state.bio}</Text> :
                            <Text>
                                {strings.pages.providerProfile.noBio}
                            </Text>
                        }
                    </View>
                </View>
            </View>
        );
    }
}

ProviderProfile.propTypes = {
    uuid: PropTypes.string
}

const styles = StyleSheet.create({
    providerName: {

    },

    containerStyle: {
        padding: 20
    },

    selectProviderButton: {
        marginTop: 20
    },

    bioContainer: {
        marginTop: 20,
        padding: 10,
        borderWidth: StyleSheet.hairlineWidth
    },

    bioHeader: {
        fontWeight: "600",
        fontSize: 20,
        marginBottom: 10
    }
});


export default ProviderProfile;