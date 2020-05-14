import {createStore} from "redux";
import {ACTION_TYPES} from "./actions";
import {persistReducer, persistStore} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

const originalState = {
    token: null,
    profile: null,
    provider: null,
    accountType: undefined
};

function myReducer(state = originalState, action) {
    switch (action.type) {
        case ACTION_TYPES.SET_TOKEN:
            return {
                ...state,
                token: action.payload
            };

        case ACTION_TYPES.SET_PROFILE:
            return {
                ...state,
                profile: action.payload
            }

        case ACTION_TYPES.SET_PROVIDER:
            return {
                ...state,
                provider: action.payload
            }

        case ACTION_TYPES.SET_ACCOUNT_TYPE:
            return {
                ...state,
                accountType: action.payload
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
    storage: AsyncStorage
};

const persistedReducer = persistReducer(persistConfig, myReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
