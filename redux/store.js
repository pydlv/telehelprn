import { createStore } from "redux";
import { ACTION_TYPES } from "./actions";

const originalState = {
    token: null,
    email: null,
    password: null
};

function myReducer(state = originalState, action) {
    switch (action.type) {
        case ACTION_TYPES.STORE_TOKEN:
            return {
                ...state,
                token: action.payload
            };

        default:
            if (!action.type.startsWith("@@redux/INIT")) {
                console.warn("Received unknown action or fell through to default in reducer. Type:", action.type);
            }
            return state;
    }
}

const store = createStore(myReducer, {});

export default store;
