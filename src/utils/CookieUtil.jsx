import {getAccess} from "../services/AccountService.jsx";

export const getAccessToken = async () => {
    console.log("I am here 3")
    const response = await getAccess();

    console.log("Access response: ", response)
    if (response && response.status === 200) {
        return response.data.data.access
    }
    return null
};
