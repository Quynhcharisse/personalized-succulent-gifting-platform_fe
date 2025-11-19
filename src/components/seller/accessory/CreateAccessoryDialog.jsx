import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextareaAutosize,
    TextField,
    Typography
} from '@mui/material';
import UploadImageField from '../succulent/UploadImageField.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import {createDecorationAccessory, createPotAccessory, createSoilAccessory} from '../../../services/ProductService.jsx';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import { DASHBOARD_STYLES } from '../../constants.js';

const EMPTY_FORM = {
    name: '',
    description: '',
    category: '',
    priceSell: '',
    quantity: '',
    image: '',
    material: '',
    color: '#2196f3',
    availableMassValue: '',
    basePricing: {
        massValue: '',
        massUnit: 'gram',
        price: ''
    },
    sizes: []
};

const CATEGORY_TO_BACKEND = {
    pots: 'PLANT_POT',
    PLANT_POT: 'PLANT_POT',
    soils: 'SOIL',
    SOIL: 'SOIL',
    decorations: 'DECOR_ACCESSORY',
    DECOR_ACCESSORY: 'DECOR_ACCESSORY'
};

const pickImageUrl = (source) => {
    if (!source) return '';
    const inspect = (val) => {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            return val.url || val.image || null;
        }
        return null;
    };

    if (typeof source === 'string') return source;
    if (Array.isArray(source)) {
        for (const item of source) {
            const img = inspect(item);
            if (img) return img;
        }
        return '';
    }
    if (typeof source === 'object') {
        const keys = ['image', 'images', 'url'];
        for (const key of keys) {
            const val = source[key];
            const img = pickImageUrl(val);
            if (img) return img;
        }
    }
    return '';
};

const mapPotSizesToForm = (rawSizes = []) => {
    if (!Array.isArray(rawSizes)) return [];
    return rawSizes.map((size) => {
        const safe = size || {};
        const getString = (value) => (value === undefined || value === null ? '' : String(value));
        return {
            name: getString(safe.name || safe.sizeName),
            price: getString(safe.price),
            availableQty: getString(safe.availableQty ?? safe.quantity),
            potHeight: getString(safe.potHeight),
            potUpperCrossSectionArea: getString(safe.potUpperCrossSectionArea),
            maxSoilMassValue: getString(safe.maxSoilMassValue)
        };
    });
};

const createEmptyForm = () => ({
    ...EMPTY_FORM,
    basePricing: {...EMPTY_FORM.basePricing},
    sizes: []
});

const asString = (value) => (value === undefined || value === null ? '' : String(value));

const buildFormFromEditItem = (item) => {
    const draft = createEmptyForm();
    if (!item) return draft;

    const raw = item.raw || item || {};
    const categoryKey = item.category || raw.category;
    draft.category = CATEGORY_TO_BACKEND[categoryKey] || '';

    draft.name = asString(raw.name ?? item.name);
    draft.description = asString(raw.description ?? item.description);
    draft.image = pickImageUrl(raw) || pickImageUrl(item) || '';

    switch (draft.category) {
        case 'PLANT_POT': {
            draft.material = asString(raw.material ?? item.material);
            draft.color = raw.color || item.color || draft.color;
            const sizes = Array.isArray(raw.size)
                ? raw.size
                : Array.isArray(raw.sizes)
                    ? raw.sizes
                    : item.sizes;
            draft.sizes = mapPotSizesToForm(sizes);
            break;
        }
        case 'SOIL': {
            draft.availableMassValue = asString(raw.availableMassValue ?? raw.quantity ?? item.availableMassValue);
            const basePricing = raw.basePricing || item.basePricing || {};
            draft.basePricing = {
                massValue: asString(basePricing.massValue),
                massUnit: basePricing.massUnit || 'gram',
                price: asString(basePricing.price)
            };
            break;
        }
        case 'DECOR_ACCESSORY': {
            draft.priceSell = asString(raw.price ?? item.price ?? raw.priceSell);
            draft.quantity = asString(raw.availableQty ?? raw.quantity ?? item.availableQty);
            break;
        }
        default:
            break;
    }

    return draft;
};

