import React, { useMemo, useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button, Grid, Card, CardContent,
    IconButton, FormControl, InputLabel, Select, MenuItem, Chip, Alert, Divider,
    Stack, Tooltip, InputAdornment, Tabs, Tab, CircularProgress, Dialog,
    DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
    LocalFlorist as LocalFloristIcon, Edit as EditIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { createSucculent, getSucculents } from '../../services/ProductService.jsx';

// Constants for dropdowns
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

const SIZE_OPTIONS = [
    { value: "TINY", label: "3cm" },
    { value: "SMALL", label: "7cm" },
    { value: "MEDIUM", label: "10cm" },
    { value: "LARGE", label: "13cm" },
    { value: "EXTRA_LARGE", label: "16-18cm" }
];

const SucculentForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        species_name: '',
        description: '',
        fengShuiList: [],
        zodiacList: [],
        selectedSizes: [],
        sizeDetailRequests: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [tabIndex, setTabIndex] = useState(0);
    const [maxStep, setMaxStep] = useState(0);
    const [succulentList, setSucculentList] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedSucculent, setSelectedSucculent] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isValidating, setIsValidating] = useState(false);

    // Load succulent list
    const loadSucculentList = async () => {
        setIsLoadingList(true);
        try {
            const response = await getSucculents();
            if (response && response.data && Array.isArray(response.data.data)) {
                setSucculentList(response.data.data);
            } else {
                setSucculentList([]);
                console.warn('API response data is not an array:', response);
            }
        } catch (error) {
            console.error('Error loading succulent list:', error);
            setSucculentList([]);
            setSubmitMessage({
                type: 'error',
                text: 'Có lỗi xảy ra khi tải danh sách sản phẩm'
            });
        } finally {
            setIsLoadingList(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadSucculentList();
    }, []);

    // Handle dialog actions
    const handleOpenCreateDialog = () => {
        setShowCreateDialog(true);
        setTabIndex(0);
        setMaxStep(0);
        setErrors({});
        setSubmitMessage({ type: '', text: '' });
    };

    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
        setFormData({
            species_name: '',
            description: '',
            fengShuiList: [],
            zodiacList: [],
            selectedSizes: [],
            sizeDetailRequests: []
        });
        setErrors({});
        setSubmitMessage({ type: '', text: '' });
        setCurrentStep(1);
        setIsValidating(false);
    };

    // Step validation functions
    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.species_name.trim()) {
            newErrors.species_name = 'Tên loài sen đá là bắt buộc';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả sản phẩm là bắt buộc';
        }
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (formData.fengShuiList.length === 0) {
            newErrors.fengShuiList = 'Phong thủy là bắt buộc';
        }
        if (formData.zodiacList.length === 0) {
            newErrors.zodiacList = 'Cung hoàng đạo là bắt buộc';
        }
        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (formData.selectedSizes.length === 0) {
            newErrors.selectedSizes = 'Vui lòng chọn ít nhất một kích thước';
        }
        return newErrors;
    };

    const validateStep4 = () => {
        const newErrors = {};
        formData.sizeDetailRequests.forEach((size, index) => {
            if (!size.priceSell || size.priceSell <= 0) {
                newErrors[`size_${index}_priceSell`] = 'Giá bán phải lớn hơn 0';
            }
        });
        return newErrors;
    };

    const handleNextStep = () => {
        setIsValidating(true);
        let stepErrors = {};

        switch (currentStep) {
            case 1:
                stepErrors = validateStep1();
                break;
            case 2:
                stepErrors = validateStep2();
                break;
            case 3:
                stepErrors = validateStep3();
                break;
            case 4:
                stepErrors = validateStep4();
                break;
            default:
                break;
        }

        setErrors(stepErrors);

        if (Object.keys(stepErrors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }

        setTimeout(() => setIsValidating(false), 500);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    const handleSubmitForm = async () => {
        setIsValidating(true);
        const allErrors = {
            ...validateStep1(),
            ...validateStep2(),
            ...validateStep3(),
            ...validateStep4()
        };

        setErrors(allErrors);

        if (Object.keys(allErrors).length === 0) {
            setIsSubmitting(true);
            const apiData = {
                speciesName: formData.species_name.trim(),
                description: formData.description.trim(),
                fengShuiList: formData.fengShuiList,
                zodiacList: formData.zodiacList,
                sizeDetailRequests: formData.sizeDetailRequests.map(size => ({
                    name: size.name,
                    priceSell: parseInt(size.priceSell)
                }))
            };

            try {
                const response = await createSucculent(apiData);
                if (response && response.data) {
                    setSubmitMessage({ text: 'Tạo sản phẩm thành công!', type: 'success' });
                    setTimeout(() => {
                        handleCloseCreateDialog();
                        loadSucculentList();
                    }, 1500);
                } else {
                    setSubmitMessage({ text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error' });
                }
            } catch (error) {
                console.error('Error creating succulent:', error);
                setSubmitMessage({ text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error' });
            } finally {
                setIsSubmitting(false);
            }
        }

        setTimeout(() => setIsValidating(false), 500);
    };

    const handleViewDetail = (succulent) => {
        setSelectedSucculent(succulent);
        setShowDetailDialog(true);
    };

    const handleUpdate = (succulent) => {
        setSelectedSucculent(succulent);
        setShowUpdateDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setShowDetailDialog(false);
        setSelectedSucculent(null);
    };

    const handleCloseUpdateDialog = () => {
        setShowUpdateDialog(false);
        setSelectedSucculent(null);
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
            <Paper elevation={0} sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                borderRadius: 4,
                background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
            }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalFloristIcon sx={{
                            fontSize: { xs: 38, sm: 44 },
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
                                    fontSize: { xs: '1.7rem', sm: '2.2rem' }
                                }}
                            >
                                Quản Lý Sản Phẩm Sen Đá
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Quản lý danh sách sản phẩm sen đá của bạn
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            py: 1.2,
                            px: 3,
                            background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(90deg, #388e3c 0%, #2e7d32 100%)',
                                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                            }
                        }}
                    >
                        Tạo Sản Phẩm
                    </Button>
                </Box>

                {/* Error Message */}
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

                {/* Succulent List Table */}
                {isLoadingList ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress color="success" size={60} />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                        border: '1px solid rgba(76, 175, 80, 0.1)'
                    }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{
                                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                                    '& .MuiTableCell-head': {
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        borderBottom: 'none'
                                    }
                                }}>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tên Sản Phẩm</TableCell>
                                    <TableCell>Kích Thước</TableCell>
                                    <TableCell>Mô Tả</TableCell>
                                    <TableCell>Giá Bán</TableCell>
                                    <TableCell>Số Lượng</TableCell>
                                    <TableCell>Trạng Thái</TableCell>
                                    <TableCell align="center">Thao Tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(succulentList) && succulentList.map((succulent) => (
                                    <TableRow
                                        key={succulent.id}
                                        sx={{
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: 'rgba(76, 175, 80, 0.02)'
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(76, 175, 80, 0.05)'
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>
                                            #{succulent.id}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'success.dark' }}>
                                            {succulent.speciesName}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={succulent.size}
                                                color="info"
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ 
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {succulent.description}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'success.dark' }}>
                                            {succulent.priceSell?.toLocaleString('vi-VN')} ₫
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            {succulent.quantity}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={succulent.status}
                                                color={succulent.quantity > 0 ? 'success' : 'error'}
                                                variant="filled"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleViewDetail(succulent)}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Cập nhật">
                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => handleUpdate(succulent)}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(156, 39, 176, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {Array.isArray(succulentList) && succulentList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Không có sản phẩm nào
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Detail Dialog */}
            <Dialog
                open={showDetailDialog}
                onClose={handleCloseDetailDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(76, 175, 80, 0.1)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    py: 3,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                        <LocalFloristIcon sx={{ fontSize: '2rem' }} />
                        Chi Tiết Sản Phẩm
                    </Box>
                    
                    {/* Close Button */}
                    <Button
                        onClick={handleCloseDetailDialog}
                        variant="outlined"
                        size="small"
                        sx={{ 
                            borderRadius: 2, 
                            fontWeight: 600,
                            px: 2,
                            py: 0.5,
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            fontSize: '0.8rem',
                            minWidth: 'auto',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ fontSize: '0.9rem' }}>✕</Box>
                            Đóng
                        </Box>
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ 
                    p: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    minHeight: '400px'
                }}>
                    {selectedSucculent && (
                        <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
                            {/* Product Image Placeholder - Left Side */}
                            <Box sx={{ 
                                flex: '0 0 200px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Box sx={{ 
                                    width: '100%',
                                    height: '200px',
                                    textAlign: 'center', 
                                    p: 3,
                                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                                    borderRadius: 3,
                                    border: '2px dashed rgba(76, 175, 80, 0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <LocalFloristIcon sx={{ 
                                        fontSize: '4rem', 
                                        color: 'success.main',
                                        opacity: 0.7,
                                        mb: 1
                                    }} />
                                    <Typography variant="h6" sx={{ 
                                        color: 'success.dark', 
                                        fontWeight: 600,
                                        opacity: 0.8
                                    }}>
                                        {selectedSucculent.speciesName}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Product Information - Right Side */}
                            <Box sx={{ flex: 1 }}>
                                <Paper elevation={2} sx={{ 
                                    p: 3, 
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                    border: '1px solid rgba(76, 175, 80, 0.1)',
                                    height: '100%',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
                                        {/* Description Section */}
                                        <Box>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 700, 
                                                color: 'success.dark', 
                                                mb: 1.5,
                                                pb: 0.5,
                                                borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                Mô tả
                                            </Typography>
                                            
                                            <Box sx={{ 
                                                p: 2, 
                                                background: 'rgba(255, 193, 7, 0.05)', 
                                                borderRadius: 2,
                                                border: '1px solid rgba(255, 193, 7, 0.1)',
                                                minHeight: '60px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <Typography variant="body1" sx={{ 
                                                    color: 'text.primary',
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.4,
                                                    fontSize: '0.95rem',
                                                    wordBreak: 'break-word',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {selectedSucculent.description}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Pricing & Status Section */}
                                        <Box>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 700, 
                                                color: 'success.dark', 
                                                mb: 1.5,
                                                pb: 0.5,
                                                borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                Giá Cả & Trạng Thái
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                {/* Price and Quantity Row */}
                                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                    <Box sx={{ 
                                                        flex: 1,
                                                        p: 1.5, 
                                                        background: 'rgba(76, 175, 80, 0.1)', 
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(76, 175, 80, 0.2)',
                                                        textAlign: 'center',
                                                        minHeight: '50px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle2" sx={{ 
                                                            fontWeight: 600, 
                                                            mb: 0.5, 
                                                            color: 'text.secondary',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            Giá bán:
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ 
                                                            color: 'success.main', 
                                                            fontWeight: 800,
                                                            fontSize: '1.1rem',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {selectedSucculent.priceSell?.toLocaleString('vi-VN')} ₫
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Box sx={{ 
                                                        flex: 1,
                                                        p: 1.5, 
                                                        background: 'rgba(156, 39, 176, 0.1)', 
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(156, 39, 176, 0.2)',
                                                        textAlign: 'center',
                                                        minHeight: '50px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle2" sx={{ 
                                                            fontWeight: 600, 
                                                            mb: 0.5, 
                                                            color: 'text.secondary',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            Số lượng:
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ 
                                                            fontWeight: 800,
                                                            color: 'purple.main',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            {selectedSucculent.quantity}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                {/* Status Row */}
                                                <Box sx={{ 
                                                    p: 1.5, 
                                                    background: selectedSucculent.quantity > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
                                                    borderRadius: 2,
                                                    border: selectedSucculent.quantity > 0 ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(244, 67, 54, 0.2)',
                                                    textAlign: 'center',
                                                    minHeight: '50px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{ 
                                                        fontWeight: 600, 
                                                        mb: 0.5, 
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        Trạng thái:
                                                    </Typography>
                                                    <Chip
                                                        label={selectedSucculent.status}
                                                        color={selectedSucculent.quantity > 0 ? 'success' : 'error'}
                                                        variant="filled"
                                                        size="small"
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            fontSize: '0.8rem',
                                                            px: 1.5,
                                                            py: 0.25,
                                                            maxWidth: 'fit-content',
                                                            mx: 'auto'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Attributes Section */}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 700, 
                                                color: 'success.dark', 
                                                mb: 1.5,
                                                pb: 0.5,
                                                borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                Thuộc Tính Đặc Biệt
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                <Box sx={{ 
                                                    p: 1.5, 
                                                    background: 'rgba(76, 175, 80, 0.05)', 
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(76, 175, 80, 0.1)',
                                                    minHeight: '60px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{ 
                                                        fontWeight: 600, 
                                                        mb: 1, 
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        Phong thủy:
                                                    </Typography>
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap', 
                                                        gap: 0.5,
                                                        justifyContent: 'flex-start'
                                                    }}>
                                                        {selectedSucculent.fengShuiElements?.map((element, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={FENG_SHUI_OPTIONS.find(opt => opt.value === element)?.label || element}
                                                                color="success"
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                    px: 1,
                                                                    py: 0.25,
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                                
                                                <Box sx={{ 
                                                    p: 1.5, 
                                                    background: 'rgba(33, 150, 243, 0.05)', 
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(33, 150, 243, 0.1)',
                                                    minHeight: '60px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{ 
                                                        fontWeight: 600, 
                                                        mb: 1, 
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        Cung hoàng đạo:
                                                    </Typography>
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap', 
                                                        gap: 0.5,
                                                        justifyContent: 'flex-start'
                                                    }}>
                                                        {selectedSucculent.zodiacs?.map((zodiac, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={ZODIAC_OPTIONS.find(opt => opt.value === zodiac)?.label || zodiac}
                                                                color="info"
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                    px: 1,
                                                                    py: 0.25,
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog
                open={showCreateDialog}
                onClose={handleCloseCreateDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    pb: 2
                }}>
                    Tạo Sản Phẩm Sen Đá Mới

                    {/* Progress Indicator */}
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {[1, 2, 3, 4].map((step) => (
                                <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            backgroundColor: step <= currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                                            color: step <= currentStep ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                                            transition: 'all 0.3s ease',
                                            boxShadow: step <= currentStep ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none'
                                        }}
                                    >
                                        {step}
                                    </Box>
                                    {step < 4 && (
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 2,
                                                backgroundColor: step < currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                                                ml: 1,
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>
                        <Typography variant="caption" sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 1,
                            opacity: 0.9,
                            fontSize: '0.8rem'
                        }}>
                            Bước {currentStep}/4: {
                                currentStep === 1 ? 'Thông tin cơ bản' :
                                    currentStep === 2 ? 'Phong thủy & Cung hoàng đạo' :
                                        currentStep === 3 ? 'Kích thước sản phẩm' :
                                            'Chi tiết giá bán'
                            }
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Tên loài sen đá"
                                        value={formData.species_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, species_name: e.target.value }))}
                                        error={!!errors.species_name}
                                        helperText={errors.species_name}
                                        placeholder="Sen đá Echeveria"
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Mô tả sản phẩm"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        error={!!errors.description}
                                        helperText={errors.description || 'Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc...'}
                                        placeholder="Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc..."
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Step 2: Feng Shui & Zodiac */}
                        {currentStep === 2 && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={!!errors.fengShuiList} required sx={{ mb: 2 }}>
                                        <InputLabel>Phong Thủy</InputLabel>
                                        <Select
                                            multiple
                                            value={formData.fengShuiList}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fengShuiList: e.target.value }))}
                                            label="Phong Thủy"
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((val) => {
                                                        const label = FENG_SHUI_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                        return (
                                                            <Chip key={val} label={label} size="small" />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {FENG_SHUI_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={!!errors.zodiacList} required sx={{ mb: 2 }}>
                                        <InputLabel>Cung Hoàng Đạo</InputLabel>
                                        <Select
                                            multiple
                                            value={formData.zodiacList}
                                            onChange={(e) => setFormData(prev => ({ ...prev, zodiacList: e.target.value }))}
                                            label="Cung Hoàng Đạo"
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((val) => {
                                                        const label = ZODIAC_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                        return (
                                                            <Chip key={val} label={label} size="small" />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {ZODIAC_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        {/* Step 3: Size Selection */}
                        {currentStep === 3 && (
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.selectedSizes} required sx={{ mb: 2 }}>
                                    <InputLabel>Kích thước sản phẩm</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.selectedSizes}
                                        onChange={(e) => {
                                            const selectedSizes = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                selectedSizes,
                                                sizeDetailRequests: selectedSizes.map(size => ({
                                                    name: SIZE_OPTIONS.find(opt => opt.value === size)?.label || size,
                                                    priceSell: ''
                                                }))
                                            }));
                                        }}
                                        label="Kích thước sản phẩm"
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((val) => {
                                                    const label = SIZE_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                    return (
                                                        <Chip key={val} label={label} size="small" />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {SIZE_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {/* Step 4: Price Details */}
                        {currentStep === 4 && formData.sizeDetailRequests.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'success.dark' }}>
                                    Chi Tiết Giá Bán
                                </Typography>
                                <Grid container spacing={2}>
                                    {formData.sizeDetailRequests.map((size, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                    {size.name}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    label="Giá bán (VNĐ)"
                                                    type="number"
                                                    inputProps={{ min: 1 }}
                                                    value={size.priceSell}
                                                    onChange={(e) => {
                                                        const updatedSizes = [...formData.sizeDetailRequests];
                                                        updatedSizes[index] = { ...updatedSizes[index], priceSell: e.target.value };
                                                        setFormData(prev => ({ ...prev, sizeDetailRequests: updatedSizes }));
                                                    }}
                                                    error={!!errors[`size_${index}_priceSell`]}
                                                    helperText={errors[`size_${index}_priceSell`] || 'Nhập giá bán'}
                                                    placeholder="16500"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">₫</InputAdornment>
                                                    }}
                                                    required
                                                />
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}
                    </Grid>

                    {/* Submit Message in Dialog */}
                    {submitMessage.text && (
                        <Alert
                            severity={submitMessage.type === 'success' ? 'success' : 'error'}
                            variant="filled"
                            sx={{
                                mt: 3,
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                        >
                            {submitMessage.text}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 3,
                    gap: 2,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    justifyContent: 'space-between'
                }}>
                    {/* Left side - Cancel button */}
                    <Button
                        onClick={handleCloseCreateDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderColor: '#6c757d',
                            color: '#6c757d',
                            '&:hover': {
                                borderColor: '#5a6268',
                                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: '1.1rem' }}>✕</Box>
                            Hủy
                        </Box>
                    </Button>

                    {/* Right side - Step navigation buttons */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {/* Previous button */}
                        {currentStep > 1 && (
                            <Button
                                onClick={handlePrevStep}
                                variant="outlined"
                                disabled={isValidating}
                                sx={{
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    borderColor: '#4caf50',
                                    color: '#4caf50',
                                    '&:hover': {
                                        borderColor: '#45a049',
                                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ fontSize: '1.1rem' }}>←</Box>
                                    Trước
                                </Box>
                            </Button>
                        )}

                        {/* Next/Submit button */}
                        {currentStep < 4 ? (
                            <Button
                                onClick={handleNextStep}
                                variant="contained"
                                disabled={isValidating}
                                sx={{
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1,
                                    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #45a049 30%, #5cb85c 90%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.6)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(76, 175, 80, 0.3)',
                                        transform: 'none',
                                        boxShadow: 'none'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isValidating ? (
                                        <Box sx={{
                                            width: 16,
                                            height: 16,
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': { transform: 'rotate(0deg)' },
                                                '100%': { transform: 'rotate(360deg)' }
                                            }
                                        }} />
                                    ) : (
                                        <>
                                            Tiếp theo
                                            <Box sx={{ fontSize: '1.1rem' }}>→</Box>
                                        </>
                                    )}
                                </Box>
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmitForm}
                                variant="contained"
                                disabled={isSubmitting || isValidating}
                                sx={{
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1,
                                    background: 'linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)',
                                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #e55a2b 30%, #e6851a 90%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.6)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(255, 107, 53, 0.3)',
                                        transform: 'none',
                                        boxShadow: 'none'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isSubmitting ? (
                                        <Box sx={{
                                            width: 16,
                                            height: 16,
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': { transform: 'rotate(0deg)' },
                                                '100%': { transform: 'rotate(360deg)' }
                                            }
                                        }} />
                                    ) : (
                                        <>
                                            <Box sx={{ fontSize: '1.1rem' }}>✓</Box>
                                            Tạo Sản Phẩm
                                        </>
                                    )}
                                </Box>
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Update Dialog */}
            <Dialog
                open={showUpdateDialog}
                onClose={handleCloseUpdateDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem'
                }}>
                    Cập Nhật Sản Phẩm
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Tính năng cập nhật sản phẩm sẽ được phát triển trong phiên bản tiếp theo.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseUpdateDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SucculentForm;
