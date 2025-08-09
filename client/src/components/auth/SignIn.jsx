import '../../styles/auth/SignIn.css'
import { Button, Typography, Link } from "@mui/material";
import { KeyboardBackspace } from '@mui/icons-material';
import { getGoogleUrl } from "../../services/AuthService.jsx";
import useNotify from '../../hooks/useNotify.js'
import { Link as RouterLink } from 'react-router-dom'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'

function RenderLoginArea() {
    const { error } = useNotify()

    const signIn = async () => {
        try {
            const response = await getGoogleUrl()
            if (response?.status === 200 && response.data?.data?.url) {
                window.location.href = response.data.data.url
            } else {
                error('Không lấy được đường dẫn đăng nhập Google')
            }
        } catch (e) {
            error('Không thể kết nối máy chủ. Vui lòng thử lại')
        }
    }
    return (
        <div className={'sign-in-login-area-container'}>
            <span className="signin-eyebrow">Ưu đãi 20% cho đơn đầu tiên</span>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '.01em', color: 'var(--secondary-500)', textAlign: 'center' }}>
               Đăng nhập
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--muted)', textAlign: 'center' }}>
                Để nhận ưu đãi, lưu giỏ hàng và theo dõi đơn.
            </Typography>
            <Button
                fullWidth
                size="large"
                startIcon={<img src={'/google_logo.webp'} alt={'Google'} height={20} width={20} />}
                variant="outlined"  
                color="inherit"
                onClick={signIn}
                className="google-btn"
                sx={{
                    borderColor: 'var(--divider)',
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: 'var(--neutral-50)' }
                }}
            >
                Đăng nhập với Google
            </Button>
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
                        bgcolor: 'var(--secondary-500)',
                        color: '#fff',
                        borderRadius: '10px',
                        height: '42px',
                        px: 1.5,
                        '&:hover': { bgcolor: 'var(--secondary-400)' }
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