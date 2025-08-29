import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    alpha,
    useTheme,
    Modal,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Snackbar
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { viewAccountBuyerList, activateAccount, banAccount } from '../../services/AccountService';

// Helper function to map API response to normalized data
function mapBuyerAccounts(apiResponse) {
    const message = apiResponse?.message || "";
    const list = Array.isArray(apiResponse?.data) ? apiResponse.data : [];

    const data = list.map(item => ({
        id: item.id ?? null,
        fullName: item.name ?? "",
        email: item.email ?? "",
        phoneNumber: item.phone ?? "",
        gender: item.gender ?? "UNKNOWN",
        address: item.address ?? "",
        avatarUrl: item.avatarUrl ?? null,
        isActive: Boolean(item.active),
        role: item.role ?? "BUYER",
        registeredAt: item.registerDate ?? null,
        registeredDate: item.registerDate ? new Date(item.registerDate) : null,
    }));

    return { message, data };
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return "N/A";
    }
}

// Helper function to get gender display
function getGenderDisplay(gender) {
    switch (gender) {
        case 'MALE':
            return { label: 'Nam', color: 'primary' };
        case 'FEMALE':
            return { label: 'Nữ', color: 'secondary' };
        default:
            return { label: 'Không xác định', color: 'default' };
    }
}

