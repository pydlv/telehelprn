import { createStore } from "redux";
import { ACTION_TYPES } from "./actions";
import { persistStore, persistReducer } from 'redux-persist';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-community/async-storage';

const originalState = {
    token: null,
    firstName: null,
    lastName: null,
    birthDate: null,
    provider: undefined
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

        case ACTION_TYPES.SET_PROVIDER:
            return {
                ...state,
                provider: action.payload
            }

        case ACTION_TYPES.RESET_STORE:
            return originalState;

        default:
            if (!action.type.startsWith("@@redux/INIT") && !action.type.startsWith("persist")) {
                console.warn("Received unknown action or fell through to default in reducer. Type:", action.type);
            }
            return state;
    }
}

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    // stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, myReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
