import {View} from "react-native";
import React, {Component} from "react";
import globalStyles from "../globalStyles";
import {Button, Input, Text} from "react-native-elements";
import {TextInputMask} from "react-native-masked-text";
import {StyleSheet} from "react-native";
import strings from "../strings";
import {boundMethod} from "autobind-decorator";
import {getAuthedAPI} from "../api";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import HeaderWithBackButton from "./HeaderWithBackButton";
import {loadProfile} from "../common";

const dateRegex = /(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/;

function isFirstNameValid(text) {
    if (text === null) return false;
    return 0 < text.length && text.length <= 30;
}

function isLastNameValid(text) {
    if (text === null) return false;
    return 0 < text.length && text.length <= 30;
}

function isBirthDateValid(text) {
    if (text === null) return false;
    return dateRegex.test(text);
}

class EditProfile extends Component {
    constructor() {
        super();

        this.state = {
            firstName: "",
            lastName: "",
            birthDate: "",
            firstNameError: null,
            lastNameError: null,
            firstNameValid: false,
            lastNameValid: false,
            birthDateValid: false
        }
    }

    componentDidMount(): void {
        loadProfile(this.props.dispatch);

        const {firstName, lastName, birthDate} = this.props;

        const firstNameValid = isFirstNameValid(firstName);
        const lastNameValid = isLastNameValid(lastName);
        const birthDateValid = isBirthDateValid(birthDate);

        this.setState({
            firstName,
            lastName,
            birthDate,
            firstNameValid,
            lastNameValid,
            birthDateValid
        });

    }

    @boundMethod
    updateFirstName(text) {
        const firstNameValid = 0 < text.length && text.length <= 30;
        this.setState({
            firstName: text,
            firstNameValid,
            firstNameError: firstNameValid ? null : strings.pages.editProfile.firstNameError
        });
    }

    @boundMethod
    updateLastName(text) {
        const lastNameValid = 0 < text.length && text.length <= 30;
        this.setState({
            lastName: text,
            lastNameValid,
            lastNameError: lastNameValid ? null : strings.pages.editProfile.lastNameError
        });
    }

    @boundMethod
    updateBirthDate(text) {
        const birthDateValid = dateRegex.test(text);
        this.setState({
            birthDate: text,
            birthDateValid
        });
    }

    get submitButtonDisabled() {
        return !this.state.firstNameValid || !this.state.lastNameValid || !this.state.birthDateValid;
    }

    @boundMethod
    submit() {
        getAuthedAPI().editProfile(
            this.state.firstName,
            this.state.lastName,
            this.state.birthDate
        ).then((response) => {
            this.props.setFirstName(response.first_name);
            this.props.setLastName(response.last_name);
            this.props.setBirthDate(response.birth_date);

            Actions.home();
        });
    }

    render() {
        return (
            <View>
                <HeaderWithBackButton />
                <View style={{marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                    <Text h3>{strings.pages.editProfile.headerText}</Text>

                    {/* First name */}
                    <Input
                        placeholder={strings.pages.editProfile.firstName}
                        value={this.state.firstName}
                        onChangeText={this.updateFirstName}
                        errorMessage={this.state.firstNameError}
                    />

                    {/* Last name */}
                    <Input
                        placeholder={strings.pages.editProfile.lastName}
                        value={this.state.lastName}
                        onChangeText={this.updateLastName}
                        errorMessage={this.state.lastNameError}
                    />

                    {/* Birth date */}
                    <Text style={styles.birthDateLabel}>
                        {strings.pages.editProfile.birthDateLabel}
                    </Text>
                    <TextInputMask
                        type={'datetime'}
                        options={{
                            format: 'MM/DD/YYYY'
                        }}
                        value={this.state.birthDate}
                        onChangeText={this.updateBirthDate}
                        placeholder={"MM/DD/YYYY"}
                        style={styles.maskedDateInput}
                    />

                    <Button
                        title={strings.pages.editProfile.submit}
                        containerStyle={styles.submitButton}
                        disabled={this.submitButtonDisabled}
                        onPress={this.submit}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    maskedDateInput: {
        width: "95%",
        alignSelf: 'center',
        color: 'black',
        fontSize: 18,
        minHeight: 40,
        borderBottomWidth: 1,
        alignItems: 'center',
        borderColor: "gray",
        paddingHorizontal: 10
    },

    birthDateLabel: {
        alignSelf: "flex-start",
        marginTop: 10,
        marginLeft: 10
    },

    submitButton: {
        marginTop: 10
    }
});

function mapStateToProps(state) {
    return {
        firstName: state.firstName,
        lastName: state.lastName,
        birthDate: state.birthDate
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setFirstName: (firstName) => dispatch(createAction(ACTION_TYPES.SET_FIRST_NAME, firstName)),
        setLastName: (lastName) => dispatch(createAction(ACTION_TYPES.SET_LAST_NAME, lastName)),
        setBirthDate: (birthDate) => dispatch(createAction(ACTION_TYPES.SET_BIRTH_DATE, birthDate)),
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);