// Detail Modal Component
function AccountDetailModal({ open, onClose, account }) {
    if (!account) return null;
    
    const genderInfo = getGenderDisplay(account.gender);
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Chi tiết tài khoản
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    <Avatar
                        src={account.avatarUrl}
                        sx={{ width: 100, height: 100 }}
                    >
                        {account.fullName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            {account.fullName}
                        </Typography>
                        <Chip 
                            label={genderInfo.label} 
                            color={genderInfo.color}
                            variant="outlined"
                            sx={{ mb: 1 }}
                        />
                        <Chip
                            label={account.isActive ? "Đang hoạt động" : "Đã khóa"}
                            color={account.isActive ? "success" : "error"}
                            variant="filled"
                            icon={account.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                        />
                    </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <EmailIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                    {account.email}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <PhoneIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Số điện thoại
                                </Typography>
                                <Typography variant="body1">
                                    {account.phoneNumber || "Chưa cập nhật"}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <CalendarIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Ngày đăng ký
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(account.registeredAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            <LocationIcon color="primary" sx={{ mt: 0.5 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Địa chỉ
                                </Typography>
                                <Typography variant="body1">
                                    {account.address || "Chưa cập nhật"}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <PersonIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Vai trò
                                </Typography>
                                <Typography variant="body1">
                                    {account.role}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <CheckCircleIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Trạng thái
                                </Typography>
                                <Typography variant="body1">
                                    {account.isActive ? "Tài khoản đang hoạt động bình thường" : "Tài khoản đã bị khóa"}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} variant="outlined">
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function AccountBuyerInfo() {
    const theme = useTheme();
    const [buyerAccounts, setBuyerAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' // 'success', 'error', 'warning', 'info'
    });

    useEffect(() => {
        fetchBuyerAccounts();
    }, []);

    const fetchBuyerAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await viewAccountBuyerList();
            if (response?.data) {
                const normalized = mapBuyerAccounts(response.data);
                setBuyerAccounts(normalized.data);
                setMessage(normalized.message);
            } else {
                setError("Không thể tải dữ liệu tài khoản người mua");
            }
        } catch (err) {
            console.error('Error fetching buyer accounts:', err);
            setError("Đã xảy ra lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (account) => {
        setSelectedAccount(account);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedAccount(null);
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleToggleStatus = async (account) => {
        try {
            if (account.isActive) {
                // Cấm tài khoản
                const response = await banAccount(account.id);
                if (response?.data) {
                    setBuyerAccounts(prev => 
                        prev.map(acc => 
                            acc.id === account.id 
                                ? { ...acc, isActive: false }
                                : acc
                        )
                    );
                    showNotification(`Đã cấm tài khoản ${account.fullName} thành công`, 'success');
                }
            } else {
                // Kích hoạt tài khoản
                const response = await activateAccount(account.id);
                if (response?.data) {
                    setBuyerAccounts(prev => 
                        prev.map(acc => 
                            acc.id === account.id 
                                ? { ...acc, isActive: true }
                                : acc
                        )
                    );
                    showNotification(`Đã kích hoạt tài khoản ${account.fullName} thành công`, 'success');
                }
            }
        } catch (error) {
            // Axios throw error khi status 400, nhưng BE vẫn thành công
            if (error.response?.status === 400 && error.response?.data) {
                // Cập nhật UI dựa trên response từ error
                if (account.isActive) {
                    setBuyerAccounts(prev => 
                        prev.map(acc => 
                            acc.id === account.id 
                                ? { ...acc, isActive: false }
                                : acc
                        )
                    );
                    showNotification(`Đã cấm tài khoản ${account.fullName} thành công`, 'success');
                } else {
                    setBuyerAccounts(prev => 
                        prev.map(acc => 
                            acc.id === account.id 
                                ? { ...acc, isActive: true }
                                : acc
                        )
                    );
                    showNotification(`Đã kích hoạt tài khoản ${account.fullName} thành công`, 'success');
                }
            } else {
                // Lỗi thực sự
                showNotification(`Đã xảy ra lỗi khi thay đổi trạng thái tài khoản`, 'error');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px' 
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    mb: 1
                }}>
                    Quản lý tài khoản người mua
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {message || "Quản lý và theo dõi tất cả tài khoản người mua trong hệ thống"}
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                        color: 'white'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PersonIcon sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {buyerAccounts.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Tổng tài khoản
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
                        color: 'white'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircleIcon sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {buyerAccounts.filter(acc => acc.isActive).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Đang hoạt động
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.8)} 100%)`,
                        color: 'white'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BlockIcon sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {buyerAccounts.filter(acc => !acc.isActive).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Đã khóa
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                        color: 'white'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CalendarIcon sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {buyerAccounts.filter(acc => {
                                            if (!acc.registeredDate) return false;
                                            const today = new Date();
                                            const registered = new Date(acc.registeredDate);
                                            const diffTime = Math.abs(today - registered);
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            return diffDays <= 7;
                                        }).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Mới đăng ký
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Simplified Table */}
            <Paper sx={{ 
                width: '100%', 
                overflow: 'hidden', 
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
                <TableContainer>
                    <Table stickyHeader sx={{ minWidth: 1080 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '80px',
                                    textAlign: 'center'
                                }}>
                                    Avatar
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '200px'
                                }}>
                                    Tên
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '250px'
                                }}>
                                    Email
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '120px',
                                    textAlign: 'center'
                                }}>
                                    Vai trò
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '150px',
                                    textAlign: 'center'
                                }}>
                                    Trạng thái
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '160px',
                                    textAlign: 'center'
                                }}>
                                    Ngày đăng ký
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700, 
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white',
                                    width: '120px',
                                    textAlign: 'center'
                                }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {buyerAccounts.map((account) => (
                                <TableRow key={account.id} hover>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Avatar
                                            src={account.avatarUrl}
                                            sx={{ width: 50, height: 50, mx: 'auto' }}
                                        >
                                            {account.fullName.charAt(0)}
                                        </Avatar>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" sx={{ 
                                            fontWeight: 600,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {account.fullName}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" sx={{ 
                                            fontFamily: 'monospace',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {account.email}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={account.role}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={account.isActive ? "Đang hoạt động" : "Đã khóa"}
                                            color={account.isActive ? "success" : "error"}
                                            variant="filled"
                                            icon={account.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                                        />
                                    </TableCell>
                                    
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2">
                                            {formatDate(account.registeredAt)}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="Xem chi tiết">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(account)}
                                                    sx={{ color: theme.palette.info.main }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title={account.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleStatus(account)}
                                                    sx={{ 
                                                        color: account.isActive ? theme.palette.error.main : theme.palette.success.main 
                                                    }}
                                                >
                                                    {account.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {buyerAccounts.length === 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        py: 8,
                        color: 'text.secondary'
                    }}>
                        <PersonIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Không có tài khoản người mua nào
                        </Typography>
                        <Typography variant="body2">
                            Hãy đợi người dùng đăng ký hoặc kiểm tra lại kết nối API
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Detail Modal */}
            <AccountDetailModal
                open={detailModalOpen}
                onClose={handleCloseDetailModal}
                account={selectedAccount}
            />

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}