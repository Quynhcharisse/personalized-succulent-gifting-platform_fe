import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import {Delete as DeleteIcon, Warning as WarningIcon} from '@mui/icons-material';
import {deactiveProduct} from '@/services/ProductService.jsx';
import useNotify from '../../../hooks/useNotify.js';
import {DASHBOARD_STYLES} from '../../constants.js';

const DeactiveProduct = ({
                             open,
                             onClose,
                             product,
                             onSuccess
                         }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const {showNotification} = useNotify();

    const handleDeactive = async () => {
        if (!product?.id) {
            setError('Không tìm thấy ID sản phẩm');
            return;
        }

        try {
            setIsDeleting(true);
            setError(null);

            const response = await deactiveProduct(product.id);

            if (response && (response.status === 200 || response.status === 204)) {
                showNotification('Vô hiệu hóa sản phẩm thành công!', 'success');
                onSuccess && onSuccess();
                onClose();
            } else {
                const errorMessage = response?.data?.message || 'Vô hiệu hóa sản phẩm thất bại';
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa sản phẩm';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: DASHBOARD_STYLES.dialog
                }
            }}
        >
            <DialogTitle sx={{
                ...DASHBOARD_STYLES.dialogTitle,
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <WarningIcon sx={{fontSize: '2rem'}}/>
                    <Box>
                        <Typography variant="h5" sx={{fontWeight: 800, mb: 0.5}}>
                            Vô hiệu hóa sản phẩm
                        </Typography>
                        <Typography variant="body2" sx={{opacity: 0.9, fontWeight: 400}}>
                            Xác nhận vô hiệu hóa sản phẩm
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {error && (
                    <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                        {error}
                    </Alert>
                )}

                <Box sx={{textAlign: 'center', mb: 3}}>
                    <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                    }}>
                        <DeleteIcon sx={{fontSize: '2.5rem', color: '#f44336'}}/>
                    </Box>

                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2, color: 'text.primary'}}>
                        Bạn có chắc chắn muốn vô hiệu hóa sản phẩm này?
                    </Typography>
                </Box>

                {product && (
                    <Box sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
                        border: '1px solid rgba(76,175,80,0.15)',
                        mb: 3
                    }}>
                        <Typography variant="subtitle1" sx={{fontWeight: 800, mb: 1, color: '#0b3f31'}}>
                            Thông tin sản phẩm:
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            <Typography variant="body2">
                                <strong>Tên:</strong> {product.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>ID:</strong> {product.id}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Trạng thái hiện tại:</strong>
                                <Box component="span" sx={{
                                    ml: 1,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: product.status === 'available' ? '#e8f5e8' : '#fff3e0',
                                    color: product.status === 'available' ? '#2e7d32' : '#f57c00',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {product.status === 'available' ? 'Có sẵn' : product.status === 'unavailable' ? 'Hết hàng' : 'Bản nháp'}
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Alert severity="warning" sx={{borderRadius: 2}}>
                    <Typography variant="body2" sx={{fontWeight: 500}}>
                        <strong>Lưu ý:</strong> Sản phẩm sẽ được vô hiệu hóa và không còn hiển thị cho khách hàng.
                        Bạn có thể kích hoạt lại sản phẩm này sau nếu cần thiết.
                    </Typography>
                </Alert>
            </DialogContent>

            <DialogActions sx={{p: 3, backgroundColor: '#f7faf7'}}>
                <Button
                    onClick={handleClose}
                    disabled={isDeleting}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderColor: '#6c757d',
                        color: '#6c757d',
                        fontSize: '0.95rem',
                        minWidth: '120px'
                    }}
                >
                    Hủy
                </Button>

                <Button
                    onClick={handleDeactive}
                    disabled={isDeleting}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        px: 5,
                        py: 1.5,
                        background: 'linear-gradient(45deg, #f44336 30%, #e57373 90%)',
                        fontSize: '0.95rem',
                        minWidth: '160px',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                            boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                            background: '#e0e0e0',
                            color: '#9e9e9e',
                            boxShadow: 'none',
                            transform: 'none'
                        }
                    }}
                >
                    {isDeleting ? (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <CircularProgress size={18} color="inherit"/>
                            <Typography variant="body2">Đang xử lý...</Typography>
                        </Box>
                    ) : (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <DeleteIcon sx={{fontSize: '1.2rem'}}/>
                            Vô hiệu hóa
                        </Box>
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeactiveProduct;