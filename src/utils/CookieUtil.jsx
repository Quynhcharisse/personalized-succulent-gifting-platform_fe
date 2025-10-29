import {getAccess} from "../services/AccountService.jsx";

export const getAccessToken = async () => {
    const response = await getAccess();

    if (response && response.status === 200) {
        return response.data.data.access
    }
    return null
};
