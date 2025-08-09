import { useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { login } from "../../services/AuthService.jsx";
import useNotify from '../../hooks/useNotify.js'

async function Login(email, avatar, name) {
    const response = await login(email, avatar, name)
    if (response) {
        return response
    }
}

function HandleResponse() {
    const { error, success } = useNotify()
    const [googleResponse, setGoogleResponse] = useState(null)
    const location = useLocation()
    const accessToken = new URLSearchParams(location.hash.substring(1)).get('access_token')

    useEffect(() => {
        async function FetchInfo() {
            const r = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken)
            if (r.status === 200) {
                return r
            }
        }

        FetchInfo().then(r => setGoogleResponse(r))
    }, [accessToken]);

    if (googleResponse) {
        Login(googleResponse.data.email, googleResponse.data.picture, googleResponse.data.name).then(res => {
            if (res.status === 200) {
                localStorage.setItem("user", JSON.stringify(res.data.data))
                localStorage.setItem("message", res.data.message)
                localStorage.setItem("variant", "success")

                const role = res.data.data.role
                const name = res.data.data.name || 'bạn'
                const target = (() => {
                    switch (role) {
                        case 'admin':
                            return '/admin/dashboard'
                        case 'buyer':
                            return '/home'
                        case 'seller':
                            return '/seller/dashboard'
                        default:
                            return '/sign-in'
                    }
                })()
                // Welcome toast before redirect
                success(`Đăng nhập thành công, chào mừng ${name}!`)
                setTimeout(() => { window.location.href = target }, 1200)
            }
        }).catch(err => {
            error(err?.response?.data?.message || 'Đăng nhập thất bại')
            setTimeout(() => {
                window.location.href = '/sign-in'
            }, 1500)
        })
    }
    return (
        <></>
    )
}

export default function GoogleResponse() {
    return <HandleResponse/>
}