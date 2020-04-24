export const ACTION_TYPES = {
    STORE_TOKEN: "STORE_TOKEN",
    SET_FIRST_NAME: "SET_FIRST_NAME",
    SET_LAST_NAME: "SET_LAST_NAME",
    SET_BIRTH_DATE: "SET_BIRTH_DATE",
    RESET_STORE: "RESET_STORE"
};

export function createAction(actionType, payload) {
    return {
        type: actionType,
        payload
    };
}
