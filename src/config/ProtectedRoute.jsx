import {useEffect, useState} from "react";
import {refreshToken} from "../services/AuthService.jsx";
import {signOut} from "../services/AccountService.jsx";
import {getAccessToken} from "../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";

async function GetAccessData() {
    console.log("I am here")
    const accessToken = await getAccessToken()
    console.log("I am here 2")
    if (accessToken) {
        try {
            console.log("I am here 7")
            return jwtDecode(accessToken)
        } catch (error) {
            console.log("I am here 8")
            console.error('JWT decode error:', error)
            return null
        }
    } else {
        return null
    }
}

async function Logout() {
    signOut().then(res => {
        if (res && res.status === 200) {
            if (localStorage.length > 0) {
                localStorage.clear();
            }
            if (sessionStorage.length > 0) {
                sessionStorage.clear()
            }
            setTimeout(() => {
                window.location.href = "/login"
            }, 1000)
        }
    })
}

async function CheckIfRoleValid(allowRoles, role) {
    return !!allowRoles.includes(role);
}

export default function ProtectedRoute({children, allowRoles = []}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasValidRole, setHasValidRole] = useState(false);
    const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            if (hasAttemptedAuth) {
                return;
            }

            try {
                setIsLoading(true);
                setHasAttemptedAuth(true);

                const data = await GetAccessData();
                console.log("First data: ", data)

                if (data != null) {
                    console.log("Data not null")
                    const isValidRole = await CheckIfRoleValid(allowRoles, data.role);
                    if (isValidRole) {
                        console.log("Valid role")
                        setIsAuthenticated(true);
                        setHasValidRole(true);
                        setIsLoading(false);
                        return;
                    } else {
                        console.log("Invalid role")
                        // await Logout();
                        return;
                    }
                }

                const refreshResponse = await refreshToken();
                console.log("Data is null")
                if (refreshResponse.status === 401 || refreshResponse.status === 403) {
                    console.log("Refresh error 401 / 403")
                    // await Logout();
                    return;
                }

                const retryData = await GetAccessData();
                console.log("Retry data: ", retryData)
                if (retryData != null) {
                    console.log("Retry data not null")
                    const isValidRole = await CheckIfRoleValid(allowRoles, retryData.role);
                    if (isValidRole) {
                        console.log("Valid role")
                        setIsAuthenticated(true);
                        setHasValidRole(true);
                        setIsLoading(false);

                    } else {
                        console.log("Invalid role")
                        // await Logout();

                    }
                } else {
                    console.log("Retry data is null")
                    // await Logout();

                }

            } catch (error) {
                console.error("Authentication error:", error);
                // await Logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [allowRoles]);

    if (isLoading) {
        // Không hiển thị loading UI ở đây nữa, sẽ dùng GlobalLoadingOverlay
        return null;
    }

    if (isAuthenticated && hasValidRole) {
        return children;
    }

    return null;
}