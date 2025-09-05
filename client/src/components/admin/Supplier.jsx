import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Alert, CircularProgress, Tooltip, IconButton } from '@mui/material';
import { Check, Close, HelpOutline } from '@mui/icons-material';
import { getSupplierList, createSupplier, updateSupplier, updateSupplierStatus } from '../../services/ProductService.jsx';

export default function Supplier() {
    const [list, setList] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create | update | view
    const [formData, setFormData] = useState({ id: '', name: '', contactPerson: '', phone: '', email: '', address: '', description: '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState({ type: '', text: '' });
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const formatDate = (iso) => {
        if (!iso) return '-';
        try { return new Date(iso).toLocaleString(); } catch { return iso; }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await getSupplierList();
                const supplierList = res?.data?.data || res || [];
                setList(Array.isArray(supplierList) ? supplierList : []);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    const openCreate = () => {
        setModalMode('create');
        setFormData({ id: '', name: '', contactPerson: '', phone: '', email: '', address: '', description: '' });
        setErrors({});
        setNotice({ type: '', text: '' });
        setModalOpen(true);
    };

    const openUpdate = (item) => {
        setModalMode('update');
        setFormData({
            id: item?.id || '',
            name: item?.supplierName || item?.name || '',
            contactPerson: item?.contactPerson || '',
            phone: item?.phone || '',
            email: item?.email || '',
            address: item?.address || '',
            description: item?.description || ''
        });
        setErrors({});
        setNotice({ type: '', text: '' });
        setModalOpen(true);
    };

    const openView = (item) => {
        setModalMode('view');
        setFormData({
            id: item?.id || '',
            name: item?.supplierName || item?.name || '',
            contactPerson: item?.contactPerson || '',
            phone: item?.phone || '',
            email: item?.email || '',
            address: item?.address || '',
            description: item?.description || ''
        });
        setErrors({});
        setNotice({ type: '', text: '' });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const onChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        
        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'Tên nhà cung cấp là bắt buộc';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Tên nhà cung cấp phải có ít nhất 2 ký tự';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Tên nhà cung cấp không được vượt quá 100 ký tự';
        }
        
        // Validate contact person
        if (formData.contactPerson.trim() && formData.contactPerson.trim().length < 2) {
            newErrors.contactPerson = 'Tên người liên hệ phải có ít nhất 2 ký tự';
        } else if (formData.contactPerson.trim().length > 50) {
            newErrors.contactPerson = 'Tên người liên hệ không được vượt quá 50 ký tự';
        }
        
        // Validate phone
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Số điện thoại phải có 10-15 chữ số và chỉ chứa số, dấu +, -, (), khoảng trắng';
        }
        
        // Validate email
        if (formData.email.trim()) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                newErrors.email = 'Email không đúng định dạng';
            } else if (formData.email.trim().length > 100) {
                newErrors.email = 'Email không được vượt quá 100 ký tự';
            }
        }
        
        // Validate address
        if (formData.address.trim() && formData.address.trim().length > 200) {
            newErrors.address = 'Địa chỉ không được vượt quá 200 ký tự';
        }
        
        // Validate description
        if (formData.description.trim() && formData.description.trim().length > 500) {
            newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async () => {
        if (modalMode === 'view') return closeModal();
        if (!validate()) return;
        setSaving(true);
        setNotice({ type: '', text: '' });
        try {
            const payload = {
                ...(formData.id ? { id: Number(formData.id) } : {}),
                name: formData.name.trim(),
                contactPerson: formData.contactPerson.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                description: formData.description.trim()
            };
            const res = modalMode === 'update' ? await updateSupplier(payload) : await createSupplier(payload);
            setNotice({
                type: 'success', text: res?.data.message || 'Thành công'
            });
            // refresh list
            try {
                const refreshed = await getSupplierList();
                const supplierList = refreshed?.data?.data || refreshed || [];
                setList(Array.isArray(supplierList) ? supplierList : []);
            } catch {}
            setTimeout(() => setModalOpen(false), 300);
        } catch (e) {
            setNotice({ type: 'error', text: 'Không thể lưu nhà cung cấp' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (supplierId) => {
        setUpdatingStatus(supplierId);
        try {
            const res = await updateSupplierStatus(supplierId);
            setNotice({
                type: 'success', 
                text: res?.message || 'Cập nhật trạng thái thành công'
            });
            // refresh list
            try {
                const refreshed = await getSupplierList();
                const supplierList = refreshed?.data?.data || refreshed || [];
                setList(Array.isArray(supplierList) ? supplierList : []);
            } catch {}
            // Auto hide notice after 3 seconds
            setTimeout(() => {
                setNotice({ type: '', text: '' });
            }, 3000);
        } catch (e) {
            setNotice({ 
                type: 'error', 
                text: 'Không thể cập nhật trạng thái nhà cung cấp' 
            });
            // Auto hide error notice after 5 seconds
            setTimeout(() => {
                setNotice({ type: '', text: '' });
            }, 5000);
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Nhà cung cấp
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Danh sách nhà cung cấp và biểu mẫu tạo/cập nhật.
                </Typography>

                {/* Global Notice */}
                {notice.text && (
                    <Alert 
                        severity={notice.type === 'error' ? 'error' : 'success'} 
                        sx={{ 
                            mb: 3, 
                            borderRadius: 2,
                            '& .MuiAlert-message': { fontWeight: 500 }
                        }}
                    >
                        {notice.text}
                    </Alert>
                )}

                {/* List suppliers - Table view only */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Danh sách</Typography>
                        <Button variant="contained" onClick={openCreate}>Tạo nhà cung cấp</Button>
                    </Stack>
                    <Paper variant="outlined" sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', bgcolor: 'primary.main', color: 'primary.contrastText', px: 2, py: 1.5, fontWeight: 700 }}>
                            <Box sx={{ flex: 1, textAlign: 'left', pl: 1, fontSize: '0.875rem' }}>ID</Box>
                            <Box sx={{ flex: 5, textAlign: 'left', pl: 1, fontSize: '0.875rem' }}>Tên nhà cung cấp</Box>
                            <Box sx={{ flex: 4, textAlign: 'left', pl: 1, fontSize: '0.875rem' }}>Người liên hệ</Box>
                            <Box sx={{ flex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, pl: 1 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                    Kích hoạt / Ngưng kích hoạt
                                </Typography>
                                <Tooltip title="Bật/tắt trạng thái hoạt động của nhà cung cấp" arrow>
                                    <IconButton size="small" sx={{ p: 0, color: 'inherit' }}>
                                        <HelpOutline sx={{ fontSize: '0.875rem' }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box sx={{ flex: 3, textAlign: 'center', pl: 1, fontSize: '0.875rem' }}>Ngày tạo</Box>
                            <Box sx={{ flex: 3, textAlign: 'center', fontSize: '0.875rem' }}>Thao tác</Box>
                        </Box>
                        {list.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">Không có nhà cung cấp nào</Typography>
                                <Typography variant="body2" color="text.secondary">Hãy tạo mới nhà cung cấp</Typography>
                            </Box>
                        ) : (
                            list.map((s) => (
                                <Box key={s.id} sx={{ display: 'flex', px: 2, py: 1.25, borderTop: '1px solid #eee', alignItems: 'center' }}>
                                    <Box sx={{ flex: 1, textAlign: 'left', fontWeight: 600, color: 'primary.main', pl: 1, fontSize: '0.875rem' }}>{s.id}</Box>
                                    <Box sx={{ flex: 5, textAlign: 'left', pl: 1, pr: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                                            {s.supplierName || s.name}
                                        </Typography>
                                        <Box sx={{ 
                                            display: 'inline-block', 
                                            px: 1, 
                                            py: 0.25, 
                                            borderRadius: 1, 
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            mb: 0.5,
                                            bgcolor: s.status === 'Đang hoạt động' ? '#e8f5e8' : '#ffebee',
                                            color: s.status === 'Đang hoạt động' ? '#2e7d32' : '#c62828'
                                        }}>
                                            {s.status}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                                            {s.phone && `📞 ${s.phone}`}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                                            {s.email && `✉️ ${s.email}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 4, textAlign: 'left', pl: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                            {s.contactPerson || '-'}
                                        </Typography>
                                        {s.address && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', fontSize: '0.75rem' }}>
                                                📍 {s.address}
                                            </Typography>
                                        )}
                                    </Box>
                                    {/* Cột toggle switch */}
                                    <Box sx={{ flex: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', pl: 1 }}>
                                        <Box
                                            onClick={() => handleUpdateStatus(s.id)}
                                            sx={{
                                                width: 44,
                                                height: 24,
                                                borderRadius: 12,
                                                bgcolor: s.status === 'Đang hoạt động' ? '#4caf50' : '#e0e0e0',
                                                position: 'relative',
                                                cursor: updatingStatus === s.id ? 'not-allowed' : 'pointer',
                                                opacity: updatingStatus === s.id ? 0.6 : 1,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    opacity: updatingStatus === s.id ? 0.6 : 0.8
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    bgcolor: 'white',
                                                    position: 'absolute',
                                                    top: 2,
                                                    left: s.status === 'Đang hoạt động' ? 22 : 2,
                                                    transition: 'left 0.3s ease',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {updatingStatus === s.id ? (
                                                    <CircularProgress size={12} color="inherit" />
                                                ) : (
                                                    s.status === 'Đang hoạt động' ? (
                                                        <Check sx={{ fontSize: 12, color: '#4caf50' }} />
                                                    ) : (
                                                        <Close sx={{ fontSize: 12, color: '#9e9e9e' }} />
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 3, textAlign: 'center', pl: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                                        {formatDate(s.createdAt)}
                                    </Box>
                                    <Box sx={{ flex: 3, textAlign: 'center' }}>
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={() => openView(s)}
                                            sx={{ 
                                                minWidth: '50px',
                                                fontSize: '0.75rem',
                                                textTransform: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            Xem
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            onClick={() => openUpdate(s)}
                                            sx={{ 
                                                minWidth: '50px',
                                                fontSize: '0.75rem',
                                                textTransform: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            Sửa
                                        </Button>
                                    </Stack>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Paper>
                </Box>
                {/* End list only */}

                <Dialog 
                    open={modalOpen} 
                    onClose={closeModal} 
                    fullWidth 
                    maxWidth="lg" 
                    PaperProps={{ 
                        sx: { 
                            borderRadius: 4,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            minHeight: '600px'
                        } 
                    }}
                >
                    <DialogTitle sx={{ pb: 2, px: 4, pt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            {modalMode === 'create' && 'Tạo nhà cung cấp mới'}
                            {modalMode === 'update' && `Cập nhật nhà cung cấp #${formData.id}`}
                            {modalMode === 'view' && `Thông tin nhà cung cấp #${formData.id}`}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {modalMode === 'view' 
                                ? 'Xem thông tin chi tiết của nhà cung cấp'
                                : 'Điền thông tin cơ bản của nhà cung cấp. Trường có dấu * là bắt buộc.'
                            }
                        </Typography>
                    </DialogTitle>
                    
                    <DialogContent sx={{ px: 4, py: 3, bgcolor: '#fafafa' }}>
                        {notice.text && (
                            <Alert 
                                severity={notice.type === 'error' ? 'error' : 'success'} 
                                sx={{ 
                                    mb: 3, 
                                    borderRadius: 2,
                                    '& .MuiAlert-message': { fontWeight: 500 }
                                }}
                            >
                                {notice.text}
                            </Alert>
                        )}
                        
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'white', border: '1px solid #e5e7eb' }}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', md: 'row' }, 
                                gap: 3,
                                alignItems: 'flex-start'
                            }}>
                                {/* Cột 1 - Thông tin cơ bản */}
                                <Box sx={{ 
                                    flex: { xs: '1', md: '0 0 42%' },
                                    width: '100%'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                        📋 Thông tin cơ bản
                                    </Typography>
                                    
                                    <Stack spacing={2.5}>
                                        <TextField 
                                            fullWidth 
                                            label="Tên nhà cung cấp" 
                                            placeholder="Ví dụ: Công ty TNHH Hoa Hồng Việt Nam" 
                                            value={formData.name} 
                                            onChange={(e) => onChange('name', e.target.value)} 
                                            error={!!errors.name} 
                                            helperText={errors.name || 'Nhập tên đầy đủ của nhà cung cấp'} 
                                            disabled={modalMode==='view'} 
                                            required 
                                            sx={{ 
                                                '& .MuiInputBase-root': { 
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea'
                                                }
                                            }} 
                                        />
                                        
                                        <TextField 
                                            fullWidth 
                                            label="Người liên hệ" 
                                            placeholder="Ví dụ: Nguyễn Văn A" 
                                            value={formData.contactPerson} 
                                            onChange={(e) => onChange('contactPerson', e.target.value)} 
                                            error={!!errors.contactPerson} 
                                            helperText={errors.contactPerson || 'Tên người đại diện liên hệ'} 
                                            disabled={modalMode==='view'} 
                                            sx={{ 
                                                '& .MuiInputBase-root': { 
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea'
                                                }
                                            }} 
                                        />
                                        
                                        <TextField 
                                            fullWidth 
                                            label="Số điện thoại" 
                                            placeholder="Ví dụ: 0931234567 hoặc +84 931 234 567" 
                                            value={formData.phone} 
                                            onChange={(e) => onChange('phone', e.target.value)} 
                                            error={!!errors.phone} 
                                            helperText={errors.phone || 'Số điện thoại liên hệ chính'} 
                                            disabled={modalMode==='view'} 
                                            required 
                                            sx={{ 
                                                '& .MuiInputBase-root': { 
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea'
                                                }
                                            }} 
                                        />
                                        
                                        <TextField 
                                            fullWidth 
                                            label="Email" 
                                            placeholder="Ví dụ: contact@hoahongvietnam.com" 
                                            value={formData.email} 
                                            onChange={(e) => onChange('email', e.target.value)} 
                                            error={!!errors.email} 
                                            helperText={errors.email || 'Email liên hệ'} 
                                            disabled={modalMode==='view'} 
                                            sx={{ 
                                                '& .MuiInputBase-root': { 
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea'
                                                }
                                            }} 
                                        />
                                    </Stack>
                                </Box>
                                
                                {/* Cột 2 - Thông tin địa chỉ và mô tả */}
                                <Box sx={{ 
                                    flex: { xs: '1', md: '0 0 58%' },
                                    width: '100%',
                                    pr: { xs: 0, md: 2 }
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                        📍 Thông tin địa chỉ
                                    </Typography>
                                    
                                    <Stack spacing={2.5}>
                                        <TextField 
                                            fullWidth 
                                            label="Địa chỉ" 
                                            placeholder="Ví dụ: 456 Đường Hoa Sen, Phường 5, Quận 3, TP.HCM" 
                                            value={formData.address} 
                                            onChange={(e) => onChange('address', e.target.value)} 
                                            error={!!errors.address} 
                                            helperText={errors.address || 'Địa chỉ đầy đủ của nhà cung cấp'} 
                                            disabled={modalMode==='view'} 
                                            sx={{ 
                                                '& .MuiInputBase-root': { 
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea'
                                                }
                                            }} 
                                        />
                                        
                                        <TextField 
                                            fullWidth 
                                            multiline 
                                            rows={4} 
                                            label="Mô tả" 
                                            placeholder="Ghi chú về nhà cung cấp, sản phẩm chính, quy mô hoạt động..." 
                                            value={formData.description} 
                                            onChange={(e) => onChange('description', e.target.value)} 
                                            error={!!errors.description} 
                                            helperText={errors.description || 'Mô tả chi tiết về nhà cung cấp (tối đa 500 ký tự)'} 
                                            disabled={modalMode==='view'} 
                                            sx={{ 
                                                '& .MuiInputBase-root': { 
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea'
                                                }
                                            }} 
                                        />
                                    </Stack>
                                </Box>
                            </Box>
                        </Paper>
                    </DialogContent>
                    
                    <DialogActions sx={{ px: 4, py: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
                        <Button 
                            onClick={closeModal}
                            variant="outlined"
                            sx={{ 
                                borderRadius: 2, 
                                px: 3,
                                textTransform: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    bgcolor: '#f1f5f9'
                                }
                            }}
                        >
                            Đóng
                        </Button>
                        {modalMode !== 'view' && (
                            <Button 
                                onClick={submit} 
                                variant="contained" 
                                disabled={saving}
                                sx={{ 
                                    borderRadius: 2, 
                                    px: 4,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                                    },
                                    '&:disabled': {
                                        background: '#cbd5e0'
                                    }
                                }}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Paper>
        </Box>
    );
}