import {ActivityIndicator, ScrollView, StyleSheet, TextInput, View} from "react-native";
import React, {Component} from "react";
import {Button, Image, Input, Text} from "react-native-elements";
import {TextInputMask} from "react-native-masked-text";
import strings from "../strings";
import {boundMethod} from "autobind-decorator";
import {getAuthedAPI} from "../api";
import {ACTION_TYPES, createAction} from "../redux/actions";
import {Actions} from "react-native-router-flux";
import {connect} from "react-redux";
import HeaderWithBackButton from "./HeaderWithBackButton";
import {loadProfile} from "../common";
import {S3_HOST} from "../consts";
import Icon from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from 'react-native-image-picker';
import ProfilePicture from "./ProfilePicture";

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
            birthDateValid: false,
            bio: "",
            profileImageS3: null
        }
    }

    componentDidMount(): void {
        loadProfile(this.props.dispatch).then(() => {
            const {firstName, lastName, birthDate, bio, profileImageS3} = this.props.profile;

            const firstNameValid = isFirstNameValid(firstName);
            const lastNameValid = isLastNameValid(lastName);
            const birthDateValid = isBirthDateValid(birthDate);

            this.setState({
                firstName,
                lastName,
                birthDate,
                firstNameValid,
                lastNameValid,
                birthDateValid,
                bio,
                profileImageS3
            });
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

    @boundMethod
    handleBioInput(text) {
        this.setState({
            bio: text
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
            this.state.birthDate,
            this.state.bio
        ).then((response) => {
            const profile = {
                firstName: response.first_name,
                lastName: response.last_name,
                birthDate: response.birth_date,
                bio: response.bio
            }

            this.props.setProfile(profile);

            Actions.home();
        });
    }

    @boundMethod
    onSelectProfilePicturePressed() {
        ImagePicker.showImagePicker((response) => {
            if (response.didCancel) {
                // console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                // console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = {uri: response.uri};
                getAuthedAPI()
                    .uploadProfilePicture(source)
                    .then((response) => {
                        Actions.editProfile();
                    });
            }
        })
    }

    render() {
        return (
            <ScrollView>
                <HeaderWithBackButton headerText={strings.pages.editProfile.headerText} />
                <View style={{marginLeft: 10, marginRight: 10, marginTop: 10 }}>
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
                    <Text style={styles.textLabel}>
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

                    {/* Bio */}
                    <Text style={styles.textLabel}>
                        {strings.pages.editProfile.bioLabel}
                    </Text>
                    <TextInput
                        multiline={true}
                        style={styles.multiLineInput}
                        placeholder="Lorem ipsum dolor..."
                        onChangeText={this.handleBioInput}
                        value={this.state.bio}
                    />

                    {/* Profile image */}
                    <Text style={styles.textLabel}>
                        {strings.pages.editProfile.profilePicture}
                    </Text>
                    <View style={{display: "flex", flexDirection: "row"}}>
                        <ProfilePicture
                            imageURL={this.state.profileImageS3}
                        />
                        <Button
                            title="Choose Picture"
                            containerStyle={styles.choosePictureButton}
                            onPress={this.onSelectProfilePicturePressed}
                        />
                    </View>

                    <Button
                        title={strings.pages.editProfile.submit}
                        containerStyle={styles.submitButton}
                        disabled={this.submitButtonDisabled}
                        onPress={this.submit}
                    />
                </View>
            </ScrollView>
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

    textLabel: {
        alignSelf: "flex-start",
        marginTop: 10,
        marginLeft: 10
    },

    submitButton: {
        marginTop: 10
    },

    multiLineInput: {
        width: "95%",
        color: 'black',
        fontSize: 18,
        minHeight: 40,
        borderBottomWidth: 1,
        borderColor: "gray",
        paddingHorizontal: 10,
        alignSelf: "center"
    },

    choosePictureButton: {
        marginLeft: 40,
        alignSelf: "center"
    }
});

function mapStateToProps(state) {
    return {
        profile: state.profile
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setProfile: profile => dispatch(createAction(ACTION_TYPES.SET_PROFILE, profile)),
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);