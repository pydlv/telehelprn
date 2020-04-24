import { createStore } from "redux";
import { ACTION_TYPES } from "./actions";

const originalState = {
    token: null,
    firstName: null,
    lastName: null,
    birthDate: null
};

function myReducer(state = originalState, action) {
    switch (action.type) {
        case ACTION_TYPES.STORE_TOKEN:
            return {
                ...state,
                token: action.payload
            };

        case ACTION_TYPES.SET_FIRST_NAME:
            return {
                ...state,
                firstName: action.payload
            }

        case ACTION_TYPES.SET_LAST_NAME:
            return {
                ...state,
                lastName: action.payload
            }

        case ACTION_TYPES.SET_BIRTH_DATE:
            return {
                ...state,
                birthDate: action.payload
            }

        case ACTION_TYPES.RESET_STORE:
            return originalState;

        default:
            if (!action.type.startsWith("@@redux/INIT")) {
                console.warn("Received unknown action or fell through to default in reducer. Type:", action.type);
            }
            return state;
    }
}

const store = createStore(myReducer, {});

export default store;
