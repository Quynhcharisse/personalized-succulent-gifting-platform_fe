import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    LocalFlorist as LocalFloristIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {createSucculent, getSucculents} from '../../services/ProductService.jsx';

// Constants for dropdowns
const FENG_SHUI_OPTIONS = [
    {value: "KIM", label: "Kim (Metal)"},
    {value: "MOC", label: "Mộc (Wood)"},
    {value: "THUY", label: "Thủy (Water)"},
    {value: "HOA", label: "Hỏa (Fire)"},
    {value: "THO", label: "Thổ (Earth)"}
];

const ZODIAC_OPTIONS = [
    {value: "BACH_DUONG", label: "Bạch Dương (Aries)"},
    {value: "KIM_NGUU", label: "Kim Ngưu (Taurus)"},
    {value: "SONG_TU", label: "Song Tử (Gemini)"},
    {value: "CU_GIAI", label: "Cự Giải (Cancer)"},
    {value: "SU_TU", label: "Sư Tử (Leo)"},
    {value: "XU_NU", label: "Xử Nữ (Virgo)"},
    {value: "THIEN_BINH", label: "Thiên Bình (Libra)"},
    {value: "BO_CAP", label: "Bọ Cạp (Scorpio)"},
    {value: "NHAN_MA", label: "Nhân Mã (Sagittarius)"},
    {value: "MA_KET", label: "Ma Kết (Capricorn)"},
    {value: "BAO_BINH", label: "Bảo Bình (Aquarius)"},
    {value: "SONG_NGU", label: "Song Ngư (Pisces)"}
];

const SIZE_OPTIONS = [
    {value: "TINY", label: "3cm"},
    {value: "SMALL", label: "7cm"},
    {value: "MEDIUM", label: "10cm"},
    {value: "LARGE", label: "13cm"},
    {value: "EXTRA_LARGE", label: "16-18cm"}
];

const SucculentForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        species_name: '',
        description: '',
        imageUrl: '',
        fengShuiList: [],
        zodiacList: [],
        selectedSizes: [],
        sizeDetailRequests: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({type: '', text: ''});
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const abortController = useRef(null);
    const fileInputRef = useRef(null);

    // Cloudinary upload function
    const uploadToCloudinary = async (file) => {
        try {
            console.log("Starting upload for file:", file);

            // Validate file
            if (!file) {
                console.error("No file provided");
                setSubmitMessage({text: "Không có file để upload", type: "error"});
                return null;
            }

            // Check file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                console.error("File too large:", file.size);
                setSubmitMessage({text: "File quá lớn. Kích thước tối đa: 10MB", type: "error"});
                return null;
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                console.error("Invalid file type:", file.type);
                setSubmitMessage({
                    text: "Loại file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP",
                    type: "error"
                });
                return null;
            }

            if (abortController.current) {
                abortController.current.abort();
            }
            abortController.current = new AbortController();

            setIsUploading(true);
            setUploadProgress(10);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "psgp_web");
            formData.append("cloud_name", "dfx4miova");
            formData.append("folder", "psgp");
            formData.append("public_id", `user_${Date.now()}`);

            console.log("Uploading to Cloudinary...");
            setUploadProgress(30);

            const response = await fetch(
                "https://api.cloudinary.com/v1_1/dfx4miova/image/upload",
                {
                    method: 'POST',
                    body: formData,
                    signal: abortController.current.signal,
                }
            );

            console.log("Response status:", response.status);
            setUploadProgress(70);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload failed:", response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Upload successful:", data);
            setUploadProgress(100);

            return data.secure_url;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log("Upload cancelled");
                setSubmitMessage({text: "Upload cancelled", type: "info"});
                return null;
            }

            console.error("Cloudinary upload error:", error);
            setSubmitMessage({text: "Upload failed: " + error.message, type: "error"});
            return null;
        } finally {
            setTimeout(() => {
                setUploadProgress(0);
                setIsUploading(false);
                abortController.current = null;
            }, 1000);
        }
    };

    // Handle file selection
    const handleFileSelect = async (event) => {
        console.log("File select triggered");
        const file = event.target.files[0];
        console.log("Selected file:", file);

        if (file) {
            console.log("File details:", {
                name: file.name,
                size: file.size,
                type: file.type
            });

            const imageUrl = await uploadToCloudinary(file);
            console.log("Upload result:", imageUrl);

            if (imageUrl) {
                setFormData(prev => ({...prev, imageUrl}));
                setSubmitMessage({text: "Upload ảnh thành công!", type: "success"});
                console.log("Image URL set in form data:", imageUrl);
            }
        } else {
            console.log("No file selected");
        }

        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    };

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
        setSubmitMessage({type: '', text: ''});
    };

    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
        setFormData({
            species_name: '',
            description: '',
            imageUrl: '',
            fengShuiList: [],
            zodiacList: [],
            selectedSizes: [],
            sizeDetailRequests: []
        });
        setErrors({});
        setSubmitMessage({type: '', text: ''});
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
        if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'URL hình ảnh là bắt buộc';
        }
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (formData.selectedSizes.length === 0) {
            newErrors.selectedSizes = 'Vui lòng chọn ít nhất một kích thước';
        }
        return newErrors;
    };

    const validateStep3 = () => {
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
                stepErrors = {
                    ...validateStep1(),
                    ...(formData.fengShuiList.length === 0 ? {fengShuiList: 'Phong thủy là bắt buộc'} : {}),
                    ...(formData.zodiacList.length === 0 ? {zodiacList: 'Cung hoàng đạo là bắt buộc'} : {})
                };
                break;
            case 2:
                stepErrors = {
                    ...validateStep2(),
                    ...validateStep3()
                };
                break;
            default:
                break;
        }

        setErrors(stepErrors);

        if (Object.keys(stepErrors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, 2));
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
            ...(formData.fengShuiList.length === 0 ? {fengShuiList: 'Phong thủy là bắt buộc'} : {}),
            ...(formData.zodiacList.length === 0 ? {zodiacList: 'Cung hoàng đạo là bắt buộc'} : {}),
            ...validateStep2(),
            ...validateStep3()
        };

        setErrors(allErrors);

        if (Object.keys(allErrors).length === 0) {
            setIsSubmitting(true);
            const apiData = {
                speciesName: formData.species_name.trim(),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim(),
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
                    setSubmitMessage({text: 'Tạo sản phẩm thành công!', type: 'success'});
                    setTimeout(() => {
                        handleCloseCreateDialog();
                        loadSucculentList();
                    }, 1500);
                } else {
                    setSubmitMessage({text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error'});
                }
            } catch (error) {
                console.error('Error creating succulent:', error);
                setSubmitMessage({text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error'});
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
        <Container maxWidth="xl" sx={{py: {xs: 3, sm: 5}}}>
            <Paper elevation={0} sx={{
                p: {xs: 2.5, sm: 4, md: 5},
                borderRadius: 4,
                background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)',
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
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <LocalFloristIcon sx={{
                            fontSize: {xs: 38, sm: 44},
                            color: 'success.main',
                            mr: 2,
                            filter: 'drop-shadow(0 4px 6px rgba(46, 125, 50, 0.2))'
                        }}/>
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
                                Quản Lý Sản Phẩm Sen Đá
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Quản lý danh sách sản phẩm sen đá của bạn
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
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
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 8}}>
                        <CircularProgress color="success" size={60}/>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                        border: '1px solid rgba(76, 175, 80, 0.1)'
                    }}>
                        <Table sx={{minWidth: 650}}>
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
                                        <TableCell sx={{fontWeight: 600, color: 'success.dark'}}>
                                            #{succulent.id}
                                        </TableCell>
                                        <TableCell sx={{fontWeight: 700, color: 'success.dark'}}>
                                            {succulent.speciesName}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={succulent.size}
                                                color="info"
                                                variant="outlined"
                                                size="small"
                                                sx={{fontWeight: 600}}
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
                                        <TableCell sx={{fontWeight: 700, color: 'success.dark'}}>
                                            {succulent.priceSell?.toLocaleString('vi-VN')} ₫
                                        </TableCell>
                                        <TableCell sx={{fontWeight: 600}}>
                                            {succulent.quantity}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={succulent.status}
                                                color={succulent.quantity > 0 ? 'success' : 'error'}
                                                variant="filled"
                                                size="small"
                                                sx={{fontWeight: 600}}
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
                                                        <VisibilityIcon/>
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
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {Array.isArray(succulentList) && succulentList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{py: 4}}>
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
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                            border: '1px solid rgba(76, 175, 80, 0.1)',
                            overflow: 'hidden'
                        }
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
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <LocalFloristIcon sx={{fontSize: '2rem'}}/>
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
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                            <Box sx={{fontSize: '0.9rem'}}>✕</Box>
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
                        <Box sx={{display: 'flex', gap: 3, height: '100%'}}>
                            {/* Product Image Placeholder - Left Side */}
                            <Box sx={{
                                flex: '0 0 200px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {selectedSucculent.imageUrl ? (
                                    <Box sx={{
                                        width: '100%',
                                        height: '200px',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                        border: '2px solid rgba(76, 175, 80, 0.2)'
                                    }}>
                                        <img
                                            src={selectedSucculent.imageUrl}
                                            alt={selectedSucculent.speciesName}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                            onError={(e) => {
                                                console.error('Image load error:', e);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </Box>
                                ) : (
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
                                        }}/>
                                        <Typography variant="h6" sx={{
                                            color: 'success.dark',
                                            fontWeight: 600,
                                            opacity: 0.8
                                        }}>
                                            {selectedSucculent.speciesName}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Product Information - Right Side */}
                            <Box sx={{flex: 1}}>
                                <Paper elevation={2} sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                    border: '1px solid rgba(76, 175, 80, 0.1)',
                                    height: '100%',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%'}}>
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

                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                {/* Price and Quantity Row */}
                                                <Box sx={{display: 'flex', gap: 1.5}}>
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
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: 'success.dark',
                                                mb: 1.5,
                                                pb: 0.5,
                                                borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                Thuộc Tính Đặc Biệt
                                            </Typography>

                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
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
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 6,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.12)',
                            border: '2px solid rgba(76, 175, 80, 0.08)',
                            overflow: 'hidden',
                            minHeight: '600px'
                        }
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
                    <Box sx={{textAlign: 'center'}}>
                        <Typography variant="h4" sx={{
                            fontWeight: 900,
                            mb: 2,
                            fontSize: '1.6rem'
                        }}>
                            Tạo Sản Phẩm Sen Đá Mới
                        </Typography>

                        {/* Progress Indicator */}
                        <Box sx={{mt: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5}}>
                                {[1, 2].map((step) => (
                                    <Box key={step} sx={{display: 'flex', alignItems: 'center'}}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                                backgroundColor: step <= currentStep ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.3)',
                                                color: step <= currentStep ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                                                transition: 'all 0.3s ease',
                                                boxShadow: step <= currentStep ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                                                border: step <= currentStep ? '3px solid rgba(255, 255, 255, 0.9)' : '2px solid rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            {step}
                                        </Box>
                                        {step < 2 && (
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 3,
                                                    backgroundColor: step < currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                                                    ml: 1.5,
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                            <Typography variant="h6" sx={{
                                display: 'block',
                                textAlign: 'center',
                                mt: 2,
                                opacity: 0.95,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}>
                                Bước {currentStep}/2: {
                                currentStep === 1 ? 'Thông tin cơ bản & Thuộc tính' :
                                    'Kích thước & Giá bán'
                            }
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{
                    p: 5,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    minHeight: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Box sx={{width: '100%', maxWidth: '800px', mx: 'auto'}}>
                        <Grid container spacing={4}>
                            {/* Step 1: Basic Information + Feng Shui & Zodiac - GỘP LẠI */}
                            {currentStep === 1 && (
                                <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3
                                }}>
                                    {/* Field 1: Tên Sen Đá - HÀNG 1 */}
                                    <TextField
                                        fullWidth
                                        label="Tên loài sen đá"
                                        value={formData.species_name}
                                        onChange={(e) => setFormData(prev => ({...prev, species_name: e.target.value}))}
                                        error={!!errors.species_name}
                                        helperText={errors.species_name}
                                        placeholder="Tên loài sen đá *"
                                        required
                                        sx={{mt: 30}}/>

                                    {/* Field 2: Mô tả sản phẩm - HÀNG 2 */}
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Mô tả sản phẩm"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                                        error={!!errors.description}
                                        helperText={errors.description || 'Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc...'}
                                        placeholder="Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc..."
                                        required/>

                                    {/* Field 3: Phong Thủy - HÀNG 3 */}
                                    <FormControl fullWidth error={!!errors.fengShuiList} required>
                                        <InputLabel sx={{fontWeight: 700, color: '#424242', fontSize: '0.95rem'}}>Phong
                                            Thủy</InputLabel>
                                        <Select
                                            multiple
                                            value={formData.fengShuiList}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                fengShuiList: e.target.value
                                            }))}
                                            label="Phong Thủy *"
                                            renderValue={(selected) => (
                                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                    {selected.map((val) => {
                                                        const label = FENG_SHUI_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                        return (
                                                            <Chip key={val} label={label} size="small"/>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    border: '2px solid #e0e0e0',
                                                    '&:hover': {
                                                        backgroundColor: 'white',
                                                        borderColor: '#4caf50'
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: 'white',
                                                        borderColor: '#4caf50',
                                                        boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    fontWeight: 700,
                                                    color: '#424242',
                                                    fontSize: '0.95rem',
                                                    '&.Mui-focused': {
                                                        color: '#4caf50'
                                                    }
                                                }
                                            }}
                                        >
                                            {FENG_SHUI_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Field 4: Cung Hoàng Đạo - HÀNG 4 */}
                                    <FormControl fullWidth error={!!errors.zodiacList} required>
                                        <InputLabel sx={{fontWeight: 700, color: '#424242', fontSize: '0.95rem'}}>Cung
                                            Hoàng Đạo</InputLabel>
                                        <Select
                                            multiple
                                            value={formData.zodiacList}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                zodiacList: e.target.value
                                            }))}
                                            label="Cung Hoàng Đạo *"
                                            renderValue={(selected) => (
                                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                    {selected.map((val) => {
                                                        const label = ZODIAC_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                        return (
                                                            <Chip key={val} label={label} size="small"/>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    border: '2px solid #e0e0e0',
                                                    '&:hover': {
                                                        backgroundColor: 'white',
                                                        borderColor: '#4caf50'
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: 'white',
                                                        borderColor: '#4caf50',
                                                        boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    fontWeight: 700,
                                                    color: '#424242',
                                                    fontSize: '0.95rem',
                                                    '&.Mui-focused': {
                                                        color: '#4caf50'
                                                    }
                                                }
                                            }}
                                        >
                                            {ZODIAC_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Field 5: Image Upload - HÀNG 5 */}
                                    <Box sx={{width: '100%'}}>
                                        <Typography variant="body2" sx={{
                                            mb: 1,
                                            fontWeight: 700,
                                            color: '#424242',
                                            fontSize: '0.95rem'
                                        }}>
                                            Hình ảnh sản phẩm *
                                        </Typography>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                            style={{display: 'none'}}
                                        />

                                        <Button
                                            variant="outlined"
                                            component="label"
                                            disabled={isUploading}
                                            onClick={() => {
                                                console.log("Button clicked");
                                                if (fileInputRef.current) {
                                                    console.log("File input ref exists");
                                                    fileInputRef.current.click();
                                                } else {
                                                    console.error("File input ref is null");
                                                }
                                            }}
                                            sx={{
                                                width: '100%',
                                                height: '56px',
                                                borderRadius: 3,
                                                border: '2px dashed #4caf50',
                                                backgroundColor: formData.imageUrl ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                                                color: formData.imageUrl ? '#4caf50' : '#424242',
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                textTransform: 'none',
                                                '&:hover': {
                                                    backgroundColor: formData.imageUrl ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
                                                    borderColor: '#4caf50',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                                                },
                                                '&:disabled': {
                                                    opacity: 0.7
                                                }
                                            }}
                                        >
                                            {isUploading ? (
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <CircularProgress size={20}/>
                                                    <Typography>Đang upload...</Typography>
                                                </Box>
                                            ) : formData.imageUrl ? (
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <LocalFloristIcon/>
                                                    <Typography>✓ Đã upload ảnh</Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <LocalFloristIcon/>
                                                    <Typography>Chọn ảnh để upload</Typography>
                                                </Box>
                                            )}
                                        </Button>

                                        {isUploading && (
                                            <Box sx={{mt: 1}}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={uploadProgress}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: '#4caf50'
                                                        }
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{
                                                    display: 'block',
                                                    textAlign: 'center',
                                                    mt: 0.5,
                                                    color: '#4caf50',
                                                    fontWeight: 600
                                                }}>
                                                    {uploadProgress}% hoàn thành
                                                </Typography>
                                            </Box>
                                        )}

                                        {formData.imageUrl && (
                                            <Box sx={{
                                                mt: 2,
                                                p: 2,
                                                backgroundColor: 'rgba(76, 175, 80, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#4caf50',
                                                    fontWeight: 600,
                                                    wordBreak: 'break-all'
                                                }}>
                                                    ✓ {formData.imageUrl}
                                                </Typography>
                                            </Box>
                                        )}

                                        {errors.imageUrl && (
                                            <Typography variant="caption" sx={{
                                                color: 'error.main',
                                                mt: 0.5,
                                                display: 'block'
                                            }}>
                                                {errors.imageUrl}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}

                            {/* Step 2: Size Selection + Price Details - GỘP LẠI */}
                            {currentStep === 2 && (
                                <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3
                                }}>
                                    {/* Field 1: Kích thước sản phẩm */}
                                    <FormControl fullWidth error={!!errors.selectedSizes} required sx={{mt: 18}}>
                                        <InputLabel sx={{fontWeight: 700, color: '#424242', fontSize: '0.95rem'}}>Kích
                                            thước sản phẩm</InputLabel>
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
                                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                    {selected.map((val) => {
                                                        const label = SIZE_OPTIONS.find(opt => opt.value === val)?.label || val;
                                                        return (
                                                            <Chip key={val} label={label} size="small"/>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    border: '2px solid #e0e0e0',
                                                    '&:hover': {
                                                        backgroundColor: 'white',
                                                        borderColor: '#4caf50'
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: 'white',
                                                        borderColor: '#4caf50',
                                                        boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    fontWeight: 700,
                                                    color: '#424242',
                                                    fontSize: '0.95rem',
                                                    '&.Mui-focused': {
                                                        color: '#4caf50'
                                                    }
                                                }
                                            }}
                                        >
                                            {SIZE_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Field 2: Chi tiết giá bán */}
                                    {formData.sizeDetailRequests.length > 0 && (
                                        <>
                                            <Typography variant="h5" sx={{
                                                mb: 2,
                                                fontWeight: 800,
                                                color: 'success.dark',
                                                textAlign: 'center',
                                                pb: 1,
                                                borderBottom: '3px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                Chi Tiết Giá Bán
                                            </Typography>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2
                                            }}>
                                                {formData.sizeDetailRequests.map((size, index) => (
                                                    <Card
                                                        key={index}
                                                        variant="outlined"
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                                            border: '2px solid rgba(76, 175, 80, 0.1)',
                                                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
                                                            '&:hover': {
                                                                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.15)',
                                                                transform: 'translateY(-2px)',
                                                                transition: 'all 0.3s ease'
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="h6" sx={{
                                                            mb: 2,
                                                            fontWeight: 700,
                                                            color: 'success.dark',
                                                            textAlign: 'center',
                                                            pb: 1,
                                                            borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                                        }}>
                                                            {size.name}
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            label="Giá bán (VNĐ)"
                                                            type="number"
                                                            inputProps={{min: 1}}
                                                            value={size.priceSell}
                                                            onChange={(e) => {
                                                                const updatedSizes = [...formData.sizeDetailRequests];
                                                                updatedSizes[index] = {
                                                                    ...updatedSizes[index],
                                                                    priceSell: e.target.value
                                                                };
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    sizeDetailRequests: updatedSizes
                                                                }));
                                                            }}
                                                            error={!!errors[`size_${index}_priceSell`]}
                                                            helperText={errors[`size_${index}_priceSell`] || 'Nhập giá bán cho kích thước này'}
                                                            placeholder="16500"
                                                            InputProps={{
                                                                startAdornment: <InputAdornment
                                                                    position="start">₫</InputAdornment>
                                                            }}
                                                            required/>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Box>

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
                    p: 4,
                    gap: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderTop: '2px solid rgba(76, 175, 80, 0.1)',
                    justifyContent: 'space-between',
                    minHeight: '90px',
                    borderRadius: '0 0 24px 24px'
                }}>
                    {/* Left side - Cancel button */}
                    <Button
                        onClick={handleCloseCreateDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderColor: '#6c757d',
                            color: '#6c757d',
                            fontSize: '0.95rem',
                            minWidth: '120px',
                            '&:hover': {
                                borderColor: '#5a6268',
                                backgroundColor: 'rgba(108, 117, 125, 0.08)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.2)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Box sx={{fontSize: '1.2rem', fontWeight: 600}}>✕</Box>
                            Hủy
                        </Box>
                    </Button>

                    {/* Right side - Step navigation buttons */}
                    <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                        {/* Previous button */}
                        {currentStep > 1 && (
                            <Button
                                onClick={handlePrevStep}
                                variant="outlined"
                                disabled={isValidating}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderColor: '#4caf50',
                                    color: '#4caf50',
                                    fontSize: '0.95rem',
                                    minWidth: '120px',
                                    '&:hover': {
                                        borderColor: '#45a049',
                                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Box sx={{fontSize: '1.2rem'}}>←</Box>
                                    Trước
                                </Box>
                            </Button>
                        )}

                        {/* Next/Submit button */}
                        {currentStep < 2 ? (
                            <Button
                                onClick={handleNextStep}
                                variant="contained"
                                disabled={isValidating}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    px: 5,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                                    fontSize: '0.95rem',
                                    minWidth: '140px',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #45a049 30%, #5cb85c 90%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(76, 175, 80, 0.3)',
                                        transform: 'none',
                                        boxShadow: 'none'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    {isValidating ? (
                                        <Box sx={{
                                            width: 18,
                                            height: 18,
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': {transform: 'rotate(0deg)'},
                                                '100%': {transform: 'rotate(360deg)'}
                                            }
                                        }}/>
                                    ) : (
                                        <>
                                            Tiếp theo
                                            <Box sx={{fontSize: '1.2rem'}}>→</Box>
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
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    px: 5,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)',
                                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                                    fontSize: '0.95rem',
                                    minWidth: '160px',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #e55a2b 30%, #e6851a 90%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(255, 107, 53, 0.3)',
                                        transform: 'none',
                                        boxShadow: 'none'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    {isSubmitting ? (
                                        <Box sx={{
                                            width: 18,
                                            height: 18,
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': {transform: 'rotate(0deg)'},
                                                '100%': {transform: 'rotate(360deg)'}
                                            }
                                        }}/>
                                    ) : (
                                        <>
                                            <Box sx={{fontSize: '1.2rem'}}>✓</Box>
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
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)'
                        }
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
                <DialogContent sx={{p: 3}}>
                    <Typography variant="body1" sx={{mb: 2}}>
                        Tính năng cập nhật sản phẩm sẽ được phát triển trong phiên bản tiếp theo.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={handleCloseUpdateDialog}
                        variant="outlined"
                        sx={{borderRadius: 2, fontWeight: 600}}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SucculentForm;

