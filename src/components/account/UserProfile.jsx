import React, {useEffect, useRef, useState} from 'react'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Fade,
    Grid,
    MenuItem,
    Skeleton,
    Slide,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import {alpha} from '@mui/material/styles'
import {
    AutoAwesome as AutoAwesomeIcon,
    Badge as BadgeIcon,
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    PhotoCamera as PhotoCameraIcon,
    Security as SecurityIcon
} from '@mui/icons-material'
import {enqueueSnackbar} from 'notistack'
import {updateProfile, viewProfile} from '../../services/AccountService.jsx'
import {COLORS, FENGSHUI, GENDERS, ZODIACS} from '../constants.js'
import {UserProfileValidation} from './UserProfileValidation.jsx';
import {uploadToCloudinary} from '../cloudinaryUpload.js';
import ActionButton from "../buttonCustom/ActionButton.jsx";


export default function UserProfile() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const [form, setForm] = useState({
        name: '',
        email: '',
        role: '',
        active: '',
        registerDate: '',
        phone: '',
        gender: '',
        address: '',
        avatarUrl: '',
        fengShui: '',
        zodiac: ''
    })
    const [errors, setErrors] = useState({})
    const [userRole, setUserRole] = useState('')
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [originalForm, setOriginalForm] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef(null)
    const abortController = useRef(null)

    const normalizeGender = (value) => {
        return ['MALE', 'FEMALE'].includes(value) ? value : '';
    };

    const extractUsernameFromEmail = (email) => {
        if (!email) return '';
        return email.split('@')[0];
    };

    const normalizeStringField = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value).trim();
        if (!str) return '';
        if (str.toUpperCase() === 'N/A') return '';
        return str;
    };

    useEffect(() => {
        let mounted = true

        async function load() {
            try {
                setLoading(true)

                let formData = {}
                let accountData = {}
                let userData = {}

                try {
                    const userFromStorage = localStorage.getItem('user')
                    if (userFromStorage) {
                        const parsedUser = JSON.parse(userFromStorage)

                        // Lấy dữ liệu cơ bản từ localStorage và dùng email làm username nếu không có tên
                        formData = {
                            name: normalizeStringField(parsedUser.user?.name || parsedUser.name) || extractUsernameFromEmail(parsedUser.email) || '',
                            email: parsedUser.email || '',
                            role: parsedUser.role || '',
                            active: parsedUser.active !== undefined ? parsedUser.active : true,
                            registerDate: parsedUser.registerDate || parsedUser.createdAt || '',
                            phone: normalizeStringField(parsedUser.user?.phone || parsedUser.phone),
                            gender: normalizeGender(parsedUser.user?.gender || parsedUser.gender),
                            address: normalizeStringField(parsedUser.user?.address || parsedUser.address),
                            avatarUrl: parsedUser.user?.avatarUrl || parsedUser.avatarUrl || parsedUser.avatar || '',
                            fengShui: normalizeStringField(parsedUser.user?.fengShui || parsedUser.fengShui),
                            zodiac: normalizeStringField(parsedUser.user?.zodiac || parsedUser.zodiac)
                        }


                        setUserRole(parsedUser.role || '')
                        setForm(formData)
                        setOriginalForm(formData)
                    }
                } catch (storageError) {
                    console.error('Error parsing localStorage:', storageError)
                }

                // Sau đó gọi API để cập nhật thông tin chi tiết
                try {
                    const res = await viewProfile()

                    if (res?.data?.data) {
                        accountData = res.data.data
                        userData = accountData.user || {}

                        if (mounted) {
                            // Cập nhật form với dữ liệu từ API, ưu tiên dữ liệu mới
                            const updatedFormData = {
                                name: normalizeStringField(userData.name) || normalizeStringField(formData.name) || extractUsernameFromEmail(accountData.email) || '',
                                email: accountData.email || formData.email || '',
                                role: accountData.role || formData.role || '',
                                active: accountData.active !== undefined ? accountData.active : formData.active,
                                registerDate: accountData.registerDate || formData.registerDate || '',
                                phone: normalizeStringField(userData.phone) || normalizeStringField(formData.phone) || '',
                                gender: normalizeGender(userData.gender || formData.gender),
                                address: normalizeStringField(userData.address) || normalizeStringField(formData.address) || '',
                                avatarUrl: userData.avatarUrl || formData.avatarUrl || '',
                                fengShui: normalizeStringField(userData.fengShui) || normalizeStringField(formData.fengShui) || '',
                                zodiac: normalizeStringField(userData.zodiac) || normalizeStringField(formData.zodiac) || ''
                            }

                            setUserRole(accountData.role || formData.role || '')
                            setForm(updatedFormData)
                            setOriginalForm(updatedFormData)
                        }
                    }
                } catch (apiError) {
                    console.error('API Error:', apiError)
                    // Nếu API lỗi, vẫn giữ dữ liệu từ localStorage
                    if (mounted && Object.keys(formData).length > 0) {
                        enqueueSnackbar('Không thể cập nhật thông tin từ server, sử dụng dữ liệu local', {variant: 'warning'})
                    }
                }

            } catch (e) {
                console.error('Load error:', e)
                enqueueSnackbar('Không tải được hồ sơ', {variant: 'error'})
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        load()
        return () => {
            mounted = false
        }
    }, [])

    function handleChange(field) {
        return (e) => {
            const value = e.target.value
            setForm((prev) => ({...prev, [field]: value}))
            if (errors[field]) {
                setErrors(prev => ({...prev, [field]: ''}))
            }
        }
    }

    function handleEdit() {
        setIsEditing(true)
        setErrors({})
    }

    function handleCancel() {
        setForm(originalForm)
        setIsEditing(false)
        setErrors({})
        setPreviewImage(null)
    }

    function getGenderLabel(value) {
        return GENDERS.find(g => g.value === value)?.label || value
    }

    function getFengShuiInfo(value) {
        return FENGSHUI.find(f => f.value === value) || {label: value, color: COLORS.primary}
    }

    function getZodiacInfo(value) {
        return ZODIACS.find(z => z.value === value) || {label: value, icon: '⭐'}
    }

    function updateLocalStorageUser(partial) {
        try {
            const userFromStorage = localStorage.getItem('user')
            if (!userFromStorage) return
            const parsedUser = JSON.parse(userFromStorage)

            const updated = {...parsedUser}
            if (updated.user && typeof updated.user === 'object') {
                updated.user = {...updated.user, ...partial}
            }
            // mirror some fields at top-level if they exist in current shape
            const mirrorKeys = ['name', 'phone', 'gender', 'address', 'avatarUrl', 'fengShui', 'zodiac']
            mirrorKeys.forEach((k) => {
                if (Object.prototype.hasOwnProperty.call(updated, k) && Object.prototype.hasOwnProperty.call(partial, k)) {
                    updated[k] = partial[k]
                }
            })

            localStorage.setItem('user', JSON.stringify(updated))
        } catch (e) {
            // no-op
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const error = UserProfileValidation(form, originalForm);
        setErrors(error);
        if (Object.keys(error).length > 0) {
            enqueueSnackbar('Vui lòng kiểm tra lại thông tin', {variant: 'warning'})
            return
        }
        try {
            setLoading(true)
            const payload = {
                phone: form.phone,
                gender: form.gender,
                address: form.address,
                avatarUrl: form.avatarUrl,
                fengShui: form.fengShui,
                zodiac: form.zodiac
            }
            // Only update name if user actually changed it
            const trimmedCurrentName = (form.name || '').trim()
            const trimmedOriginalName = (originalForm?.name || '').trim()
            if (trimmedCurrentName !== trimmedOriginalName) {
                payload.name = trimmedCurrentName
            }

            const res = await updateProfile(payload)
            if (res?.status === 200) {
                enqueueSnackbar(res?.data?.message || 'Cập nhật thông tin thành công', {variant: 'success'})
                setOriginalForm(form)
                setIsEditing(false)
                setErrors({})
                updateLocalStorageUser(payload)
            } else {
                enqueueSnackbar(res?.data?.message || 'Cập nhật không thành công', {variant: 'warning'})
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Cập nhật thất bại'
            enqueueSnackbar(errorMessage, {variant: 'error'})
        } finally {
            setLoading(false)
        }
    }

    if (loading && !originalForm) {
        return (
            <Container maxWidth="xl" sx={{py: 4}}>
                <Skeleton variant="rectangular" height={300} sx={{borderRadius: 4, mb: 4}}/>
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={4}>
                        <Skeleton variant="rectangular" height={500} sx={{borderRadius: 4}}/>
                    </Grid>
                    <Grid item xs={12} lg={8}>
                        <Skeleton variant="rectangular" height={500} sx={{borderRadius: 4}}/>
                    </Grid>
                </Grid>
            </Container>
        )
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, 
                ${alpha(COLORS.primary, 0.03)} 0%, 
                ${alpha(COLORS.surfaceVariant, 0.08)} 25%,
                ${alpha(COLORS.accent, 0.05)} 50%,
                ${alpha(COLORS.surface, 0.95)} 100%)`,
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '300px',
                background: COLORS.gradient.primary,
                opacity: 0.1,
                zIndex: 0
            }
        }}>
            <Container maxWidth="xl" sx={{py: 4, position: 'relative', zIndex: 1}}>
                {/* Modern Hero Header */}
                <Fade in timeout={800}>
                    <Card sx={{
                        mb: 6,
                        borderRadius: 6,
                        background: COLORS.gradient.primary,
                        color: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.3)}`,
                        border: 'none'
                    }}>
                        {/* Decorative elements */}
                        <Box sx={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${alpha('#ffffff', 0.15)} 0%, transparent 70%)`,
                        }}/>
                        <Box sx={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.3)} 0%, transparent 70%)`,
                        }}/>

                        <CardContent sx={{p: {xs: 3, md: 5}, position: 'relative', zIndex: 1}}>
                            <Stack
                                direction={{xs: 'column', md: 'row'}}
                                alignItems={{xs: 'flex-start', md: 'center'}}
                                justifyContent="space-between"
                                spacing={3}
                            >
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{mb: 2}}>
                                        <AutoAwesomeIcon sx={{fontSize: 32, color: COLORS.accent}}/>
                                        <Typography variant={isMobile ? "h4" : "h3"} sx={{
                                            fontWeight: 800,
                                            background: `linear-gradient(45deg, #ffffff 30%, ${COLORS.accent} 90%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            Hồ sơ cá nhân
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h6" sx={{
                                        opacity: 0.9,
                                        fontWeight: 400,
                                        maxWidth: 500
                                    }}>
                                        Quản lý thông tin cá nhân
                                    </Typography>
                                </Box>


                            </Stack>
                        </CardContent>
                    </Card>
                </Fade>

                {/* Account Status Card */}
                <Slide direction="up" in timeout={600}>
                    <Card sx={{
                        mb: 4,
                        borderRadius: 4,
                        border: `1px solid ${alpha(COLORS.success, 0.2)}`,
                        background: COLORS.gradient.card,
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 8px 32px ${alpha(COLORS.success, 0.1)}`
                    }}>
                        <CardContent sx={{py: 2}}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 3,
                                    background: COLORS.gradient.secondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <SecurityIcon sx={{color: 'white', fontSize: 24}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="h6" sx={{fontWeight: 700, color: COLORS.primary, mb: 0.5}}>
                                        Tài khoản đã xác thực
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Hồ sơ của bạn đã được xác minh và bảo mật với vai trò
                                        : <strong>{userRole}</strong>
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<CheckCircleIcon sx={{fontSize: 16}}/>}
                                    label="Đã xác thực"
                                    color="success"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 2
                                    }}
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                </Slide>

                {/* Main Profile Card - Horizontal Layout like the image */}
                <Fade in timeout={800}>
                    <Card sx={{
                        borderRadius: 6,
                        background: COLORS.gradient.card,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                        boxShadow: `0 20px 60px ${alpha(COLORS.primary, 0.15)}`,
                        overflow: 'hidden',
                        mb: 4
                    }}>
                        <CardContent sx={{p: 0}}>
                            <Grid container>
                                {/* Left Side - Avatar Section */}
                                <Grid item xs={12} md={4}>
                                    <Box sx={{
                                        p: 4,
                                        background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.05)} 0%, ${alpha(COLORS.accent, 0.08)} 100%)`,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        position: 'relative'
                                    }}>
                                        {/* Decorative element */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: -30,
                                            right: -30,
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.2)} 0%, transparent 70%)`,
                                        }}/>

                                        {/* Avatar with camera overlay */}
                                        <Box sx={{position: 'relative', mb: 3}}>
                                            <Avatar
                                                src={previewImage || form.avatarUrl}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    border: `3px solid ${COLORS.surface}`,
                                                    boxShadow: `0 8px 32px ${alpha(COLORS.primary, 0.3)}`,
                                                }}
                                            >
                                                <PersonIcon sx={{fontSize: 60, color: COLORS.primary}}/>
                                            </Avatar>

                                            {/* Hidden file input */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{display: 'none'}}
                                                ref={fileInputRef}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        try {
                                                            // Preview image
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setPreviewImage(reader.result);
                                                            };
                                                            reader.readAsDataURL(file);

                                                            // Nếu đang upload cũ thì abort
                                                            if (abortController.current) {
                                                                abortController.current.abort();
                                                            }
                                                            abortController.current = new AbortController();

                                                            // Upload to Cloudinary dùng hook chung
                                                            const imageUrl = await uploadToCloudinary(file, {
                                                                onProgress: setUploadProgress,
                                                                signal: abortController.current.signal
                                                            });
                                                            if (imageUrl) {
                                                                setForm(prev => ({...prev, avatarUrl: imageUrl}));
                                                                enqueueSnackbar("Upload ảnh thành công!", {variant: "success"});
                                                            } else {
                                                                setPreviewImage(null);
                                                            }
                                                        } catch (error) {
                                                            console.error("File upload error:", error);
                                                            setPreviewImage(null);
                                                            enqueueSnackbar("Lỗi khi xử lý file", {variant: "error"});
                                                        } finally {
                                                            setUploadProgress(0);
                                                            abortController.current = null;
                                                        }
                                                    }
                                                }}
                                            />

                                            {/* Camera icon overlay */}
                                            <Box
                                                onClick={() => isEditing && fileInputRef.current?.click()}
                                                sx={{
                                                    position: 'relative',
                                                    '&::after': uploadProgress > 0 ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: -2,
                                                        left: 0,
                                                        width: `${uploadProgress}%`,
                                                        height: 2,
                                                        backgroundColor: COLORS.accent,
                                                        borderRadius: 1,
                                                        transition: 'width 0.3s ease'
                                                    } : {},
                                                    top: -10,
                                                    right: -10,
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    backgroundColor: alpha(COLORS.primary, 0.9),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    cursor: isEditing ? 'pointer' : 'default',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': isEditing ? {
                                                        backgroundColor: COLORS.primary,
                                                        transform: 'scale(1.1)'
                                                    } : {}
                                                }}
                                            >
                                                <PhotoCameraIcon fontSize="small"/>
                                            </Box>
                                        </Box>

                                        {/* Role Badge */}
                                        <Chip
                                            icon={<BadgeIcon sx={{fontSize: 14}}/>}
                                            label={userRole}
                                            size="small"
                                            sx={{
                                                background: COLORS.gradient.secondary,
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 2
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Right Side - Information Section */}
                                <Grid item xs={12} md={8}>
                                    <Box sx={{p: 4}}>
                                        {/* Header with Edit Button */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start"
                                               sx={{mb: 4}}>
                                            <Box>
                                                {isEditing ? (
                                                    <TextField
                                                        fullWidth
                                                        value={form.name}
                                                        onChange={handleChange('name')}
                                                        error={!!errors.name}
                                                        helperText={errors.name || 'Tên phải có ít nhất 3 ký tự'}
                                                        placeholder="Nhập tên của bạn"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                backgroundColor: COLORS.surface,
                                                                fontSize: '1.5rem',
                                                                fontWeight: 800,
                                                                '&.Mui-focused': {
                                                                    boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.2)}`
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="h4" sx={{
                                                        fontWeight: 800,
                                                        color: COLORS.primary,
                                                        mb: 1
                                                    }}>
                                                        {form.name || 'Chưa có tên'}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {!isEditing ? (
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<EditIcon/>}
                                                    onClick={handleEdit}
                                                    sx={{
                                                        borderRadius: 3,
                                                        borderColor: COLORS.primary,
                                                        color: COLORS.primary,
                                                        px: 3,
                                                        py: 1,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '0.95rem',
                                                        '&:hover': {
                                                            borderColor: COLORS.primaryDark,
                                                            backgroundColor: alpha(COLORS.primary, 0.05)
                                                        }
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            ) : null}
                                        </Stack>

                                        {/* Information Display in Columns with Inline Editing */}
                                        <form onSubmit={handleSubmit}>
                                            <Grid container spacing={4}>
                                                {/* Left Column */}
                                                <Grid item xs={12} md={6}>
                                                    {/* Email Field - Read Only */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Email
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            color: 'text.primary',
                                                            fontSize: '1rem',
                                                            fontWeight: 500,
                                                            backgroundColor: alpha(COLORS.primary, 0.05),
                                                            p: 1.5,
                                                            borderRadius: 1,
                                                            border: `1px solid ${alpha(COLORS.primary, 0.1)}`
                                                        }}>
                                                            {form.email || 'Chưa có email'}
                                                        </Typography>
                                                    </Box>

                                                    {/* Role Field - Read Only */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Vai trò
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            color: 'text.primary',
                                                            fontSize: '1rem',
                                                            fontWeight: 500,
                                                            backgroundColor: alpha(COLORS.primary, 0.05),
                                                            p: 1.5,
                                                            borderRadius: 1,
                                                            border: `1px solid ${alpha(COLORS.primary, 0.1)}`
                                                        }}>
                                                            {form.role || 'Chưa có vai trò'}
                                                        </Typography>
                                                    </Box>

                                                    {/* Active Status Field - Read Only */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Trạng thái
                                                        </Typography>
                                                        <Chip
                                                            label={form.active ? 'Đang hoạt động' : 'Không hoạt động'}
                                                            size="small"
                                                            color={form.active ? 'success' : 'default'}
                                                            sx={{
                                                                fontWeight: 500,
                                                                borderRadius: 2,
                                                                height: 28,
                                                                backgroundColor: form.active ? COLORS.success : alpha(COLORS.primary, 0.1),
                                                                color: form.active ? 'white' : COLORS.primary
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Registered Date Field - Read Only */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Ngày đăng ký
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            color: 'text.primary',
                                                            fontSize: '1rem',
                                                            fontWeight: 500,
                                                            backgroundColor: alpha(COLORS.primary, 0.05),
                                                            p: 1.5,
                                                            borderRadius: 1,
                                                            border: `1px solid ${alpha(COLORS.primary, 0.1)}`
                                                        }}>
                                                            {form.registerDate ? new Date(form.registerDate).toLocaleDateString('vi-VN') : 'Chưa có ngày đăng ký'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                {/* Right Column */}
                                                <Grid item xs={12} md={6}>
                                                    {/* Address Field */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Địa chỉ
                                                        </Typography>
                                                        {isEditing ? (
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                value={form.address}
                                                                onChange={handleChange('address')}
                                                                error={!!errors.address}
                                                                helperText={errors.address}
                                                                placeholder="Nhập địa chỉ của bạn"
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 2,
                                                                        backgroundColor: COLORS.surface,
                                                                        '&.Mui-focused': {
                                                                            boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.2)}`
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" sx={{
                                                                color: 'text.primary',
                                                                fontSize: '1rem',
                                                                fontWeight: 500,
                                                                lineHeight: 1.6
                                                            }}>
                                                                {form.address || 'Chưa có địa chỉ'}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    {/* Phone Field */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Số điện thoại
                                                        </Typography>
                                                        {isEditing ? (
                                                            <TextField
                                                                fullWidth
                                                                value={form.phone}
                                                                onChange={handleChange('phone')}
                                                                error={!!errors.phone}
                                                                helperText={errors.phone}
                                                                placeholder="Nhập số điện thoại"
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 2,
                                                                        backgroundColor: COLORS.surface,
                                                                        '&.Mui-focused': {
                                                                            boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.2)}`
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" sx={{
                                                                color: 'text.primary',
                                                                fontSize: '1rem',
                                                                fontWeight: 500
                                                            }}>
                                                                {form.phone || 'Chưa có số điện thoại'}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    {/* Gender Field */}
                                                    <Box sx={{mb: 4}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700,
                                                            color: COLORS.primary,
                                                            mb: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Giới tính
                                                        </Typography>
                                                        {isEditing ? (
                                                            <TextField
                                                                select
                                                                fullWidth
                                                                value={form.gender}
                                                                onChange={handleChange('gender')}
                                                                error={!!errors.gender}
                                                                helperText={errors.gender}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 2,
                                                                        backgroundColor: COLORS.surface,
                                                                        '&.Mui-focused': {
                                                                            boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.2)}`
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {GENDERS.map(g => (
                                                                    <MenuItem key={g.value} value={g.value}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1
                                                                        }}>
                                                                            <span
                                                                                style={{fontSize: '18px'}}>{g.icon}</span>
                                                                            {g.label}
                                                                        </Box>
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        ) : (
                                                            <Chip
                                                                label={getGenderLabel(form.gender)}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: alpha(COLORS.primary, 0.1),
                                                                    color: COLORS.primary,
                                                                    fontWeight: 500,
                                                                    borderRadius: 2,
                                                                    height: 28
                                                                }}
                                                            />
                                                        )}
                                                    </Box>

                                                    {/* FengShui & Zodiac for BUYER */}
                                                    {userRole === 'BUYER' && (
                                                        <>
                                                            {/* FengShui Field */}
                                                            <Box sx={{mb: 4}}>
                                                                <Typography variant="subtitle2" sx={{
                                                                    fontWeight: 700,
                                                                    color: COLORS.primary,
                                                                    mb: 1,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                    fontSize: '0.75rem'
                                                                }}>
                                                                    Ngũ hành
                                                                </Typography>
                                                                {isEditing ? (
                                                                    <TextField
                                                                        select
                                                                        fullWidth
                                                                        value={form.fengShui}
                                                                        onChange={handleChange('fengShui')}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: 2,
                                                                                backgroundColor: COLORS.surface,
                                                                                '&.Mui-focused': {
                                                                                    boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.2)}`
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {FENGSHUI.map(f => (
                                                                            <MenuItem key={f.value} value={f.value}>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1.5
                                                                                }}>
                                                                                    <Box sx={{
                                                                                        width: 16,
                                                                                        height: 16,
                                                                                        borderRadius: '50%',
                                                                                        backgroundColor: f.color,
                                                                                        boxShadow: `0 2px 8px ${alpha(f.color, 0.4)}`
                                                                                    }}/>
                                                                                    <Typography
                                                                                        sx={{fontWeight: 500}}>{f.label}</Typography>
                                                                                </Box>
                                                                            </MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                ) : (
                                                                    <Chip
                                                                        label={getFengShuiInfo(form.fengShui).label}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: getFengShuiInfo(form.fengShui).color,
                                                                            color: 'white',
                                                                            fontWeight: 500,
                                                                            borderRadius: 2,
                                                                            height: 28
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>

                                                            {/* Zodiac Field */}
                                                            <Box sx={{mb: 4}}>
                                                                <Typography variant="subtitle2" sx={{
                                                                    fontWeight: 700,
                                                                    color: COLORS.primary,
                                                                    mb: 1,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                    fontSize: '0.75rem'
                                                                }}>
                                                                    Cung hoàng đạo
                                                                </Typography>
                                                                {isEditing ? (
                                                                    <TextField
                                                                        select
                                                                        fullWidth
                                                                        value={form.zodiac}
                                                                        onChange={handleChange('zodiac')}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: 2,
                                                                                backgroundColor: COLORS.surface,
                                                                                '&.Mui-focused': {
                                                                                    boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.2)}`
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {ZODIACS.map(z => (
                                                                            <MenuItem key={z.value} value={z.value}>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1.5
                                                                                }}>
                                                                                    <Typography
                                                                                        sx={{fontSize: '18px'}}>{z.icon}</Typography>
                                                                                    <Typography
                                                                                        sx={{fontWeight: 500}}>{z.label}</Typography>
                                                                                </Box>
                                                                            </MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                ) : (
                                                                    <Chip
                                                                        icon={<span
                                                                            style={{fontSize: '14px'}}>{getZodiacInfo(form.zodiac).icon}</span>}
                                                                        label={getZodiacInfo(form.zodiac).label}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: alpha(COLORS.info, 0.1),
                                                                            color: COLORS.info,
                                                                            fontWeight: 500,
                                                                            borderRadius: 2,
                                                                            height: 28
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </>
                                                    )}

                                                    {/* Save & Cancel Buttons - Only show when editing */}
                                                    {isEditing && (
                                                        <Stack direction="row" spacing={2} justifyContent="flex-end"
                                                               sx={{mt: 2}}>
                                                            <ActionButton
                                                                action="cancel"
                                                                type="button"
                                                                onClick={handleCancel}
                                                            >
                                                                Hủy
                                                            </ActionButton>
                                                            <ActionButton
                                                                action="primary"
                                                                loading={loading}
                                                                type="submit"
                                                                disabled={loading}
                                                            >
                                                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                            </ActionButton>
                                                        </Stack>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        </Box>
    )
}
