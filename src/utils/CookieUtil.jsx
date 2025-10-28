import {getAccess} from "../services/AccountService.jsx";

export const getAccessToken = async () => {
    console.log("I am here 3")
    const response = await getAccess();

    console.log("I am here 4")
    if (response && response.status === 200) {
        console.log("I am here 5")
        return response.data.data.access
    }
    console.log("I am here 6")
    return null
};
