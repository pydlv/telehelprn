import {createAuthedAPI, getAuthedAPI} from "./api";
import {ACTION_TYPES, createAction} from "./redux/actions";

export function setLogin(dispatch, token, accountType) {
    createAuthedAPI(token);

    dispatch(createAction(ACTION_TYPES.SET_TOKEN, token));
    dispatch(createAction(ACTION_TYPES.SET_ACCOUNT_TYPE, accountType));
}

export function loadProfile(dispatch) {
    const setProfile = profile => dispatch(createAction(ACTION_TYPES.SET_PROFILE, profile));


    return getAuthedAPI()
        .getProfile()
        .then((response) => {
            const storeProfile = {
                firstName: response.first_name,
                lastName: response.last_name,
                birthDate: response.birth_date,
                bio: response.bio,
                profileImageS3: response.profile_image_s3
            };

            setProfile(storeProfile);
        })
        .catch((error) => {
            console.error(error);
        })
}

export function loadProvider(dispatch) {
    const setProvider = provider => {
        const newProvider = provider && {
            uuid: provider.uuid,
            fullName: provider.full_name,
            firstName: provider.first_name,
            lastName: provider.last_name
        }
        dispatch(createAction(ACTION_TYPES.SET_PROVIDER, newProvider));
    }

    getAuthedAPI()
        .getAssignedProvider()
        .then((response) => {
            setProvider(response.provider)
        });
}