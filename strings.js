const login = {
    email: "Email",
    password: "Password",
    login: "Login",
    or: "OR",
    signup: "Sign Up",
    invalidEmailFormat: "That is not a valid email format.",
    userDoesNotExist: "There is not a user with that email address.",
    passwordIsIncorrect: "That password is incorrect."
}

const signUp = {
    headerText: "Sign Up",
    signUpButton: "Submit",
    confirmPassword: "Confirm Password",
    doesNotMeetPasswordRequirements: "That is not a valid password. Passwords must be at least 6 characters long.",
    userAlreadyExists: "An account with that email address already exists.",
    noPasswordMatch: "The passwords do not match.",
    invalidEmail: "That is not a valid email address."
}

const editProfile = {
    headerText: "Edit Profile",
    firstName: "First Name",
    lastName: "Last Name",
    birthDateLabel: "Please provide your date of birth.",
    bioLabel: "Bio (shown on your profile):",
    submit: "Save",
    firstNameError: "Please enter a first name no longer than 30 characters.",
    lastNameError: "Please enter a last name no longer than 30 characters.",
    profilePicture: "Profile Picture"
}

const home = {
    greetingText: "Hello, %s!",
    yourProviderCardHeader: "Your Therapist",
    noProviderSelected: "You have not selected a provider yet.",
    selectProviderButton: "Select Provider",
    changeProviderButton: "Change Provider"
}

const selectProvider = {
    headerText: "Select Provider",
}

const providerProfile = {
    selectProvider: "Select as Your Provider",
    confirmRequestProviderTitle: "Confirm Action",
    confirmRequestProviderSubtitle: "Please confirm that you would like to request %s to become your provider.",
    bioHeader: "About",
    noBio: "This user has not set a bio yet."
}

const prompts = {
    cancel: "Cancel",
    confirm: "Confirm"
}

export default {
    appName: 'Teletherapy',
    pages: {
        login,
        signUp,
        editProfile,
        home,
        selectProvider,
        providerProfile
    },
    prompts
};
