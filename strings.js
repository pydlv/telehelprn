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
    userAlreadyExists: "An account with that email address already exists."
}


const editProfile = {
    instructionText: "Please complete your profile to continue.",
    firstName: "First Name",
    lastName: "Last Name",
    birthDateLabel: "Please provide your date of birth.",
    submit: "Submit",
    firstNameError: "Please enter a first name no longer than 30 characters.",
    lastNameError: "Please enter a last name no longer than 30 characters."
}


const home = {
    greetingText: "Hello, %s!"
}


export default {
    appName: 'Teletherapy',
    pages: {
        login,
        signUp,
        editProfile,
        home
    }
};
