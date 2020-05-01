export const ACTION_TYPES = {
    SET_TOKEN: "SET_TOKEN",
    SET_PROFILE: "SET_PROFILE",
    RESET_STORE: "RESET_STORE",
    SET_PROVIDER: "SET_PROVIDER",
    SET_ACCOUNT_TYPE: "SET_ACCOUNT_TYPE",
};

export function createAction(actionType, payload) {
    return {
        type: actionType,
        payload
    };
}
