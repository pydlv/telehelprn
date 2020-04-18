import { createStore } from "redux";

function myReducer(state = {}, action) {
    switch (action.type) {
        default:
            return state;
    }
}

export const store = createStore(myReducer, {});

export default store;
