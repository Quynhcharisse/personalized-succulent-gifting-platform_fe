import React from "react";
import {Box, Button, Link, Paper, Typography} from "@mui/material";
import {useGoogleLogin} from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google';
import {signIn} from "../../services/AuthService.jsx";
import {getCookie} from "../../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";
import {enqueueSnackbar} from "notistack";
import axios from "axios";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const {search} = useLocation();
    const redirectTo = new URLSearchParams(search).get('redirectTo');

    async function HandleLogin(userInfo) {
        try {
            setIsLoading(true);

            const loginResponse = await signIn(userInfo.data.email, userInfo.data.name, userInfo.data.picture);

            if (loginResponse && loginResponse.status === 200) {
                const userDataToStore = loginResponse.data.data;
                
                // Đảm bảo avatar từ Google được lưu
                if (userInfo.data.picture && !userDataToStore.avatar && !userDataToStore.avatarUrl) {
                    userDataToStore.avatar = userInfo.data.picture;
                    userDataToStore.avatarUrl = userInfo.data.picture;
                }
                
                localStorage.setItem('user', JSON.stringify(userDataToStore));
                
                const access = getCookie('access');
                const role = jwtDecode(access)?.role;

                enqueueSnackbar(loginResponse.data.message, {variant: 'success', autoHideDuration: 1000});

                setTimeout(() => {
                    switch (role) {
                        case 'ADMIN':
                            navigate('/admin/dashboard', {replace: true});
                            break;
                        case 'SELLER':
                            navigate('/seller/dashboard', {replace: true});
                            break;
                        case 'BUYER': {
                            const target = redirectTo || '/';
                            navigate(target, {replace: true});
                            break;
                        }
                        default:
                            navigate('/', {replace: true});
                            break;
                    }
                }, 1000)
            }
        } catch (error) {
            console.error('HandleLogin error:', error);
            if (error.response) {
                console.error('Error response:', error.response);
                enqueueSnackbar(error.response.data.message || "Đăng nhập thất bại", {variant: "error"});
            } else if (error.request) {
                console.error('Network error:', error.request);
                enqueueSnackbar("Không thể kết nối đến máy chủ", {variant: "error"});
            } else {
                console.error('Other error:', error);
                enqueueSnackbar("Đăng nhập thất bại", {variant: "error"});
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function HandleSuccess(tokenResponse) {
        try {
            const userInfo = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                }
            );

            if (userInfo) {
                await HandleLogin(userInfo);
            } else {
                throw new Error('No user info in response');
            }
        } catch (e) {
            enqueueSnackbar("Không thể lấy thông tin người dùng", {variant: "error"});
            setIsLoading(false);
        }
    }

    function HandleError() {
        enqueueSnackbar("Đăng nhập thất bại", {variant: "error"});
        setIsLoading(false);
    }

    const login = useGoogleLogin({
        onSuccess: HandleSuccess,
        onError: HandleError,
        scope: 'openid email profile'
    });

    // Check if already logged in
    useEffect(() => {
        try {
            const access = getCookie('access')
            if (access) {
                const role = jwtDecode(access)?.role
                switch (role) {
                    case 'ADMIN':
                        navigate('/admin/dashboard', {replace: true})
                        break
                    case 'SELLER':
                        navigate('/seller/dashboard', {replace: true})
                        break
                    case 'BUYER':
                        navigate('/login', {replace: true})
                        break
                    default:
                        navigate('/', {replace: true})
                }
            }
        } catch (error) {
            localStorage.clear()
        }
    }, [navigate]);

    document.title = "Đăng nhập | Lá Nhỏ Bên Thềm"

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')",
                    opacity: 0.3,
                }
            }}
        >
            {/* Animated background elements */}
            <Box
                sx={{
                    position: "absolute",
                    top: "10%",
                    left: "10%",
                    width: 200,
                    height: 200,
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    animation: "float 6s ease-in-out infinite",
                    "@keyframes float": {
                        "0%, 100%": {transform: "translateY(0px) rotate(0deg)"},
                        "50%": {transform: "translateY(-20px) rotate(180deg)"}
                    }
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    bottom: "20%",
                    right: "15%",
                    width: 150,
                    height: 150,
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "50%",
                    animation: "float 8s ease-in-out infinite reverse",
                }}
            />

            <Paper
                elevation={24}
                sx={{
                    p: {xs: 3, sm: 4, md: 5},
                    borderRadius: 4,
                    textAlign: "center",
                    maxWidth: 420,
                    width: "90%",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    position: "relative",
                    zIndex: 1,
                    "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 35px 60px rgba(0,0,0,0.3)",
                        transition: "all 0.3s ease"
                    },
                    transition: "all 0.3s ease"
                }}
            >
                {/* Logo Section */}
                <Box sx={{mb: 4, position: "relative"}}>
                    <Box
                        sx={{
                            position: "relative",
                            display: "inline-block",
                            mb: 2
                        }}
                    >
                        <Box
                            component="img"
                            src="/LaNhoBenThemLogo.png"
                            alt="Lá Nhỏ Bên Thềm"
                            sx={{
                                height: 65,
                                width: 65,
                                borderRadius: "50%",
                                boxShadow: "0 8px 25px rgba(45, 106, 79, 0.4)",
                                border: "3px solid rgba(255, 255, 255, 0.8)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 12px 35px rgba(45, 106, 79, 0.6)"
                                }
                            }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                width: 20,
                                height: 20,
                                background: "linear-gradient(45deg, #2D6A4F, #1B4332)",
                                borderRadius: "50%",
                                animation: "pulse 2s infinite"
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.5px",
                            mb: 0.5
                        }}
                    >
                        Lá Nhỏ Bên Thềm
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#666",
                            fontWeight: 500,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            fontSize: "0.75rem"
                        }}
                    >
                        Góc nhỏ xanh trong nhà
                    </Typography>
                </Box>

                {/* Welcome Text */}
                <Box sx={{mb: 4}}>
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 1.5,
                            fontWeight: 700,
                            color: "#2c3e50",
                            letterSpacing: "-0.5px"
                        }}
                    >
                        Chào mừng trở lại
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#7f8c8d",
                            fontSize: "0.95rem",
                            lineHeight: 1.5,
                            maxWidth: 280,
                            mx: "auto"
                        }}
                    >
                        Đăng nhập để nhận ưu đãi, lưu giỏ hàng và theo dõi đơn
                    </Typography>
                </Box>

                {/* Google Login Button */}
                <Box sx={{mb: 4}}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={isLoading ? null : <GoogleIcon sx={{fontSize: 20}}/>}
                        onClick={() => !isLoading && login()}
                        disabled={isLoading}
                        sx={{
                            background: isLoading
                                ? "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)"
                                : "linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)",
                            color: 'white',
                            fontWeight: 600,
                            px: 5,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: 3,
                            boxShadow: isLoading
                                ? "0 4px 15px rgba(149, 165, 166, 0.4)"
                                : "0 8px 25px rgba(45, 106, 79, 0.4)",
                            textTransform: "none",
                            width: "100%",
                            maxWidth: 300,
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                transition: "left 0.5s"
                            },
                            "&:hover": {
                                background: isLoading
                                    ? "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)"
                                    : "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
                                boxShadow: isLoading
                                    ? "0 4px 15px rgba(149, 165, 166, 0.4)"
                                    : "0 12px 35px rgba(45, 106, 79, 0.6)",
                                transform: isLoading ? "none" : "translateY(-2px)",
                                "&::before": {
                                    left: isLoading ? "-100%" : "100%"
                                }
                            },
                            "&:active": {
                                transform: "translateY(0px)"
                            },
                            transition: "all 0.3s ease"
                        }}
                    >
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
                    </Button>
                </Box>

                {/* Footer Links */}
                <Box sx={{borderTop: "1px solid rgba(0,0,0,0.1)", pt: 2.5}}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#95a5a6",
                            lineHeight: 1.5,
                            fontSize: "0.75rem"
                        }}
                    >
                        Bằng việc đăng nhập, bạn đồng ý với{" "}
                        <Link
                            href="#"
                            sx={{
                                color: "#2D6A4F",
                                textDecoration: "none",
                                fontWeight: 600,
                                "&:hover": {
                                    textDecoration: "underline"
                                }
                            }}
                        >
                            Điều khoản dịch vụ
                        </Link>
                        {" "}và{" "}
                        <Link
                            href="#"
                            sx={{
                                color: "#2D6A4F",
                                textDecoration: "none",
                                fontWeight: 600,
                                "&:hover": {
                                    textDecoration: "underline"
                                }
                            }}
                        >
                            Chính sách bảo mật
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}