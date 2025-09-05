import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    Divider,
    Stack,
    Tooltip,
    InputAdornment,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { receiveGoods, getSucculents, getAccessories } from '../../services/ProductService.jsx';

const ITEM_TYPE_OPTIONS = [
    { value: "SUCCULENT", label: "Sen đá" },
    { value: "ACCESSORY", label: "Phụ kiện" }
];

const ReceiveGoodsForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        supplierName: '',
        supplierPhone: '',
        note: '',
        items: [
            { itemType: 'SUCCULENT', succulentId: '', accessoryId: '', quantity: '', priceBuy: '' }
        ]
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [succulents, setSucculents] = useState([]);
    const [accessories, setAccessories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load succulents and accessories on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [succulentsData, accessoriesData] = await Promise.all([
                    getSucculents(),
                    getAccessories()
                ]);
                setSucculents(succulentsData);
                setAccessories(accessoriesData);
            } catch (error) {
                console.error('Error loading data:', error);
                setSubmitMessage({ 
                    type: 'error', 
                    text: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.' 
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Handle item changes
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        
        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));

        // Clear item errors
        const errorKey = `item_${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({
                ...prev,
                [errorKey]: ''
            }));
        }
    };

    // Add new item
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { itemType: 'SUCCULENT', succulentId: '', accessoryId: '', quantity: '', priceBuy: '' }
            ]
        }));
    };

    // Remove item
    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const updatedItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                items: updatedItems
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate supplier info
        if (!formData.supplierName.trim()) {
            newErrors.supplierName = 'Tên nhà cung cấp là bắt buộc';
        }
        if (!formData.supplierPhone.trim()) {
            newErrors.supplierPhone = 'Số điện thoại là bắt buộc';
        }

        // Validate items
        formData.items.forEach((item, index) => {
            if (!item.itemType) {
                newErrors[`item_${index}_itemType`] = 'Loại sản phẩm là bắt buộc';
            }
            if (item.itemType === 'SUCCULENT' && !item.succulentId) {
                newErrors[`item_${index}_succulentId`] = 'ID sen đá là bắt buộc';
            }
            if (item.itemType === 'ACCESSORY' && !item.accessoryId) {
                newErrors[`item_${index}_accessoryId`] = 'ID phụ kiện là bắt buộc';
            }
            if (!item.quantity || item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'Số lượng phải lớn hơn 0';
            }
            if (!item.priceBuy || item.priceBuy <= 0) {
                newErrors[`item_${index}_priceBuy`] = 'Giá mua phải lớn hơn 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setSubmitMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin' });
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            // Prepare data for API
            const apiData = {
                supplierName: formData.supplierName.trim(),
                supplierPhone: formData.supplierPhone.trim(),
                note: formData.note.trim(),
                items: formData.items.map(item => ({
                    itemType: item.itemType,
                    ...(item.itemType === 'SUCCULENT' 
                        ? { succulentId: parseInt(item.succulentId) }
                        : { accessoryId: parseInt(item.accessoryId) }
                    ),
                    quantity: parseInt(item.quantity),
                    priceBuy: parseInt(item.priceBuy)
                }))
            };

            const response = await receiveGoods(apiData);
            
            if (response) {
                setSubmitMessage({ 
                    type: 'success', 
                    text: response?.data?.message || 'Nhập hàng từ nhà cung cấp thành công!'
                });
            }
            
            // Reset form
            setFormData({
                supplierName: '',
                supplierPhone: '',
                note: '',
                items: [
                    { itemType: 'SUCCULENT', succulentId: '', accessoryId: '', quantity: '', priceBuy: '' }
                ]
            });
        } catch (error) {
            console.error('Error receiving goods:', error);
            setSubmitMessage({ 
                type: 'error', 
                text: 'Có lỗi xảy ra khi nhập hàng. Vui lòng thử lại.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldSx = {
        '& .MuiInputBase-root': {
            background: '#fff',
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
            '&:hover': {
                boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.1)'
            },
            '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.2)'
            }
        },
        mb: 2
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
            <Paper elevation={0} sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                borderRadius: 4,
                background: 'linear-gradient(120deg, #e0f7fa 0%, #f8f9e9 100%)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
            }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4
                }}>
                    <LocalShippingIcon sx={{
                        fontSize: {xs: 38, sm: 44},
                        color: 'success.main',
                        mr: 2,
                        filter: 'drop-shadow(0 4px 6px rgba(46, 125, 50, 0.2))'
                    }} />
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 900,
                                color: 'success.dark',
                                letterSpacing: 1,
                                fontSize: {xs: '1.7rem', sm: '2.2rem'}
                            }}
                        >
                            Nhập Hàng Từ Nhà Cung Cấp
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Cập nhật tồn kho và giá mua cho các sản phẩm
                        </Typography>
                    </Box>
                </Box>

                {/* Submit Message */}
                {submitMessage.text && (
                    <Alert
                        severity={submitMessage.type === 'success' ? 'success' : 'error'}
                        variant="filled"
                        sx={{
                            mb: 4,
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {submitMessage.text}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Stack spacing={4}>
                        {/* Supplier Information */}
                        <Box>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    width: 4,
                                    height: 24,
                                    borderRadius: 2,
                                    bgcolor: 'success.main',
                                    mr: 2
                                }
                            }}>
                                <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 700 }}>
                                    Thông Tin Nhà Cung Cấp
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Tên nhà cung cấp"
                                        value={formData.supplierName}
                                        onChange={(e) => handleInputChange('supplierName', e.target.value)}
                                        error={!!errors.supplierName}
                                        helperText={errors.supplierName}
                                        placeholder="NCC ABC"
                                        sx={fieldSx}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Số điện thoại"
                                        value={formData.supplierPhone}
                                        onChange={(e) => handleInputChange('supplierPhone', e.target.value)}
                                        error={!!errors.supplierPhone}
                                        helperText={errors.supplierPhone}
                                        placeholder="0900000000"
                                        sx={fieldSx}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Ghi chú"
                                        value={formData.note}
                                        onChange={(e) => handleInputChange('note', e.target.value)}
                                        placeholder="Ghi chú về lô hàng..."
                                        sx={fieldSx}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Items */}
                        <Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: {xs: 'column', sm: 'row'},
                                alignItems: {xs: 'flex-start', sm: 'center'},
                                justifyContent: 'space-between',
                                mb: 3,
                                gap: 2
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        width: 4,
                                        height: 24,
                                        borderRadius: 2,
                                        bgcolor: 'success.main',
                                        mr: 2
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 700 }}>
                                        Sản Phẩm Nhập Hàng
                                    </Typography>
                                </Box>
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addItem}
                                    variant="contained"
                                    size="medium"
                                    sx={{
                                        background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        px: 3,
                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                                        }
                                    }}
                                >
                                    Thêm Sản Phẩm
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={3}>
                                {loading ? (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        p: 4,
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        borderRadius: 4,
                                        border: '1px dashed',
                                        borderColor: 'success.light'
                                    }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Đang tải danh sách sản phẩm...
                                        </Typography>
                                    </Box>
                                ) : succulents.length === 0 && accessories.length === 0 ? (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        p: 6,
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        borderRadius: 4,
                                        border: '1px dashed',
                                        borderColor: 'success.light'
                                    }}>
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                            Chưa có sản phẩm nào để nhập hàng
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Vui lòng tạo sản phẩm sen đá trước
                                        </Typography>
                                    </Box>
                                ) : (
                                    formData.items.map((item, index) => (
                                    <Card
                                        key={index}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 3,
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)',
                                            background: 'linear-gradient(135deg, #e8f5e9 0%, #f5f8f1 100%)',
                                            transition: 'all 0.25s ease',
                                            '&:hover': {
                                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                            <Stack spacing={3}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 700 }}>
                                                        Sản phẩm #{index + 1}
                                                    </Typography>
                                                    {formData.items.length > 1 && (
                                                        <Tooltip title="Xóa sản phẩm này">
                                                            <IconButton
                                                                onClick={() => removeItem(index)}
                                                                color="error"
                                                                sx={{
                                                                    boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)',
                                                                    '&:hover': {
                                                                        background: 'rgba(211, 47, 47, 0.08)'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={3}>
                                                        <FormControl fullWidth error={!!errors[`item_${index}_itemType`]} required>
                                                            <InputLabel>Loại sản phẩm</InputLabel>
                                                            <Select
                                                                value={item.itemType}
                                                                onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                                                                label="Loại sản phẩm"
                                                            >
                                                                {ITEM_TYPE_OPTIONS.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} md={3}>
                                                        <FormControl 
                                                            fullWidth 
                                                            error={!!errors[`item_${index}_${item.itemType === 'SUCCULENT' ? 'succulentId' : 'accessoryId'}`]} 
                                                            required
                                                        >
                                                            <InputLabel>
                                                                {item.itemType === 'SUCCULENT' ? 'Chọn Sen đá' : 'Chọn Phụ kiện'}
                                                            </InputLabel>
                                                            <Select
                                                                value={item.itemType === 'SUCCULENT' ? item.succulentId : item.accessoryId}
                                                                onChange={(e) => handleItemChange(index, item.itemType === 'SUCCULENT' ? 'succulentId' : 'accessoryId', e.target.value)}
                                                                label={item.itemType === 'SUCCULENT' ? 'Chọn Sen đá' : 'Chọn Phụ kiện'}
                                                                disabled={loading}
                                                            >
                                                                {item.itemType === 'SUCCULENT' ? (
                                                                    succulents.map((succulent) => (
                                                                        <MenuItem key={succulent.id} value={succulent.id}>
                                                                            <Box>
                                                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                                    {succulent.speciesName}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    ID: {succulent.id} | Tồn kho: {succulent.quantity || 0}
                                                                                </Typography>
                                                                            </Box>
                                                                        </MenuItem>
                                                                    ))
                                                                ) : (
                                                                    accessories.map((accessory) => (
                                                                        <MenuItem key={accessory.id} value={accessory.id}>
                                                                            <Box>
                                                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                                    {accessory.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    ID: {accessory.id} | Tồn kho: {accessory.quantity || 0}
                                                                                </Typography>
                                                                            </Box>
                                                                        </MenuItem>
                                                                    ))
                                                                )}
                                                            </Select>
                                                            {errors[`item_${index}_${item.itemType === 'SUCCULENT' ? 'succulentId' : 'accessoryId'}`] && (
                                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                                                    {errors[`item_${index}_${item.itemType === 'SUCCULENT' ? 'succulentId' : 'accessoryId'}`]}
                                                                </Typography>
                                                            )}
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} md={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Số lượng"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            error={!!errors[`item_${index}_quantity`]}
                                                            helperText={errors[`item_${index}_quantity`]}
                                                            placeholder="20"
                                                            type="number"
                                                            inputProps={{ min: 1 }}
                                                            sx={fieldSx}
                                                            required
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} md={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Giá mua (VNĐ)"
                                                            value={item.priceBuy}
                                                            onChange={(e) => handleItemChange(index, 'priceBuy', e.target.value)}
                                                            error={!!errors[`item_${index}_priceBuy`]}
                                                            helperText={errors[`item_${index}_priceBuy`]}
                                                            placeholder="9000"
                                                            type="number"
                                                            inputProps={{ min: 1 }}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">₫</InputAdornment>
                                                            }}
                                                            sx={fieldSx}
                                                            required
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                    ))
                                )}
                            </Stack>
                        </Box>

                        {/* Submit Button */}
                        <Divider sx={{ my: 4 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<SaveIcon />}
                                disabled={isSubmitting}
                                sx={{
                                    minWidth: 200,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    py: 1.2,
                                    background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)',
                                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                    }
                                }}
                            >
                                {isSubmitting ? 'Đang nhập hàng...' : 'Nhập Hàng'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default ReceiveGoodsForm;
