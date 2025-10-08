import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Warning as WarningIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { deactiveProduct } from '../../../services/ProductService.jsx';
import { useNotify } from '../../../hooks/useNotify.js';

const DeactiveProduct = ({
    open,
    onClose,
    product,
    onSuccess
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    
    const { showNotification } = useNotify();

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
            console.error('Error deactivating product:', err);
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
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.12)',
                        border: '2px solid rgba(244, 67, 54, 0.1)'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.3rem',
                py: 3,
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WarningIcon sx={{ fontSize: '2rem' }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                            Vô hiệu hóa sản phẩm
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 400 }}>
                            Xác nhận vô hiệu hóa sản phẩm
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                        <DeleteIcon sx={{ fontSize: '2.5rem', color: '#f44336' }} />
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                        Bạn có chắc chắn muốn vô hiệu hóa sản phẩm này?
                    </Typography>
                </Box>

                {product && (
                    <Box sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        mb: 3
                    }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                            Thông tin sản phẩm:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        <strong>Lưu ý:</strong> Sản phẩm sẽ được vô hiệu hóa và không còn hiển thị cho khách hàng. 
                        Bạn có thể kích hoạt lại sản phẩm này sau nếu cần thiết.
                    </Typography>
                </Alert>
            </DialogContent>

            <DialogActions sx={{
                p: 4,
                gap: 2,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderTop: '2px solid rgba(244, 67, 54, 0.1)',
                justifyContent: 'space-between',
                minHeight: '80px',
                borderRadius: '0 0 12px 12px'
            }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={18} color="inherit" />
                            <Typography variant="body2">Đang xử lý...</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                            Vô hiệu hóa
                        </Box>
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeactiveProduct;