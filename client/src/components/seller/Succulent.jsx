import React, { useMemo, useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
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
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    LocalFlorist as LocalFloristIcon
} from '@mui/icons-material';
import { createSucculent } from '../../services/ProductService.jsx';

// Constants for dropdowns - using enum values
const FENG_SHUI_OPTIONS = [
    { value: "KIM", label: "Kim (Metal)" },
    { value: "MOC", label: "Mộc (Wood)" },
    { value: "THUY", label: "Thủy (Water)" },
    { value: "HOA", label: "Hỏa (Fire)" },
    { value: "THO", label: "Thổ (Earth)" }
];

const ZODIAC_OPTIONS = [
    { value: "BACH_DUONG", label: "Bạch Dương (Aries)" },
    { value: "KIM_NGUU", label: "Kim Ngưu (Taurus)" },
    { value: "SONG_TU", label: "Song Tử (Gemini)" },
    { value: "CU_GIAI", label: "Cự Giải (Cancer)" },
    { value: "SU_TU", label: "Sư Tử (Leo)" },
    { value: "XU_NU", label: "Xử Nữ (Virgo)" },
    { value: "THIEN_BINH", label: "Thiên Bình (Libra)" },
    { value: "BO_CAP", label: "Bọ Cạp (Scorpio)" },
    { value: "NHAN_MA", label: "Nhân Mã (Sagittarius)" },
    { value: "MA_KET", label: "Ma Kết (Capricorn)" },
    { value: "BAO_BINH", label: "Bảo Bình (Aquarius)" },
    { value: "SONG_NGU", label: "Song Ngư (Pisces)" }
];

// Subcomponent for Size Detail Card
const SizeDetailCard = ({ size, index, errors, onChange, onRemove, canRemove }) => (
    <Card
        variant="outlined"
        sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)',
            mb: 3,
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f5f8f1 100%)',
            transition: 'all 0.25s ease',
            '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-3px)'
            }
        }}
    >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={3}>
                <TextField
                    fullWidth
                    label="Kích thước"
                    value={size.name}
                    onChange={(e) => onChange(index, 'name', e.target.value)}
                    error={!!errors[`size_${index}_name`]}
                    helperText={errors[`size_${index}_name`] || 'Ví dụ: 3cm, 7cm, 10cm'}
                    sx={{
                        '& .MuiInputBase-root': {
                            background: '#fff',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }
                    }}
                    required
                />

                <TextField
                    fullWidth
                    label="Giá mua (VNĐ)"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={size.priceBuy}
                    onChange={(e) => onChange(index, 'priceBuy', e.target.value)}
                    error={!!errors[`size_${index}_priceBuy`]}
                    helperText={errors[`size_${index}_priceBuy`] || 'Nhập giá mua > 0'}
                    placeholder="15000"
                    InputProps={{
                        startAdornment: <InputAdornment position="start">₫</InputAdornment>
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            background: '#fff',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }
                    }}
                    required
                />

                <TextField
                    fullWidth
                    label="Giá bán (VNĐ)"
                    value={size.priceBuy ? (Math.round(size.priceBuy * 1.1)).toLocaleString('vi-VN') : ''}
                    InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">₫</InputAdornment>
                    }}
                    helperText="Tự động tính (markup 10%)"
                    sx={{
                        '& .MuiInputBase-root': {
                            background: 'rgba(249, 251, 231, 0.6)',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }
                    }}
                />

                {canRemove && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Xóa kích thước này">
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => onRemove(index)}
                                startIcon={<DeleteIcon />}
                                aria-label="Xóa kích thước"
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)',
                                    '&:hover': {
                                        background: 'rgba(211, 47, 47, 0.08)'
                                    }
                                }}
                            >
                                Xóa kích thước
                            </Button>
                        </Tooltip>
                    </Box>
                )}
            </Stack>
        </CardContent>
    </Card>
);

const SucculentForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        species_name: '',
        description: '',
        fengShuiList: [],
        zodiacList: [],
        sizeDetailRequests: [
            { name: '', priceBuy: '' }
        ]
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [tabIndex, setTabIndex] = useState(0);
    const [maxStep, setMaxStep] = useState(0);

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

    const removeSelectedItem = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(v => v !== value)
        }));
    };

    // Handle size detail changes
    const handleSizeDetailChange = (index, field, value) => {
        const updatedSizes = [...formData.sizeDetailRequests];
        updatedSizes[index] = {
            ...updatedSizes[index],
            [field]: value
        };
        
        setFormData(prev => ({
            ...prev,
            sizeDetailRequests: updatedSizes
        }));

        // Clear size errors
        const errorKey = `size_${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({
                ...prev,
                [errorKey]: ''
            }));
        }
    };

    // Add new size detail
    const addSizeDetail = () => {
        setFormData(prev => ({
            ...prev,
            sizeDetailRequests: [
                ...prev.sizeDetailRequests,
                { name: '', priceBuy: '' }
            ]
        }));
    };

    // Remove size detail
    const removeSizeDetail = (index) => {
        if (formData.sizeDetailRequests.length > 1) {
            const updatedSizes = formData.sizeDetailRequests.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                sizeDetailRequests: updatedSizes
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate species name
        if (!formData.species_name.trim()) {
            newErrors.species_name = 'Tên loài sen đá là bắt buộc';
        }

        // Validate description
        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả sản phẩm là bắt buộc';
        }

        // Validate feng shui
        if (!formData.fengShuiList || formData.fengShuiList.length === 0) {
            newErrors.fengShuiList = 'Phong thủy là bắt buộc';
        }

        // Validate zodiac
        if (!formData.zodiacList || formData.zodiacList.length === 0) {
            newErrors.zodiacList = 'Cung hoàng đạo là bắt buộc';
        }

        // Validate size details
        formData.sizeDetailRequests.forEach((size, index) => {
            if (!size.name.trim()) {
                newErrors[`size_${index}_name`] = 'Tên kích thước là bắt buộc';
            }
            if (!size.priceBuy || size.priceBuy <= 0) {
                newErrors[`size_${index}_priceBuy`] = 'Giá mua phải lớn hơn 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate only step 0 (basic info)
    const validateBasicInfo = () => {
        const newErrors = {};
        if (!formData.species_name.trim()) {
            newErrors.species_name = 'Tên loài sen đá là bắt buộc';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả sản phẩm là bắt buộc';
        }
        if (!formData.fengShuiList || formData.fengShuiList.length === 0) {
            newErrors.fengShuiList = 'Phong thủy là bắt buộc';
        }
        if (!formData.zodiacList || formData.zodiacList.length === 0) {
            newErrors.zodiacList = 'Cung hoàng đạo là bắt buộc';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate only step 1 (sizes)
    const validateSizesOnly = () => {
        const newErrors = {};
        formData.sizeDetailRequests.forEach((size, index) => {
            if (!size.name.trim()) {
                newErrors[`size_${index}_name`] = 'Tên kích thước là bắt buộc';
            }
            if (!size.priceBuy || size.priceBuy <= 0) {
                newErrors[`size_${index}_priceBuy`] = 'Giá mua phải lớn hơn 0';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextFromInfo = () => {
        if (validateBasicInfo()) {
            setMaxStep(prev => Math.max(prev, 1));
            setTabIndex(1);
        } else {
            setSubmitMessage({ type: 'error', text: 'Vui lòng hoàn thành thông tin cơ bản' });
        }
    };

    const handleNextFromSizes = () => {
        if (validateSizesOnly()) {
            setMaxStep(prev => Math.max(prev, 2));
            setTabIndex(2);
        } else {
            setSubmitMessage({ type: 'error', text: 'Vui lòng kiểm tra các kích thước' });
        }
    };

    const handleStepTabChange = (_, next) => {
        // Allow navigating to unlocked steps only
        if (next <= maxStep) {
            setTabIndex(next);
        }
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
                speciesName: formData.species_name.trim(),
                description: formData.description.trim(),
                fengShuiList: formData.fengShuiList,
                zodiacList: formData.zodiacList,
                sizeDetailRequests: formData.sizeDetailRequests.map(size => ({
                    name: size.name.trim(),
                    priceBuy: parseInt(size.priceBuy)
                }))
            };

            const response = await createSucculent(apiData);
            
            if (response) {
                setSubmitMessage({ 
                    type: 'success', 
                    text: response.message || 'Tạo sản phẩm sen đá thành công!' 
                });
                
                // Reset form
                setFormData({
                    species_name: '',
                    description: '',
                    fengShuiList: [],
                    zodiacList: [],
                    sizeDetailRequests: [{ name: '', priceBuy: '' }]
                });
                setTabIndex(0);
            }
        } catch (error) {
            console.error('Error creating succulent:', error);
            setSubmitMessage({ 
                type: 'error', 
                text: 'Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate sell price (10% markup)
    const calculateSellPrice = (buyPrice) => {
        return Math.round(buyPrice * 1.1);
    };

    // Live preview data memoized
    const preview = useMemo(() => ({
        title: formData.species_name || 'Tên loài sen đá',
        description: formData.description || 'Mô tả sản phẩm sẽ hiển thị tại đây.',
        fengShui: formData.fengShuiList.length > 0 ? formData.fengShuiList.join(', ') : '—',
        zodiac: formData.zodiacList.length > 0 ? formData.zodiacList.join(', ') : '—',
        sizes: formData.sizeDetailRequests.map(s => ({
            name: s.name || '—',
            priceBuy: s.priceBuy || 0,
            priceSell: s.priceBuy ? calculateSellPrice(Number(s.priceBuy)) : 0
        }))
    }), [formData]);

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
        <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
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
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: {xs: 'flex-start', sm: 'center'},
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalFloristIcon sx={{
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
                                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    color: 'success.dark',
                                    letterSpacing: 1,
                                    fontSize: {xs: '1.7rem', sm: '2.2rem'}
                                }}
                            >
                                Tạo Sản Phẩm Sen Đá
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Nhập thông tin chi tiết để thêm sản phẩm mới vào shop của bạn
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    mt: 1.5
                                }}
                            >
                                <Chip
                                    size="small"
                                    color="success"
                                    variant="filled"
                                    label="Catalog mới"
                                    sx={{
                                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
                                        fontWeight: 600
                                    }}
                                />
                                <Chip
                                    size="small"
                                    color="default"
                                    variant="outlined"
                                    label="Tồn kho mặc định: 0"
                                    sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label="Markup 10%"
                                    sx={{ fontWeight: 500 }}
                                />
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* Progress Tabs */}
                <Box sx={{ position: 'relative', mb: 4 }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleStepTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                minHeight: 48,
                                color: 'text.primary',
                                opacity: 0.7,
                                '&.Mui-selected': {
                                    color: 'success.dark',
                                    opacity: 1
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 4,
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)'
                            }
                        }}
                    >
                        <Tab
                            disabled={false}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: tabIndex >= 0 ? 'success.light' : 'action.disabled',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 1,
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}>
                                        1
                                    </Box>
                                    Thông tin
                                </Box>
                            }
                            disableRipple
                        />
                        <Tab
                            disabled={maxStep < 1}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: tabIndex >= 1 ? 'success.light' : 'action.disabled',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 1,
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}>
                                        2
                                    </Box>
                                    Kích thước
                                </Box>
                            }
                            disableRipple
                        />
                        <Tab
                            disabled={maxStep < 2}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: tabIndex >= 2 ? 'success.light' : 'action.disabled',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 1,
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}>
                                        3
                                    </Box>
                                    Xem trước
                                </Box>
                            }
                            disableRipple
                        />
                    </Tabs>
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
                    <Box sx={{ p: 1 }}>
                        {/* Basic Information */}
                        {tabIndex === 0 && (
                        <>
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
                                    Thông Tin Cơ Bản
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 4 }} />

                            <Stack spacing={3} sx={{ mb: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Tên loài sen đá"
                                    value={formData.species_name}
                                    onChange={(e) => handleInputChange('species_name', e.target.value)}
                                    error={!!errors.species_name}
                                    helperText={errors.species_name || 'Ví dụ: Sen đá Echeveria'}
                                    placeholder="Sen đá Echeveria"
                                    autoFocus
                                    sx={fieldSx}
                                    required
                                />

                                <FormControl fullWidth error={!!errors.fengShuiList} required sx={fieldSx}>
                                    <InputLabel>Phong Thủy</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.fengShuiList}
                                        onChange={(e) => handleInputChange('fengShuiList', e.target.value)}
                                        label="Phong Thủy"
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((val) => {
                                                    const label = FENG_SHUI_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                    return (
                                                        <Chip
                                                            key={val}
                                                            label={label}
                                                            onDelete={() => removeSelectedItem('fengShuiList', val)}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            size="small"
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {FENG_SHUI_OPTIONS.map((option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                                disabled={formData.fengShuiList.includes(option.value)}
                                                sx={{ opacity: formData.fengShuiList.includes(option.value) ? 0.5 : 1 }}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.fengShuiList && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                            {errors.fengShuiList}
                                        </Typography>
                                    )}
                                </FormControl>

                                <FormControl fullWidth error={!!errors.zodiacList} required sx={fieldSx}>
                                    <InputLabel>Cung Hoàng Đạo</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.zodiacList}
                                        onChange={(e) => handleInputChange('zodiacList', e.target.value)}
                                        label="Cung Hoàng Đạo"
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((val) => {
                                                    const label = ZODIAC_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                    return (
                                                        <Chip
                                                            key={val}
                                                            label={label}
                                                            onDelete={() => removeSelectedItem('zodiacList', val)}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            size="small"
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {ZODIAC_OPTIONS.map((option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                                disabled={formData.zodiacList.includes(option.value)}
                                                sx={{ opacity: formData.zodiacList.includes(option.value) ? 0.5 : 1 }}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.zodiacList && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                            {errors.zodiacList}
                                        </Typography>
                                    )}
                                </FormControl>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Mô tả sản phẩm"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    error={!!errors.description}
                                    helperText={errors.description || 'Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc...'}
                                    placeholder="Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc..."
                                    sx={fieldSx}
                                    required
                                />
                            </Stack>
                        </>
                        )}

                        {/* Size Details */}
                        {tabIndex === 1 && (
                        <>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: {xs: 'column', sm: 'row'},
                                alignItems: {xs: 'flex-start', sm: 'center'},
                                justifyContent: 'space-between',
                                mb: 2,
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
                                        Chi Tiết Kích Thước
                                    </Typography>
                                </Box>
                                <Tooltip title="Thêm một kích thước mới cho sản phẩm">
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={addSizeDetail}
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
                                        Thêm Kích Thước
                                    </Button>
                                </Tooltip>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={3}>
                                {formData.sizeDetailRequests.length > 0 ? (
                                    formData.sizeDetailRequests.map((size, index) => (
                                        <SizeDetailCard
                                            key={index}
                                            size={size}
                                            index={index}
                                            errors={errors}
                                            onChange={handleSizeDetailChange}
                                            onRemove={removeSizeDetail}
                                            canRemove={formData.sizeDetailRequests.length > 1}
                                        />
                                    ))
                                ) : (
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
                                            Chưa có kích thước nào được thêm vào
                                        </Typography>
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={addSizeDetail}
                                            variant="contained"
                                            size="medium"
                                            sx={{
                                                mt: 2,
                                                background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)',
                                                color: '#fff',
                                                fontWeight: 700,
                                                borderRadius: 2,
                                            }}
                                        >
                                            Thêm Kích Thước Đầu Tiên
                                        </Button>
                                    </Box>
                                )}
                            </Stack>
                        </>
                        )}

                        {/* Preview Section */}
                        {tabIndex === 2 && (
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 4,
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                background: 'linear-gradient(120deg, #f1f8e9 0%, #e0f7fa 100%)',
                                position: 'relative'
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    p: 1.5,
                                    bgcolor: 'rgba(76, 175, 80, 0.08)',
                                    borderBottomLeftRadius: 16,
                                    backdropFilter: 'blur(8px)'
                                }}
                            >
                                <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label="Xem trước"
                                />
                            </Box>

                            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <LocalFloristIcon
                                            sx={{
                                                fontSize: 50,
                                                color: 'success.main',
                                                mr: 2,
                                                filter: 'drop-shadow(0 4px 6px rgba(46, 125, 50, 0.2))'
                                            }}
                                        />
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.dark' }}>
                                            {preview.title}
                                        </Typography>
                                    </Box>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ flexWrap: 'wrap', gap: 1 }}
                                    >
                                        <Chip
                                            size="small"
                                            color="success"
                                            icon={<Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: '50%', mr: -0.5 }} />}
                                            label={`Phong thủy: ${preview.fengShui}`}
                                            sx={{ px: 0.5, boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)' }}
                                        />
                                        <Chip
                                            size="small"
                                            color="info"
                                            icon={<Box sx={{ width: 16, height: 16, bgcolor: 'info.main', borderRadius: '50%', mr: -0.5 }} />}
                                            label={`Cung: ${preview.zodiac}`}
                                            sx={{ px: 0.5 }}
                                        />
                                    </Stack>

                                    <Box sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        border: '1px solid rgba(76, 175, 80, 0.1)',
                                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)'
                                    }}>
                                        <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                                            {preview.description}
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    <Box>
                                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'success.dark',
                                                mr: 1.5
                                            }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                Kích thước & giá dự kiến
                                            </Typography>
                                        </Box>

                                        <Stack spacing={2}>
                                            {preview.sizes.map((s, i) => (
                                                <Box key={i} sx={{
                                                    p: 2.5,
                                                    borderRadius: 3,
                                                    border: '1px solid',
                                                    borderColor: 'success.light',
                                                    background: 'linear-gradient(145deg, #ffffff, #fafffe)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)'
                                                    }
                                                }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.dark', mb: 1 }}>
                                                        {s.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Giá mua: {s.priceBuy.toLocaleString('vi-VN')} ₫
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                            {s.priceSell.toLocaleString('vi-VN')} ₫
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                        )}

                        {/* Step Actions */}
                        <Divider sx={{ my: 4 }} />
                        {tabIndex === 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    size="large"
                                    onClick={handleNextFromInfo}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        py: 1.2,
                                        background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)'
                                    }}
                                >
                                    Tiếp tục
                                </Button>
                            </Box>
                        )}
                        {tabIndex === 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    size="large"
                                    onClick={() => setTabIndex(0)}
                                    sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    type="button"
                                    variant="contained"
                                    size="large"
                                    onClick={handleNextFromSizes}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        py: 1.2,
                                        background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)'
                                    }}
                                >
                                    Tiếp tục
                                </Button>
                            </Box>
                        )}
                        {tabIndex === 2 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    size="large"
                                    onClick={() => setTabIndex(1)}
                                    sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
                                >
                                    Quay lại
                                </Button>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        size="large"
                                        disabled={isSubmitting}
                                        onClick={() => setSubmitMessage({ type: 'success', text: 'Đã lưu nháp cục bộ (chưa gọi API).' })}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.2,
                                            fontWeight: 700
                                        }}
                                    >
                                        Lưu nháp
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={<SaveIcon />}
                                        disabled={isSubmitting}
                                        sx={{
                                            minWidth: { xs: '100%', sm: 220 },
                                            borderRadius: 2,
                                            fontWeight: 700,
                                            py: 1.2,
                                            background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)'
                                        }}
                                    >
                                        {isSubmitting ? 'Đang tạo...' : 'Tạo Sản Phẩm'}
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default SucculentForm;
