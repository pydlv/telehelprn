import {createAuthedAPI, getAuthedAPI} from "./api";
import {ACTION_TYPES, createAction} from "./redux/actions";

export function setLogin(dispatch, token, accountType) {
    createAuthedAPI(token);

    dispatch(createAction(ACTION_TYPES.SET_TOKEN, token));
    dispatch(createAction(ACTION_TYPES.SET_ACCOUNT_TYPE, accountType));
}

export async function loadProfile(dispatch) {
    const setProfile = profile => dispatch(createAction(ACTION_TYPES.SET_PROFILE, profile));

    const response = await getAuthedAPI().getProfile();

    const storeProfile = {
        firstName: response.first_name,
        lastName: response.last_name,
        birthDate: response.birth_date,
        bio: response.bio,
        profileImageS3: response.profile_image_s3
    };

    setProfile(storeProfile);

    return response ? storeProfile : null;
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