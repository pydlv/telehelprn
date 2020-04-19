const login = {
    email: "Email",
    password: "Password",
    login: "Login",
    or: "OR",
    signup: "Sign Up",
    invalidEmailFormat: "That is not a valid email format.",
    doesNotMeetPasswordRequirements: "That is not a valid password. Passwords must be at least 6 characters long.",
    userDoesNotExist: "There is not user with that email address.",
    passwordIsIncorrect: "That password is incorrect."
}

const signUp = {
    headerText: "Sign Up",
    signUpButton: "Submit",
    confirmPassword: "Confirm Password"
}

export default {
    appName: 'Teletherapy',
    pages: {
        login,
        signUp
    }
};
