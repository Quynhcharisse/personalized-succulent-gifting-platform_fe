import '../../styles/auth/SignIn.css'
import {Button, Typography, Link, Box, Alert} from "@mui/material";
import { KeyboardBackspace } from '@mui/icons-material';
import useNotify from '../../hooks/useNotify.js'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import axios from "axios";
import {signIn} from "../../services/AuthService.jsx";
import {getCookie} from "../../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";
import {useGoogleLogin} from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google';
import {enqueueSnackbar} from "notistack";
import {useState} from "react";

function RenderLoginArea() {
    const [isLoading, setIsLoading] = useState(false);
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isGoogleConfigured = clientID && clientID !== "your_actual_google_client_id_here" && clientID !== "fallback_client_id";
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectTo = new URLSearchParams(search).get('redirectTo');
    const redirectUri = `${window.location.origin}/sign-in`;

    async function HandleLogin(userInfo) {
        try {
            setIsLoading(true);
            const loginResponse = await signIn(userInfo.data.email, userInfo.data.name, userInfo.data.picture);
            if (loginResponse && loginResponse.status === 200) {
                localStorage.setItem('user', JSON.stringify(loginResponse.data.body));
                const access = getCookie('access');
                const role = jwtDecode(access)?.role
                enqueueSnackbar(loginResponse.data.message, {variant: 'success', autoHideDuration: 1000});
                setTimeout(() => {
                    switch (role) {
                        case 'admin':
                            navigate('/admin/dashboard', { replace: true });
                            break;
                        case 'buyer':
                            navigate(redirectTo || '/', { replace: true });
                            break;
                        case 'seller':
                            navigate('/seller/dashboard', { replace: true });
                            break;
                        default:
                            navigate('/', { replace: true });
                            break;
                    }
                }, 1000)
            }
        } catch (error) {
            console.error("Login error:", error);
            enqueueSnackbar("Đăng nhập thất bại", {variant: "error"});
        } finally {
            setIsLoading(false);
        }
    }

    async function HandleSuccess(token) {
        try {
            const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                    }
                }
            );

            if (userInfo) {
                HandleLogin(userInfo)
            }
        } catch (error) {
            console.error("Failed to get user info:", error);
            enqueueSnackbar("Không thể lấy thông tin người dùng", {variant: "error"});
            setIsLoading(false);
        }
    }

    function HandleError(error) {
        console.log("Login Error:", error);
        enqueueSnackbar("Đăng nhập thất bại", {variant: "error"});
        setIsLoading(false);
    }

    const login = useGoogleLogin({
        flow: 'implicit',
        scope: 'openid email profile',
        ux_mode: 'redirect',
        redirect_uri: redirectUri,
        onSuccess: HandleSuccess,
        onError: HandleError,
    });

    return (
        <div className={'sign-in-login-area-container'}>
            <span className="signin-eyebrow">Ưu đãi 20% cho đơn đầu tiên</span>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '.01em', color: 'var(--secondary-500)', textAlign: 'center' }}>
               Đăng nhập
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--muted)', textAlign: 'center' }}>
                Để nhận ưu đãi, lưu giỏ hàng và theo dõi đơn.
            </Typography>

            {!isGoogleConfigured && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.
                </Alert>
            )}

            {/* Google Login Button */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<GoogleIcon/>}
                    onClick={() => {
                        if (isGoogleConfigured) {
                            setIsLoading(true);
                            login();
                        } else {
                            enqueueSnackbar("Google OAuth chưa được cấu hình", {variant: "warning"});
                        }
                    }}
                    disabled={!isGoogleConfigured || isLoading}
                    sx={{
                        background: isGoogleConfigured
                            ? 'linear-gradient(90deg, #d32f2f 0%, #ef5350 100%)'
                            : 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)',
                        color: 'white',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        fontSize: "1rem",
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        textTransform: "none",
                        width: "80%",
                        textAlign: "center",
                        "&:hover": {
                            background: isGoogleConfigured
                                ? 'linear-gradient(90deg, #c62828 0%, #d32f2f 100%)'
                                : 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)',
                            boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                        },
                        "&:disabled": {
                            background: 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)',
                        }
                    }}
                >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
                </Button>
            </Box>
            <ul className="signin-perks">
                <li><CheckCircleRounded fontSize="small" /> Không lưu mật khẩu</li>
                <li><CheckCircleRounded fontSize="small" /> Bảo mật Google</li>
                <li><CheckCircleRounded fontSize="small" /> Đăng nhập nhanh</li>
            </ul>
            <div className='signin-actions'>
                <div className={'signin-back-row'}>
                    <KeyboardBackspace height={15} width={15} sx={{ marginRight: '0.5rem' }} />
                    <Link component={RouterLink} sx={{ color: 'var(--secondary-500)', cursor: 'pointer' }} underline="none" to={'/'}>
                        Về trang chủ
                    </Link>
                </div>
                <Button
                    size="medium"
                    component={RouterLink}
                    to="/"
                    className="secondary-cta"
                    sx={{
                        backgroundColor: 'var(--secondary-500)',
                        color: '#fff',
                        borderRadius: '10px',
                        height: '42px',
                        px: 1.5,
                        '&:hover': {
                            backgroundColor: 'var(--secondary-400)'
                        }
                    }}
                >
                    Tiếp tục xem sản phẩm
                </Button>
            </div>
        </div>
    )
}

function RenderPage() {
    const { success } = useNotify()

    if(localStorage.length > 0) {
        localStorage.clear()
        success("Đăng xuất thành công, bạn sẽ được chuyển về trang chủ")
        setTimeout(() => {
            window.location.href = '/'
        }, 2000)
    }

    return (
        <div className={'sign-in-main'}>
            <div className={'sign-in-main-container'}>
                <div className={'sign-in-login-area'}>
                    <RenderLoginArea/>
                </div>
                <div className={'sign-in-img-area sign-in-brand'}>
                    <div className="sign-in-brand__inner">
                        <img className="sign-in-brand__logo" src="/LaNhoBenThemLogo.png" alt="lanhobenthem" />
                        <Typography variant="h6" sx={{ color: '#e6f1ed', fontWeight: 700, m: 0 }}>Góc nhỏ xanh trong nhà</Typography>
                        <Typography variant="body2" sx={{ color: '#cfe9e1' }}>
                            Mỗi món quà xanh đều được chăm chút tỉ mỉ để gửi đến người bạn thương.
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignIn() {
    document.title = "Đăng nhập"
    return (
        <RenderPage/>
    )
}