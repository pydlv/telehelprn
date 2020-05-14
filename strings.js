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

const settings = {
    headerText: "Settings",
    profileSettings: "Profile",
    providerSettings: "Provider Settings"
};

const editProfile = {
    firstName: "First Name",
    lastName: "Last Name",
    birthDateLabel: "Please provide your date of birth.",
    bioLabel: "Bio (shown on your profile):",
    submit: "Save",
    firstNameError: "Please enter a first name no longer than 30 characters.",
    lastNameError: "Please enter a last name no longer than 30 characters.",
    profilePicture: "Profile Picture",
    profilePictureTooLarge: "Sorry, the size of that file is too large. Try a smaller one."
}

const home = {
    greetingText: "Hello, %s!",
    yourProviderCardHeader: "Your Therapist",
    noProviderSelected: "You have not selected a provider yet.",
    selectProviderButton: "Select Provider",
    changeProviderButton: "Change Provider",
    yourProviderIs: "Your provider is: %s"
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

const appointmentCard = {
    titleText: "Your Next Appointment",
    noAppointment: "You do not have any appointments.",
    scheduleOneNow: "Schedule Now",
    joinSession: "Join Session",
    changeOrCancel: "Cancel Appointment",
    youHaveAnAppointment: "You have an appointment:",
    startTime: "Start time:",
    endTime: "End time:",
    youWillBeAbleToJoinIn: "You will be able to join the session in %s.",
    cancelConfirmTitle: "Cancel Appointment",
    cancelConfirmSubtitle: "Are you sure you would like to cancel your appointment for %s?"
}

const prompts = {
    cancel: "Cancel",
    confirm: "Confirm"
}

const providerSettings = {
    yourAvailabilitySchedule: "Your schedules:",
    addNewSchedule: "Add new schedule:",
    selectDaysOfWeek: "Select Days:",
    selectedStartTime: "Selected start time: %s",
    changeStartTime: "Change",
    selectedEndTime: "Selected end time: %s",
    changeEndTime: "Change",
    submitButton: "Create Schedule"
}

const appointmentScheduler = {
    headerText: "Schedule Appointment",
    yourProvidersSchedule: "Your provider's schedule:",
    confirmAppointment: "Confirm Appointment",
    confirmSubtitle: "Please confirm that you would like to schedule an appointment for %s.",
    searchDatesTooFarApart: "The start and end dates must be within 7 days of each other."
}

export default {
    appName: 'Teletherapy',
    pages: {
        login,
        signUp,
        editProfile,
        home,
        selectProvider,
        providerProfile,
        settings,
        providerSettings,
        appointmentCard,
        appointmentScheduler
    },
    prompts
};
