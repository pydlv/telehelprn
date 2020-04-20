export const ACTION_TYPES = {
    STORE_TOKEN: "STORE_TOKEN"
};

export function createAction(actionType, payload) {
    return {
        type: actionType,
        payload
    };
}
