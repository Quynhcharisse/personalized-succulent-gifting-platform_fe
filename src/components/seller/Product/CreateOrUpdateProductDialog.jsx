import React, { useState, useEffect } from 'react';
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
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import UploadImageField from '../succulent/UploadImageField.jsx';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import { createOrUpdateProduct } from '../../../services/ProductService.jsx';
import { getSucculents, getAccessories } from '../../../services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';

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
    const [message, setMessage] = useState({ type: '', text: '' });
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
                    pot: { name: '', size: '' },
                    soil: { name: '', massAmount: '' },
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
                i === index ? { ...size, [field]: value } : size
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
                            { id: '', name: '', size: '', quantity: '' }
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
                            j === succulentIndex ? { ...succulent, [field]: value } : succulent
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
                                { name: '', quantity: '' }
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
                                j === detailIndex ? { ...detail, [field]: value } : detail
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
                i === index ? { ...image, [field]: value } : image
            )
        }));
    };

    const handleFileSelected = async (event, imageIndex) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        setUploadProgress(0);
        setMessage({ type: '', text: '' });
        
        try {
            const imageUrl = await uploadToCloudinary(file, { onProgress: (p) => setUploadProgress(p) });
            updateImage(imageIndex, 'imageUrl', imageUrl);
        } catch (error) {
            setMessage({ type: 'error', text: 'Tải ảnh thất bại' });
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
            productId: formData.productId,
            name: formData.name.trim(),
            description: formData.description.trim(),
            sizes: formData.sizes.map(size => ({
                name: size.name.trim(),
                succulents: size.succulents.map(succulent => ({
                    id: parseInt(succulent.id) || 0,
                    name: succulent.name.trim(),
                    size: succulent.size.trim(),
                    quantity: parseInt(succulent.quantity) || 0
                })),
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
                    details: size.decoration.details.map(detail => ({
                        name: detail.name.trim(),
                        quantity: parseInt(detail.quantity) || 0
                    }))
                }
            })),
            images: formData.images.map(image => ({
                imageUrl: image.imageUrl.trim(),
                altText: image.altText.trim(),
                primary: image.primary,
                displayOrder: image.displayOrder
            }))
        };
    };

    const handleSubmit = async () => {
        setMessage({ type: '', text: '' });
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const payload = transformDataForAPI();
            console.log('Product payload:', payload);
            
            const response = await createOrUpdateProduct(payload, !isEdit);
            
            if (response && (response.status === 200 || response.status === 201)) {
                setMessage({ 
                    type: 'success', 
                    text: isEdit ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!' 
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
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get available pots and soils from accessories
    const availablePots = accessories.filter(acc => acc.category === 'PLANT_POT');
    const availableSoils = accessories.filter(acc => acc.category === 'SOIL');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{
                        fontWeight: 900,
                        mb: 2,
                        fontSize: '1.6rem'
                    }}>
                        {isEdit ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 400 }}>
                        {isEdit ? 'Chỉnh sửa thông tin sản phẩm' : 'Thiết lập thông tin sản phẩm hoàn chỉnh'}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{
                p: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                minHeight: '500px',
                maxHeight: '70vh',
                overflow: 'auto'
            }}>
                {message.text && (
                    <Alert severity={message.type === 'success' ? 'success' : 'error'} variant="filled"
                           sx={{ mb: 3, fontWeight: 600, borderRadius: 2 }}>
                        {message.text}
                    </Alert>
                )}

                {/* Basic Information */}
                <Card sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark', mb: 2 }}>
                        Thông tin cơ bản
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tên sản phẩm"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                error={!!errors.name}
                                helperText={errors.name}
                                placeholder="Nhập tên sản phẩm"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Mô tả sản phẩm"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                error={!!errors.description}
                                helperText={errors.description}
                                placeholder="Mô tả chi tiết về sản phẩm..."
                                required
                            />
                        </Grid>
                    </Grid>
                </Card>

                {/* Sizes Configuration */}
                <Card sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                            Cấu hình kích thước
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={addSize}
                            sx={{
                                background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                                borderRadius: 2
                            }}
                        >
                            Thêm kích thước
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {errors.sizes && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.sizes}
                        </Alert>
                    )}

                    {formData.sizes.map((size, sizeIndex) => (
                        <Accordion key={sizeIndex} sx={{ mb: 2, borderRadius: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Size Name */}
                                    <TextField
                                        fullWidth
                                        label="Tên kích thước"
                                        value={size.name}
                                        onChange={(e) => updateSize(sizeIndex, 'name', e.target.value)}
                                        error={!!errors[`size_${sizeIndex}_name`]}
                                        helperText={errors[`size_${sizeIndex}_name`]}
                                        placeholder="medium, large, etc."
                                    />

                                    {/* Succulents */}
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Sen đá
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<AddIcon />}
                                                onClick={() => addSucculentToSize(sizeIndex)}
                                            >
                                                Thêm sen đá
                                            </Button>
                                        </Box>
                                        
                                        {errors[`size_${sizeIndex}_succulents`] && (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {errors[`size_${sizeIndex}_succulents`]}
                                            </Alert>
                                        )}

                                        {size.succulents.map((succulent, succulentIndex) => (
                                            <Card key={succulentIndex} sx={{ p: 2, mb: 2, backgroundColor: '#f8fffe' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle2">Sen đá #{succulentIndex + 1}</Typography>
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeSucculentFromSize(sizeIndex, succulentIndex)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                                
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
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
                                                            >
                                                                {succulents.map((s) => (
                                                                    <MenuItem key={s.id} value={s.id}>
                                                                        {s.speciesName}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Kích thước</InputLabel>
                                                            <Select
                                                                value={succulent.size}
                                                                onChange={(e) => updateSucculentInSize(sizeIndex, succulentIndex, 'size', e.target.value)}
                                                                label="Kích thước"
                                                            >
                                                                <MenuItem value="small">Small</MenuItem>
                                                                <MenuItem value="medium">Medium</MenuItem>
                                                                <MenuItem value="large">Large</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Số lượng"
                                                            type="number"
                                                            value={succulent.quantity}
                                                            onChange={(e) => updateSucculentInSize(sizeIndex, succulentIndex, 'quantity', e.target.value)}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        ))}
                                    </Box>

                                    {/* Pot */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                            Chậu
                                        </Typography>
                                        {errors[`size_${sizeIndex}_pot`] && (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {errors[`size_${sizeIndex}_pot`]}
                                            </Alert>
                                        )}
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Chọn chậu</InputLabel>
                                                    <Select
                                                        value={size.pot.name}
                                                        onChange={(e) => updateSize(sizeIndex, 'pot', { ...size.pot, name: e.target.value })}
                                                        label="Chọn chậu"
                                                    >
                                                        {availablePots.map((pot) => (
                                                            <MenuItem key={pot.id} value={pot.name}>
                                                                {pot.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Kích thước chậu</InputLabel>
                                                    <Select
                                                        value={size.pot.size}
                                                        onChange={(e) => updateSize(sizeIndex, 'pot', { ...size.pot, size: e.target.value })}
                                                        label="Kích thước chậu"
                                                    >
                                                        <MenuItem value="small">Small</MenuItem>
                                                        <MenuItem value="medium">Medium</MenuItem>
                                                        <MenuItem value="large">Large</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Soil */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                            Đất trồng
                                        </Typography>
                                        {errors[`size_${sizeIndex}_soil`] && (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {errors[`size_${sizeIndex}_soil`]}
                                            </Alert>
                                        )}
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Chọn đất trồng</InputLabel>
                                                    <Select
                                                        value={size.soil.name}
                                                        onChange={(e) => updateSize(sizeIndex, 'soil', { ...size.soil, name: e.target.value })}
                                                        label="Chọn đất trồng"
                                                    >
                                                        {availableSoils.map((soil) => (
                                                            <MenuItem key={soil.id} value={soil.name}>
                                                                {soil.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Khối lượng (gram)"
                                                    type="number"
                                                    value={size.soil.massAmount}
                                                    onChange={(e) => updateSize(sizeIndex, 'soil', { ...size.soil, massAmount: e.target.value })}
                                                    inputProps={{ min: 0, step: 0.1 }}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Decoration */}
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Trang trí
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2">Bao gồm trang trí:</Typography>
                                                <FormControl size="small">
                                                    <Select
                                                        value={size.decoration.included}
                                                        onChange={(e) => updateSize(sizeIndex, 'decoration', { ...size.decoration, included: e.target.value })}
                                                    >
                                                        <MenuItem value={true}>Có</MenuItem>
                                                        <MenuItem value={false}>Không</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Box>

                                        {size.decoration.included && (
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => addDecorationDetail(sizeIndex)}
                                                    >
                                                        Thêm chi tiết trang trí
                                                    </Button>
                                                </Box>

                                                {size.decoration.details.map((detail, detailIndex) => (
                                                    <Card key={detailIndex} sx={{ p: 2, mb: 2, backgroundColor: '#f8fffe' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                            <Typography variant="subtitle2">Chi tiết #{detailIndex + 1}</Typography>
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => removeDecorationDetail(sizeIndex, detailIndex)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                        
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={8}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Tên chi tiết trang trí"
                                                                    value={detail.name}
                                                                    onChange={(e) => updateDecorationDetail(sizeIndex, detailIndex, 'name', e.target.value)}
                                                                    placeholder="đèn cao, đá trang trí, etc."
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Số lượng"
                                                                    type="number"
                                                                    value={detail.quantity}
                                                                    onChange={(e) => updateDecorationDetail(sizeIndex, detailIndex, 'quantity', e.target.value)}
                                                                    inputProps={{ min: 1 }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Card>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Card>

                {/* Images */}
                <Card sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                            Hình ảnh sản phẩm
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PhotoCameraIcon />}
                            onClick={addImage}
                            sx={{
                                background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                                borderRadius: 2
                            }}
                        >
                            Thêm hình ảnh
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {errors.images && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.images}
                        </Alert>
                    )}

                    {formData.images.map((image, imageIndex) => (
                        <Card key={imageIndex} sx={{ p: 2, mb: 2, backgroundColor: '#f8fffe' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Hình ảnh #{imageIndex + 1}
                                </Typography>
                                <IconButton
                                    color="error"
                                    onClick={() => removeImage(imageIndex)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id={`image-upload-${imageIndex}`}
                                            type="file"
                                            onChange={(e) => handleFileSelected(e, imageIndex)}
                                        />
                                        <label htmlFor={`image-upload-${imageIndex}`}>
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<PhotoCameraIcon />}
                                                fullWidth
                                                disabled={isUploading}
                                            >
                                                {isUploading ? 'Đang tải...' : 'Chọn hình ảnh'}
                                            </Button>
                                        </label>
                                        {isUploading && (
                                            <Typography variant="caption" color="text.secondary">
                                                Tiến độ: {uploadProgress}%
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    {image.imageUrl && (
                                        <Box sx={{ mb: 2 }}>
                                            <img
                                                src={image.imageUrl}
                                                alt="Preview"
                                                style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0'
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Alt text"
                                        value={image.altText}
                                        onChange={(e) => updateImage(imageIndex, 'altText', e.target.value)}
                                        placeholder="Mô tả hình ảnh"
                                        sx={{ mb: 2 }}
                                    />
                                    
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <FormControl>
                                            <InputLabel>Ảnh chính</InputLabel>
                                            <Select
                                                value={image.primary}
                                                onChange={(e) => updateImage(imageIndex, 'primary', e.target.value)}
                                                label="Ảnh chính"
                                                size="small"
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
                                            inputProps={{ min: 1 }}
                                            size="small"
                                            sx={{ width: 120 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Card>
                    ))}
                </Card>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                width: 18,
                                height: 18,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: '1.2rem' }}>✓</Box>
                            {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                        </Box>
                    )}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
};

export default CreateOrUpdateProductDialog;
