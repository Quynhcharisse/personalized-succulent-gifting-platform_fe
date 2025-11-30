import {useEffect, useState} from "react";
import {refreshToken} from "../services/AuthService.jsx";
import {signOut} from "../services/AccountService.jsx";
import {getAccessToken} from "../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";

async function GetAccessData() {
    const accessToken = await getAccessToken()
    if (accessToken) {
        try {
            return jwtDecode(accessToken)
        } catch (error) {
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
            // Remove only current user's cart and user info
            try {
                const rawUser = sessionStorage.getItem('user')
                if (rawUser) {
                    const parsed = JSON.parse(rawUser)
                    const userIdentifier = parsed?.id || parsed?.userId || parsed?.email || 'guest'
                    const cartKey = `psgp_cart_v1_${userIdentifier}`
                    sessionStorage.removeItem(cartKey)
                }
            } catch {
            }
            sessionStorage.removeItem('user')
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

                if (data != null) {
                    const isValidRole = await CheckIfRoleValid(allowRoles, data.role);
                    if (isValidRole) {
                        setIsAuthenticated(true);
                        setHasValidRole(true);
                        setIsLoading(false);
                        return;
                    } else {
                        console.log("Invalid role")
                        return;
                    }
                }

                const refreshResponse = await refreshToken();
                if (refreshResponse.status === 401 || refreshResponse.status === 403) {
                    console.log("Refresh error 401 / 403")
                    return;
                }

                const retryData = await GetAccessData();
                if (retryData != null) {
                    const isValidRole = await CheckIfRoleValid(allowRoles, retryData.role);
                    if (isValidRole) {
                        setIsAuthenticated(true);
                        setHasValidRole(true);
                        setIsLoading(false);

                    } else {
                        console.log("Invalid role")

                    }
                } else {
                    console.log("Retry data is null")
                }

            } catch (error) {
                console.error("Authentication error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [allowRoles]);

    if (isLoading) {
        return null;
    }

    if (isAuthenticated && hasValidRole) {
        return children;
    }

    return null;
}