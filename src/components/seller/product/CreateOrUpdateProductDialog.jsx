import React, {useState, useEffect} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Divider,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    PhotoCamera as PhotoCameraIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import UploadImageField from '../succulent/UploadImageField.jsx';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import {createOrUpdateProduct} from '../../../services/ProductService.jsx';
import {getSucculents, getAccessories} from '../../../services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import {DASHBOARD_STYLES} from '../../constants.js';

const CreateOrUpdateProductDialog = ({
                                         open,
                                         onClose,
                                         onCreate,
                                         editProduct = null,
                                         isEdit = false
                                     }) => {
    const [formData, setFormData] = useState({
        productId: null,
        name: '',
        description: '',
        sizes: [],
        images: []
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({type: '', text: ''});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data for dropdowns
    const [succulents, setSucculents] = useState([]);
    const [accessories, setAccessories] = useState([]);

    // Initialize form data
    useEffect(() => {
        if (isEdit && editProduct) {
            setFormData({
                productId: editProduct.productId || null,
                name: editProduct.name || '',
                description: editProduct.description || '',
                sizes: editProduct.sizes || [],
                images: editProduct.images || []
            });
        } else {
            setFormData({
                productId: null,
                name: '',
                description: '',
                sizes: [],
                images: []
            });
        }
    }, [isEdit, editProduct, open]);

    // Load dropdown data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [succulentsRes, accessoriesRes] = await Promise.all([
                    getSucculents(),
                    getAccessories('all')
                ]);

                if (succulentsRes?.data) {
                    setSucculents(succulentsRes.data);
                }
                if (accessoriesRes?.data) {
                    setAccessories(accessoriesRes.data);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        if (open) {
            loadData();
        }
    }, [open]);

    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [
                ...prev.sizes,
                {
                    name: '',
                    succulents: [],
                    pot: {name: '', size: ''},
                    soil: {name: '', massAmount: ''},
                    decoration: {
                        included: false,
                        details: []
                    }
                }
            ]
        }));
    };

    const removeSize = (index) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    const updateSize = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === index ? {...size, [field]: value} : size
            )
        }));
    };

    const addSucculentToSize = (sizeIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        succulents: [
                            ...size.succulents,
                            {id: '', name: '', size: '', quantity: ''}
                        ]
                    }
                    : size
            )
        }));
    };

    const removeSucculentFromSize = (sizeIndex, succulentIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        succulents: size.succulents.filter((_, j) => j !== succulentIndex)
                    }
                    : size
            )
        }));
    };

    const updateSucculentInSize = (sizeIndex, succulentIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        succulents: size.succulents.map((succulent, j) =>
                            j === succulentIndex ? {...succulent, [field]: value} : succulent
                        )
                    }
                    : size
            )
        }));
    };

    const addDecorationDetail = (sizeIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        decoration: {
                            ...size.decoration,
                            details: [
                                ...size.decoration.details,
                                {name: '', quantity: ''}
                            ]
                        }
                    }
                    : size
            )
        }));
    };

    const removeDecorationDetail = (sizeIndex, detailIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        decoration: {
                            ...size.decoration,
                            details: size.decoration.details.filter((_, j) => j !== detailIndex)
                        }
                    }
                    : size
            )
        }));
    };

    const updateDecorationDetail = (sizeIndex, detailIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        decoration: {
                            ...size.decoration,
                            details: size.decoration.details.map((detail, j) =>
                                j === detailIndex ? {...detail, [field]: value} : detail
                            )
                        }
                    }
                    : size
            )
        }));
    };

    const addImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [
                ...prev.images,
                {
                    imageUrl: '',
                    altText: '',
                    primary: false,
                    displayOrder: prev.images.length + 1
                }
            ]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const updateImage = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((image, i) =>
                i === index ? {...image, [field]: value} : image
            )
        }));
    };

    const handleFileSelected = async (event, imageIndex) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setMessage({type: '', text: ''});

        try {
            const imageUrl = await uploadToCloudinary(file, {onProgress: (p) => setUploadProgress(p)});
            updateImage(imageIndex, 'imageUrl', imageUrl);
        } catch (error) {
            setMessage({type: 'error', text: 'Tải ảnh thất bại'});
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic validation
        if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
        if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.sizes || formData.sizes.length === 0) {
            newErrors.sizes = 'Phải có ít nhất một kích thước';
        }

        // Validate sizes
        formData.sizes.forEach((size, sizeIndex) => {
            if (!size.name.trim()) {
                newErrors[`size_${sizeIndex}_name`] = 'Tên kích thước là bắt buộc';
            }
            if (!size.succulents || size.succulents.length === 0) {
                newErrors[`size_${sizeIndex}_succulents`] = 'Phải có ít nhất một sen đá';
            }
            if (!size.pot.name.trim()) {
                newErrors[`size_${sizeIndex}_pot`] = 'Chậu là bắt buộc';
            }
            if (!size.soil.name.trim()) {
                newErrors[`size_${sizeIndex}_soil`] = 'Đất trồng là bắt buộc';
            }
        });

        // Validate images
        if (!formData.images || formData.images.length === 0) {
            newErrors.images = 'Phải có ít nhất một hình ảnh';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const transformDataForAPI = () => {
        return {
            createAction: !isEdit,
            productId: isEdit ? formData.productId : null,
            name: formData.name.trim(),
            description: formData.description.trim(),
            sizes: formData.sizes.map(size => ({
                name: size.name.trim(),
                pot: {
                    name: size.pot.name.trim(),
                    size: size.pot.size.trim()
                },
                soil: {
                    name: size.soil.name.trim(),
                    massAmount: parseFloat(size.soil.massAmount) || 0
                },
                decoration: {
                    included: size.decoration.included,
                    details: Array.isArray(size.decoration.details) ? size.decoration.details.map(detail => ({
                        name: detail.name.trim(),
                        quantity: parseInt(detail.quantity) || 0
                    })) : []
                },
                succulents: Array.isArray(size.succulents) ? size.succulents.map(succulent => ({
                    id: parseInt(succulent.id) || 0,
                    name: succulent.name.trim(),
                    sizes: [{
                        size: succulent.size.trim(),
                        quantity: parseInt(succulent.quantity) || 0
                    }]
                })) : []
            })),
            images: Array.isArray(formData.images) ? formData.images.map(image => ({
                url: image.imageUrl.trim()
            })) : []
        };
    };

    const handleSubmit = async () => {
        setMessage({type: '', text: ''});

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = transformDataForAPI();
            console.log('Product payload:', payload);

            const response = await createOrUpdateProduct(payload);

            if (response && response.data && response.data.message) {
                setMessage({
                    type: 'success',
                    text: response.data.message
                });

                setTimeout(() => {
                    onClose();
                    onCreate && onCreate();
                }, 1500);
            } else {
                setMessage({
                    type: 'error',
                    text: isEdit ? 'Cập nhật sản phẩm thất bại' : 'Tạo sản phẩm thất bại'
                });
            }
        } catch (error) {
            console.error('Error creating/updating product:', error);
            const errorMessage = error.response?.data?.message ||
                (isEdit ? 'Có lỗi xảy ra khi cập nhật sản phẩm' : 'Có lỗi xảy ra khi tạo sản phẩm');
            setMessage({type: 'error', text: errorMessage});
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get available pots and soils from accessories
    const availablePots = Array.isArray(accessories) ? accessories.filter(acc => acc.category === 'PLANT_POT') : [];
    const availableSoils = Array.isArray(accessories) ? accessories.filter(acc => acc.category === 'SOIL') : [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    sx: DASHBOARD_STYLES.dialog
                }
            }}
        >
            <DialogTitle sx={{
                ...DASHBOARD_STYLES.dialogTitle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <InventoryIcon sx={{fontSize: '2rem'}}/>
                    <Box>
                        <Typography variant="h4" sx={{
                            fontWeight: 900,
                            mb: 0.5,
                            fontSize: '1.6rem'
                        }}>
                            {isEdit ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
                        </Typography>
                        <Typography variant="body1" sx={{opacity: 0.9, fontWeight: 400}}>
                            {isEdit ? 'Chỉnh sửa thông tin sản phẩm' : 'Thiết lập thông tin sản phẩm hoàn chỉnh'}
                        </Typography>
                    </Box>
                </Box>

                <ActionButton
                    action="cancel"
                    onClick={onClose}
                    sx={{
                        alignSelf: 'flex-end',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5
                    }}
                />
            </DialogTitle>

            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {message.text && (
                    <Alert severity={message.type === 'success' ? 'success' : 'error'} variant="filled"
                           sx={{mb: 3, fontWeight: 600, borderRadius: 2}}>
                        {message.text}
                    </Alert>
                )}

                {/* Basic Information */}
                <Box sx={[
                    {display: 'flex', flexDirection: 'column', marginTop: 3},
                    DASHBOARD_STYLES.formSection
                ]}>
                    <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                        Thông tin cơ bản
                    </Typography>
                    <Divider sx={{mb: 2}}/>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <TextField
                            fullWidth
                            label="Tên sản phẩm"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            error={!!errors.name}
                            helperText={errors.name}
                            placeholder="Nhập tên sản phẩm"
                            required
                            sx={DASHBOARD_STYLES.formField}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Mô tả sản phẩm"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            error={!!errors.description}
                            helperText={errors.description}
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            required
                            sx={DASHBOARD_STYLES.formField}
                        />
                    </Box>
                </Box>

                {/* Sizes Configuration */}
                <Box sx={DASHBOARD_STYLES.formSection}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                            Cấu hình kích thước
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={addSize}
                            sx={DASHBOARD_STYLES.primaryButton}
                        >
                            Thêm kích thước
                        </Button>
                    </Box>
                    <Divider sx={{mb: 2}}/>

                    {errors.sizes && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {errors.sizes}
                        </Alert>
                    )}

                    {Array.isArray(formData.sizes) && formData.sizes.map((size, sizeIndex) => (
                        <Accordion key={sizeIndex} sx={{mb: 2, borderRadius: 2}}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, width: '100%'}}>
                                    <Typography variant="h6" sx={{fontWeight: 600}}>
                                        Kích thước: {size.name || `Kích thước ${sizeIndex + 1}`}
                                    </Typography>
                                    <IconButton
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSize(sizeIndex);
                                        }}
                                        size="small"
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                    p: 2,
                                    backgroundColor: '#f8fffe',
                                    borderRadius: 2,
                                    border: '1px solid rgba(11, 63, 49, 0.1)'
                                }}>
                                    {/* Size Name */}
                                    <Card sx={{
                                        p: 2,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 2,
                                        border: '1px solid rgba(11, 63, 49, 0.15)'
                                    }}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 2, color: '#0b3f31'}}>
                                            Tên kích thước
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            label="Tên kích thước"
                                            value={size.name}
                                            onChange={(e) => updateSize(sizeIndex, 'name', e.target.value)}
                                            error={!!errors[`size_${sizeIndex}_name`]}
                                            helperText={errors[`size_${sizeIndex}_name`]}
                                            placeholder="medium, large, etc."
                                            sx={DASHBOARD_STYLES.formField}
                                        />
                                    </Card>

                                    {/* Succulents */}
                                    <Card sx={{
                                        p: 3,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 2,
                                        border: '1px solid rgba(11, 63, 49, 0.15)'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 3
                                        }}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                🌱 Sen đá
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<AddIcon/>}
                                                onClick={() => addSucculentToSize(sizeIndex)}
                                                sx={{
                                                    borderColor: '#0b3f31',
                                                    color: '#0b3f31',
                                                    '&:hover': {
                                                        borderColor: '#0b3f31',
                                                        backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                                    }
                                                }}
                                            >
                                                Thêm sen đá
                                            </Button>
                                        </Box>

                                        {errors[`size_${sizeIndex}_succulents`] && (
                                            <Alert severity="error" sx={{mb: 2}}>
                                                {errors[`size_${sizeIndex}_succulents`]}
                                            </Alert>
                                        )}

                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            {Array.isArray(size.succulents) && size.succulents.map((succulent, succulentIndex) => (
                                                <Card key={succulentIndex} sx={{
                                                    p: 3,
                                                    backgroundColor: '#f8fffe',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                                    position: 'relative'
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 3
                                                    }}>
                                                        <Typography variant="subtitle2"
                                                                    sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                            Sen đá #{succulentIndex + 1}
                                                        </Typography>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => removeSucculentFromSize(sizeIndex, succulentIndex)}
                                                            sx={{
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                    </Box>

                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Chọn sen đá</InputLabel>
                                                            <Select
                                                                value={succulent.id}
                                                                onChange={(e) => {
                                                                    const selectedSucculent = succulents.find(s => s.id === e.target.value);
                                                                    updateSucculentInSize(sizeIndex, succulentIndex, 'id', e.target.value);
                                                                    updateSucculentInSize(sizeIndex, succulentIndex, 'name', selectedSucculent?.speciesName || '');
                                                                }}
                                                                label="Chọn sen đá"
                                                                sx={DASHBOARD_STYLES.formField}
                                                            >
                                                                {Array.isArray(succulents) && succulents.map((s) => (
                                                                    <MenuItem key={s.id} value={s.id}>
                                                                        {s.speciesName}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>

                                                        <Box sx={{display: 'flex', gap: 2}}>
                                                            <FormControl fullWidth>
                                                                <InputLabel>Kích thước</InputLabel>
                                                                <Select
                                                                    value={succulent.size}
                                                                    onChange={(e) => updateSucculentInSize(sizeIndex, succulentIndex, 'size', e.target.value)}
                                                                    label="Kích thước"
                                                                    sx={DASHBOARD_STYLES.formField}
                                                                >
                                                                    <MenuItem value="small">Small</MenuItem>
                                                                    <MenuItem value="medium">Medium</MenuItem>
                                                                    <MenuItem value="large">Large</MenuItem>
                                                                </Select>
                                                            </FormControl>

                                                            <TextField
                                                                fullWidth
                                                                label="Số lượng"
                                                                type="number"
                                                                value={succulent.quantity}
                                                                onChange={(e) => updateSucculentInSize(sizeIndex, succulentIndex, 'quantity', e.target.value)}
                                                                inputProps={{min: 1}}
                                                                sx={DASHBOARD_STYLES.formField}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            ))}
                                        </Box>
                                    </Card>

                                    {/* Pot */}
                                    <Card sx={{
                                        p: 3,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 2,
                                        border: '1px solid rgba(11, 63, 49, 0.15)'
                                    }}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 3, color: '#0b3f31'}}>
                                            🪴 Chậu
                                        </Typography>
                                        {errors[`size_${sizeIndex}_pot`] && (
                                            <Alert severity="error" sx={{mb: 2}}>
                                                {errors[`size_${sizeIndex}_pot`]}
                                            </Alert>
                                        )}
                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <FormControl fullWidth>
                                                <InputLabel>Chọn chậu</InputLabel>
                                                <Select
                                                    value={size.pot.name}
                                                    onChange={(e) => updateSize(sizeIndex, 'pot', {
                                                        ...size.pot,
                                                        name: e.target.value
                                                    })}
                                                    label="Chọn chậu"
                                                    sx={DASHBOARD_STYLES.formField}
                                                >
                                                    {availablePots.map((pot) => (
                                                        <MenuItem key={pot.id} value={pot.name}>
                                                            {pot.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <FormControl fullWidth>
                                                <InputLabel>Kích thước chậu</InputLabel>
                                                <Select
                                                    value={size.pot.size}
                                                    onChange={(e) => updateSize(sizeIndex, 'pot', {
                                                        ...size.pot,
                                                        size: e.target.value
                                                    })}
                                                    label="Kích thước chậu"
                                                    sx={DASHBOARD_STYLES.formField}
                                                >
                                                    <MenuItem value="small">Small</MenuItem>
                                                    <MenuItem value="medium">Medium</MenuItem>
                                                    <MenuItem value="large">Large</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Card>

                                    {/* Soil */}
                                    <Card sx={{
                                        p: 3,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 2,
                                        border: '1px solid rgba(11, 63, 49, 0.15)'
                                    }}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 3, color: '#0b3f31'}}>
                                            🌿 Đất trồng
                                        </Typography>
                                        {errors[`size_${sizeIndex}_soil`] && (
                                            <Alert severity="error" sx={{mb: 2}}>
                                                {errors[`size_${sizeIndex}_soil`]}
                                            </Alert>
                                        )}
                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <FormControl fullWidth>
                                                <InputLabel>Chọn đất trồng</InputLabel>
                                                <Select
                                                    value={size.soil.name}
                                                    onChange={(e) => updateSize(sizeIndex, 'soil', {
                                                        ...size.soil,
                                                        name: e.target.value
                                                    })}
                                                    label="Chọn đất trồng"
                                                    sx={DASHBOARD_STYLES.formField}
                                                >
                                                    {availableSoils.map((soil) => (
                                                        <MenuItem key={soil.id} value={soil.name}>
                                                            {soil.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                label="Khối lượng (gram)"
                                                type="number"
                                                value={size.soil.massAmount}
                                                onChange={(e) => updateSize(sizeIndex, 'soil', {
                                                    ...size.soil,
                                                    massAmount: e.target.value
                                                })}
                                                inputProps={{min: 0, step: 0.1}}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                }}
                                                sx={DASHBOARD_STYLES.formField}
                                            />
                                        </Box>
                                    </Card>

                                    {/* Decoration */}
                                    <Card sx={{
                                        p: 3,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 2,
                                        border: '1px solid rgba(11, 63, 49, 0.15)'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 3
                                        }}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                ✨ Trang trí
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Typography variant="body2" sx={{color: '#0b3f31'}}>Bao gồm trang
                                                    trí:</Typography>
                                                <FormControl size="small" sx={{minWidth: 80}}>
                                                    <Select
                                                        value={size.decoration.included}
                                                        onChange={(e) => updateSize(sizeIndex, 'decoration', {
                                                            ...size.decoration,
                                                            included: e.target.value
                                                        })}
                                                        sx={{
                                                            '& .MuiSelect-select': {
                                                                color: '#0b3f31',
                                                                fontWeight: 600
                                                            }
                                                        }}
                                                    >
                                                        <MenuItem value={true}>Có</MenuItem>
                                                        <MenuItem value={false}>Không</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Box>

                                        {size.decoration.included && (
                                            <Box>
                                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 3}}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<AddIcon/>}
                                                        onClick={() => addDecorationDetail(sizeIndex)}
                                                        sx={{
                                                            borderColor: '#0b3f31',
                                                            color: '#0b3f31',
                                                            '&:hover': {
                                                                borderColor: '#0b3f31',
                                                                backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        Thêm chi tiết trang trí
                                                    </Button>
                                                </Box>

                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                    {Array.isArray(size.decoration.details) && size.decoration.details.map((detail, detailIndex) => (
                                                        <Card key={detailIndex} sx={{
                                                            p: 3,
                                                            backgroundColor: '#f8fffe',
                                                            borderRadius: 2,
                                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                                            position: 'relative'
                                                        }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mb: 3
                                                            }}>
                                                                <Typography variant="subtitle2"
                                                                            sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                                    Chi tiết #{detailIndex + 1}
                                                                </Typography>
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => removeDecorationDetail(sizeIndex, detailIndex)}
                                                                    sx={{
                                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon/>
                                                                </IconButton>
                                                            </Box>

                                                            <Box sx={{display: 'flex', gap: 2}}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Tên chi tiết trang trí"
                                                                    value={detail.name}
                                                                    onChange={(e) => updateDecorationDetail(sizeIndex, detailIndex, 'name', e.target.value)}
                                                                    placeholder="đèn cao, đá trang trí, etc."
                                                                    sx={DASHBOARD_STYLES.formField}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Số lượng"
                                                                    type="number"
                                                                    value={detail.quantity}
                                                                    onChange={(e) => updateDecorationDetail(sizeIndex, detailIndex, 'quantity', e.target.value)}
                                                                    inputProps={{min: 1}}
                                                                    sx={DASHBOARD_STYLES.formField}
                                                                />
                                                            </Box>
                                                        </Card>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Card>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Images */}
                <Card sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)'
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                            Hình ảnh sản phẩm
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PhotoCameraIcon/>}
                            onClick={addImage}
                            sx={DASHBOARD_STYLES.primaryButton}
                        >
                            Thêm hình ảnh
                        </Button>
                    </Box>
                    <Divider sx={{mb: 2}}/>

                    {errors.images && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {errors.images}
                        </Alert>
                    )}

                    {Array.isArray(formData.images) && formData.images.map((image, imageIndex) => (
                        <Card key={imageIndex} sx={{p: 2, mb: 2, backgroundColor: '#f8fffe'}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    Hình ảnh #{imageIndex + 1}
                                </Typography>
                                <IconButton
                                    color="error"
                                    onClick={() => removeImage(imageIndex)}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    {/* Image Upload & Preview */}
                                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box>
                                            <input
                                                accept="image/*"
                                                style={{display: 'none'}}
                                                id={`image-upload-${imageIndex}`}
                                                type="file"
                                                onChange={(e) => handleFileSelected(e, imageIndex)}
                                            />
                                            <label htmlFor={`image-upload-${imageIndex}`}>
                                                <Button
                                                    variant="outlined"
                                                    component="span"
                                                    startIcon={<PhotoCameraIcon/>}
                                                    fullWidth
                                                    disabled={isUploading}
                                                    sx={{
                                                        borderColor: '#0b3f31',
                                                        color: '#0b3f31',
                                                        py: 1.5,
                                                        '&:hover': {
                                                            borderColor: '#0b3f31',
                                                            backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    {isUploading ? 'Đang tải...' : 'Chọn hình ảnh'}
                                                </Button>
                                            </label>
                                            {isUploading && (
                                                <Typography variant="caption" color="text.secondary"
                                                            sx={{mt: 1, display: 'block'}}>
                                                    Tiến độ: {uploadProgress}%
                                                </Typography>
                                            )}
                                        </Box>

                                        {image.imageUrl && (
                                            <Box sx={{
                                                border: '2px solid rgba(11, 63, 49, 0.2)',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                backgroundColor: '#f8fffe'
                                            }}>
                                                <img
                                                    src={image.imageUrl}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Image Details */}
                                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <TextField
                                            fullWidth
                                            label="Alt text"
                                            value={image.altText}
                                            onChange={(e) => updateImage(imageIndex, 'altText', e.target.value)}
                                            placeholder="Mô tả hình ảnh"
                                            sx={DASHBOARD_STYLES.formField}
                                        />

                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <FormControl sx={{flex: 1}}>
                                                <InputLabel>Ảnh chính</InputLabel>
                                                <Select
                                                    value={image.primary}
                                                    onChange={(e) => updateImage(imageIndex, 'primary', e.target.value)}
                                                    label="Ảnh chính"
                                                    sx={DASHBOARD_STYLES.formField}
                                                >
                                                    <MenuItem value={true}>Có</MenuItem>
                                                    <MenuItem value={false}>Không</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                label="Thứ tự hiển thị"
                                                type="number"
                                                value={image.displayOrder}
                                                onChange={(e) => updateImage(imageIndex, 'displayOrder', parseInt(e.target.value))}
                                                slotProps={{
                                                    input: {
                                                        min: 1
                                                    }
                                                }}
                                                sx={{width: 140, ...DASHBOARD_STYLES.formField}}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Card>
            </DialogContent>

            <DialogActions sx={{p: 3, backgroundColor: '#f7faf7'}}>
                <ActionButton
                    onClick={onClose}
                    type="button"
                    action="cancel"
                />

                <ActionButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    action={isEdit ? "update" : "create"}
                    type="submit"
                >
                    {isSubmitting ? (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Box sx={{
                                width: 18,
                                height: 18,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}/>
                            {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                        </Box>
                    ) : (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Box sx={{fontSize: '1.2rem'}}>✓</Box>
                            {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                        </Box>
                    )}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
};

export default CreateOrUpdateProductDialog;