export default function CreateAccessoryDialog({open, onClose, onCreate, editItem = null, isEdit = false}) {
    const [form, setForm] = useState(() => createEmptyForm());
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({type: '', text: ''});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalName, setOriginalName] = useState('');

    // Initialize form with edit data if in edit mode
    React.useEffect(() => {
        if (!open) {
            return;
        }

        setErrors({});
        setMessage({type: '', text: ''});

        if (isEdit && editItem) {
            setForm(buildFormFromEditItem(editItem));
            const raw = editItem?.raw || editItem || {};
            const rawName = asString(raw.name ?? editItem?.name ?? '').trim();
            setOriginalName(rawName);
        } else {
            setForm(createEmptyForm());
            setOriginalName('');
        }
    }, [isEdit, editItem, open]);

    const handleAddSize = () => {
        setForm(prev => ({
            ...prev,
            sizes: [
                ...prev.sizes,
                {
                    name: '',
                    price: '',
                    availableQty: '',
                    potHeight: '',
                    potUpperCrossSectionArea: '',
                    maxSoilMassValue: ''
                }
            ]
        }));
    };

    const handleUpdateSizeField = (index, field, value) => {
        setForm(prev => {
            const sizes = [...prev.sizes];
            sizes[index] = { ...sizes[index], [field]: value };
            return { ...prev, sizes };
        });
    };

    const handleRemoveSize = (index) => {
        setForm(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const e = {};
        
        // Common validations - Backend yêu cầu tất cả
        if (!form.name.trim()) e.name = 'Tên là bắt buộc';
        if (!form.description.trim()) e.description = 'Mô tả là bắt buộc';
        if (!form.category) e.category = 'Danh mục là bắt buộc';
        if (!form.image.trim()) e.image = 'Hình ảnh là bắt buộc';

        // Decoration specific validations
        if (form.category === 'DECOR_ACCESSORY') {
            if (!form.priceSell || Number(form.priceSell) <= 0) e.priceSell = 'Giá bán > 0';
            if (!form.quantity || Number(form.quantity) < 0) e.quantity = 'Số lượng >= 0';
        }

        // Pot specific validations
        if (form.category === 'PLANT_POT') {
            if (!form.material.trim()) e.material = 'Chất liệu là bắt buộc';
            if (!form.color || !form.color.match(/^#[0-9A-F]{6}$/i)) e.color = 'Màu sắc là bắt buộc';
            if (!form.sizes || form.sizes.length === 0) {
                e.sizes = 'Thêm ít nhất 1 kích cỡ chậu';
            } else {
                const validSizes = form.sizes.filter(s => s.name?.trim());
                if (validSizes.length === 0) {
                    e.sizes = 'Thêm ít nhất 1 size có tên hợp lệ';
                } else {
                    const invalid = validSizes.some(s =>
                        !s.name?.trim() ||
                        !s.price || Number(s.price) <= 0 ||
                        s.availableQty === '' || Number(s.availableQty) < 0 ||
                        !s.potHeight || Number(s.potHeight) <= 0 ||
                        !s.potUpperCrossSectionArea || Number(s.potUpperCrossSectionArea) <= 0 ||
                        !s.maxSoilMassValue || Number(s.maxSoilMassValue) <= 0
                    );
                    if (invalid) e.sizes = 'Điền đầy đủ tất cả thông tin size';
                }
            }
        }

        // Soil specific validations
        if (form.category === 'SOIL') {
            if (!form.availableMassValue || Number(form.availableMassValue) <= 0) e.availableMassValue = 'Khối lượng có sẵn > 0';
            if (!form.basePricing.massValue || Number(form.basePricing.massValue) <= 0) e.basePricingMassValue = 'Khối lượng cơ bản > 0';
            if (!form.basePricing.price || Number(form.basePricing.price) <= 0) e.basePricingPrice = 'Giá cơ bản > 0';
            if (!form.basePricing.massUnit.trim()) e.basePricingMassUnit = 'Đơn vị là bắt buộc';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const createDecorationData = () => {
        const nameForRequest = isEdit && originalName ? originalName : form.name.trim();
        return {
            createPot: false,
            potData: null,
            createSoil: false,
            soilData: null,
            createDecoration: true,
            decorationData: {
                name: nameForRequest,
                description: form.description.trim(),
                price: Number(form.priceSell),
                availableQty: Number(form.quantity),
                images: form.image && form.image.trim() ? [{image: form.image.trim()}] : []
            }
        };
    }

    const createPotData = () => {
        // Ensure we have a valid image URL
        const imageUrl = form.image && form.image.trim();
        if (!imageUrl) {
            throw new Error('Hình ảnh là bắt buộc');
        }
        const nameForRequest = isEdit && originalName ? originalName : form.name.trim();

        return {
            createPot: true,
            potData: {
                name: nameForRequest,
                description: form.description.trim(),
                material: form.material.trim(),
                color: form.color,
                images: [{image: imageUrl}],
                sizes: (form.sizes || [])
                    .filter(s => s.name?.trim()) // Lọc bỏ size có tên rỗng
                    .map(s => ({
                        name: s.name.trim(),
                        sizeName: s.name.trim(), // Thêm cả hai field
                        price: Number(s.price),
                        availableQty: Number(s.availableQty),
                        potHeight: Number(s.potHeight),
                        potUpperCrossSectionArea: Number(s.potUpperCrossSectionArea),
                        maxSoilMassValue: Number(s.maxSoilMassValue)
                    }))
            },
            createSoil: false,
            soilData: null,
            createDecoration: false,
            decorationData: null
        };
    }

    const createSoilData = () => {
        const nameForRequest = isEdit && originalName ? originalName : form.name.trim();
        return {
            createPot: false,
            potData: null,
            createSoil: true,
            soilData: {
                name: nameForRequest,
                description: form.description.trim(),
                availableMassValue: Number(form.availableMassValue),
                basePricing: {
                    massValue: Number(form.basePricing.massValue),
                    massUnit: form.basePricing.massUnit,
                    price: Number(form.basePricing.price)
                },
                images: form.image && form.image.trim() ? [{image: form.image.trim()}] : []
            },
            createDecoration: false,
            decorationData: null
        };
    }

    const handleCreate = async () => {
        setMessage({type: '', text: ''});
        if (!validate()) return;
        
        // Ensure image exists
        if (!form.image || !form.image.trim()) {
            setMessage({type: 'error', text: 'Vui lòng tải lên hình ảnh'});
            return;
        }
        
        setIsSubmitting(true);
        try {
            let response;
            let accessoryData;

            switch (form.category) {
                case 'DECOR_ACCESSORY':
                    accessoryData = createDecorationData();
                    console.log('Decoration payload:', JSON.stringify(accessoryData, null, 2), 'createAction:', !isEdit);
                    response = await createDecorationAccessory(accessoryData, !isEdit);
                    break;
                case 'PLANT_POT':
                    accessoryData = createPotData();
                    console.log('Pot payload:', JSON.stringify(accessoryData, null, 2));
                    console.log('Image URL:', form.image);
                    console.log('Images array:', accessoryData.potData.images);
                    response = await createPotAccessory(accessoryData, !isEdit);
                    break;
                case 'SOIL':
                    accessoryData = createSoilData();
                    console.log('Soil payload:', JSON.stringify(accessoryData, null, 2), 'createAction:', !isEdit);
                    response = await createSoilAccessory(accessoryData, !isEdit);
                    break;
                default:
                    throw new Error('Loại phụ kiện không hợp lệ');
            }

            if (response && (response.status === 200 || response.status === 201)) {
                setMessage({type: 'success', text: isEdit ? 'Cập nhật phụ kiện thành công!' : 'Tạo phụ kiện thành công!'});
                setTimeout(() => {
                    onClose();
                    onCreate && onCreate();
                }, 1500);
            } else {
                setMessage({type: 'error', text: isEdit ? 'Cập nhật phụ kiện thất bại' : 'Tạo phụ kiện thất bại'});
            }
        } catch (error) {
            console.error('Error creating/updating accessory:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Show specific error message from backend if available
            const errorMessage = error.response?.data?.message || 
                                (isEdit ? 'Có lỗi xảy ra khi cập nhật phụ kiện' : 'Có lỗi xảy ra khi tạo phụ kiện');
            setMessage({type: 'error', text: errorMessage});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(0);
        setMessage({type: '', text: ''});
        try {
            const image = await uploadToCloudinary(file, {onProgress: (p) => setUploadProgress(p)});
            setForm(prev => ({...prev, image: image}));
        } catch (e) {
            setMessage({type: 'error', text: 'Tải ảnh thất bại'});
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const CATEGORIES = [
        {value: 'PLANT_POT', label: 'Chậu cây'},
        {value: 'SOIL', label: 'Đất trồng'},
        {value: 'DECOR_ACCESSORY', label: 'Phụ kiện trang trí'}
    ];

    const handleColorChange = (event) => {
        setForm(prev => ({...prev, color: event.target.value}));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: DASHBOARD_STYLES.dialog
                }
            }}
        >
            <DialogTitle sx={DASHBOARD_STYLES.dialogTitle}>
                {isEdit ? 'Cập Nhật Phụ Kiện' : 'Tạo Phụ Kiện Mới'}
                <Typography variant="body2" sx={{opacity: 0.9, mt: 0.5, fontWeight: 400}}>
                    {isEdit ? 'Chỉnh sửa thông tin phụ kiện' : 'Thiết lập thông tin và đăng bán nhanh chóng'}
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {message.text && (
                    <Alert
                        severity={message.type === 'error' ? 'error' : 'success'}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                                fontSize: '0.95rem'
                            }
                        }}
                    >
                        {message.text}
                    </Alert>
                )}

                <Box sx={DASHBOARD_STYLES.formSection}>
                    <Typography variant="h6" sx={DASHBOARD_STYLES.sectionTitle}>Thông tin cơ bản</Typography>
                    <Divider sx={{mb: 2}}/>

                {/* Danh mục - Đưa lên đầu */}
                <FormControl
                    fullWidth
                    error={!!errors.category}
                    sx={{
                        mb: 2,
                        ...DASHBOARD_STYLES.formField
                    }}
                >
                    <InputLabel>Danh mục sản phẩm</InputLabel>
                    <Select
                        label="Danh mục sản phẩm"
                        value={form.category}
                        onChange={(e) => setForm(prev => ({...prev, category: e.target.value}))}
                        variant={"outlined"}
                    >
                        {CATEGORIES.map(c => (
                            <MenuItem key={c.value} value={c.value}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    {c.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                <TextField
                    label="Tên phụ kiện"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm(prev => ({...prev, name: e.target.value}))}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={DASHBOARD_STYLES.formField}
                    InputProps={{
                        readOnly: isEdit
                    }}
                />
                        </Box>
                        <Box>
                            <TextareaAutosize
                    value={form.description}
                    onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
                                placeholder="Nhập mô tả chi tiết"
                                style={{
                                    height: 190,
                                    width: 771,
                                    overflow: 'hidden',
                                    fontSize: '1rem',
                                    lineHeight: 1.5,
                                    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid rgba(0,0,0,0.23)'
                                }}
                            />
                            {errors.description && (
                                <Typography variant="caption" color="error">{errors.description}</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
                {/* Conditional fields based on category */}
                {form.category === 'DECOR_ACCESSORY' && (
                    <>
                        <TextField
                            label="Giá bán (VNĐ)"
                            type="number"
                            inputProps={{min: 1}}
                            fullWidth
                            value={form.priceSell}
                            onChange={(e) => setForm(prev => ({...prev, priceSell: e.target.value}))}
                            error={!!errors.priceSell}
                            helperText={errors.priceSell}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'white',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4caf50',
                                        borderWidth: 2
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4caf50',
                                        borderWidth: 2
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    fontWeight: 500,
                                    color: '#424242'
                                }
                            }}
                            InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                        />
                        <TextField
                            label="Số lượng"
                            type="number"
                            inputProps={{min: 1}}
                            fullWidth
                            value={form.quantity}
                            onChange={(e) => setForm(prev => ({...prev, quantity: e.target.value}))}
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'white',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4caf50',
                                        borderWidth: 2
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4caf50',
                                        borderWidth: 2
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    fontWeight: 500,
                                    color: '#424242'
                                }
                            }}
                            InputProps={{ endAdornment: <InputAdornment position="end">sp</InputAdornment> }}
                        />
                    </>
                )}

                {form.category === 'PLANT_POT' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                        <Box>
                            <TextField
                                label="Chất liệu"
                                fullWidth
                                value={form.material}
                                onChange={(e) => setForm(prev => ({...prev, material: e.target.value}))}
                                error={!!errors.material}
                                helperText={errors.material}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#4caf50',
                                            borderWidth: 2
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#4caf50',
                                            borderWidth: 2
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontWeight: 500,
                                        color: '#424242'
                                    }
                                }}
                            />
                        </Box>
                        <Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <TextField
                                    label="Màu sắc"
                                    fullWidth
                                    value={form.color}
                                    onChange={handleColorChange}
                                    error={!!errors.color}
                                    helperText={errors.color}
                                    placeholder="#2196f3"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white'
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontWeight: 500,
                                            color: '#424242'
                                        }
                                    }}
                                />
                                <Box
                                    component="input"
                                    type="color"
                                    value={form.color}
                                    onChange={handleColorChange}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        border: '2px solid #4caf50',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        padding: 0,
                                        backgroundColor: 'transparent',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {form.category === 'PLANT_POT' && (
                    <Box sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                    }}>
                        <Typography variant="h6" sx={DASHBOARD_STYLES.sectionTitle}>Kích cỡ chậu</Typography>
                        <Divider sx={{mb: 2}}/>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button variant="outlined" onClick={handleAddSize}>+ Thêm size</Button>
                        </Box>

                        {errors.sizes && (
                            <Typography variant="body2" color="error" sx={{ mb: 1 }}>{errors.sizes}</Typography>
                        )}

                        {(form.sizes || []).map((size, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                mb: 2,
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                backgroundColor: '#fafafa'
                            }}>
                                <TextField
                                    label="Tên size"
                                    value={size.name}
                                    onChange={(e) => handleUpdateSizeField(index, 'name', e.target.value)}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white'
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Giá (VNĐ)"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={size.price}
                                        onChange={(e) => handleUpdateSizeField(index, 'price', e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: 'white'
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Số lượng"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={size.availableQty}
                                        onChange={(e) => handleUpdateSizeField(index, 'availableQty', e.target.value)}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: 'white'
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Chiều cao chậu (cm)"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={size.potHeight}
                                        onChange={(e) => handleUpdateSizeField(index, 'potHeight', e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: 'white'
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Diện tích miệng chậu (cm²)"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={size.potUpperCrossSectionArea}
                                        onChange={(e) => handleUpdateSizeField(index, 'potUpperCrossSectionArea', e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end">cm²</InputAdornment> }}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: 'white'
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Khối lượng đất tối đa (gram)"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={size.maxSoilMassValue}
                                        onChange={(e) => handleUpdateSizeField(index, 'maxSoilMassValue', e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: 'white'
                                            }
                                        }}
                                    />
                                    <Button 
                                        color="error" 
                                        variant="outlined" 
                                        onClick={() => handleRemoveSize(index)}
                                        sx={{ minWidth: 'auto', px: 2, height: '56px' }}
                                    >
                                        Xóa
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {form.category === 'SOIL' && (
                    <>
                        <TextField
                            label="⚖️ Khối lượng có sẵn (gram)"
                            type="number"
                            slotProps={{
                                input: {min: 1}
                            }}
                            fullWidth
                            value={form.availableMassValue}
                            onChange={(e) => setForm(prev => ({...prev, availableMassValue: e.target.value}))}
                            error={!!errors.availableMassValue}
                            helperText={errors.availableMassValue}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'white',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4caf50',
                                        borderWidth: 2
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4caf50',
                                        borderWidth: 2
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    fontWeight: 500,
                                    color: '#424242'
                                }
                            }}
                            InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                mt: 2,
                                ...DASHBOARD_STYLES.sectionTitle,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            Giá cơ bản
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                            <Box>
                                <TextField
                                    label="Khối lượng (gram)"
                                    type="number"
                                    slotProps={{
                                        input: {min: 1}
                                    }}
                                    fullWidth
                                    value={form.basePricing.massValue}
                                    onChange={(e) => setForm(prev => ({
                                        ...prev,
                                        basePricing: {...prev.basePricing, massValue: e.target.value}
                                    }))}
                                    error={!!errors.basePricingMassValue}
                                    helperText={!!errors.basePricingMassValue ? errors.basePricingMassValue : (form.basePricing.massUnit === 'kg' ? 'Nhập theo kg' : 'Nhập theo gram')}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#4caf50',
                                                borderWidth: 2
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#4caf50',
                                                borderWidth: 2
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontWeight: 500,
                                            color: '#424242'
                                        }
                                    }}
                                    InputProps={{ endAdornment: <InputAdornment position="end">{form.basePricing.massUnit}</InputAdornment> }}
                                />
                            </Box>
                            <Box>
                                <FormControl
                                    fullWidth
                                    error={!!errors.basePricingMassUnit}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#4caf50',
                                                borderWidth: 2
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#4caf50',
                                                borderWidth: 2
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontWeight: 500,
                                            color: '#424242'
                                        }
                                    }}
                                >
                                    <InputLabel>Đơn vị</InputLabel>
                                    <Select
                                        value={form.basePricing.massUnit}
                                        onChange={(e) => setForm(prev => ({
                                            ...prev,
                                            basePricing: {...prev.basePricing, massUnit: e.target.value}
                                        }))}
                                    >
                                        <MenuItem value="gram">Gram</MenuItem>
                                        <MenuItem value="kg">Kilogram</MenuItem>
                                    </Select>
                                    {errors.basePricingMassUnit && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {errors.basePricingMassUnit}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>
                            <Box>
                                <TextField
                                    label="💰 Giá (VNĐ)"
                                    type="number"
                                    slotProps={{
                                        input: {min: 1}
                                    }}
                                    fullWidth
                                    value={form.basePricing.price}
                                    onChange={(e) => setForm(prev => ({
                                        ...prev,
                                        basePricing: {...prev.basePricing, price: e.target.value}
                                    }))}
                                    error={!!errors.basePricingPrice}
                                    helperText={errors.basePricingPrice}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#4caf50',
                                                borderWidth: 2
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#4caf50',
                                                borderWidth: 2
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontWeight: 500,
                                            color: '#424242'
                                        }
                                    }}
                                    InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                                />
                            </Box>
                        </Box>
                    </>
                )}

                <Box sx={{
                    p: 3,
                    mt: 1,
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="h6" sx={DASHBOARD_STYLES.sectionTitle}>Hình ảnh sản phẩm</Typography>
                    <Divider sx={{mb: 2}}/>
                <UploadImageField
                    imageUrl={form.image}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    onFileSelected={handleFileSelected}
                    errorText={errors.image}
                />
                </Box>
            </DialogContent>
            <DialogActions
                sx={{
                    p: 4,
                    backgroundColor: '#eff5ef',
                    borderTop: '1px solid #e0e0e0',
                    justifyContent: 'space-between'
                }}
            >
                <ActionButton
                    action={"cancel"}
                    onClick={onClose}
                />

                <ActionButton
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    variant="contained"
                    sx={{
                        ...DASHBOARD_STYLES.primaryButton,
                        px: 4,
                        py: 1.5,
                        '&:disabled': {
                            background: '#e0e0e0',
                            color: '#9e9e9e',
                            boxShadow: 'none'
                        }
                    }}
                >
                    {isSubmitting ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : (isEdit ? 'Cập nhật' : 'Tạo mới')}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
}


