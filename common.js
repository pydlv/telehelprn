import {getAuthedAPI} from "./api";
import {ACTION_TYPES, createAction} from "./redux/actions";

export function loadProfile(dispatch) {
    const setFirstName = firstName => dispatch(createAction(ACTION_TYPES.SET_FIRST_NAME, firstName));
    const setLastName = lastName => dispatch(createAction(ACTION_TYPES.SET_LAST_NAME, lastName));
    const setBirthDate = birthDate => dispatch(createAction(ACTION_TYPES.SET_BIRTH_DATE, birthDate));

    getAuthedAPI()
        .getProfile()
        .then((response) => {
            setFirstName(response.first_name);
            setLastName(response.last_name);
            setBirthDate(response.birth_date);
        })
        .catch((error) => {
            console.error(error);
        })
}


export function loadProvider(dispatch) {
    const setProvider = provider => dispatch(createAction(ACTION_TYPES.SET_PROVIDER, provider));

    getAuthedAPI()
        .getProvider()
        .then((response) => {
            setProvider(response.provider)
        });
}