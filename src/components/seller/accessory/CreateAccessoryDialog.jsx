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

export default function CreateAccessoryDialog({open, onClose, onCreate}) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        priceSell: '',
        quantity: '',
        imageUrl: '',
        material: '',
        color: '#2196f3',
        availableMassValue: '',
        basePricing: {
            massValue: '',
            massUnit: 'gram',
            price: ''
        },
        sizes: []
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({type: '', text: ''});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddSize = () => {
        setForm(prev => ({
            ...prev,
            sizes: [
                ...prev.sizes,
                {
                    name: '',
                    potHeight: '',
                    potUpperCrossSectionArea: '',
                    maxSoilMassValue: '',
                    price: '',
                    availableQty: ''
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
        if (!form.name.trim()) e.name = 'Tên là bắt buộc';
        if (!form.description.trim()) e.description = 'Mô tả là bắt buộc';
        if (!form.category) e.category = 'Danh mục là bắt buộc';
        if (!form.imageUrl.trim()) e.imageUrl = 'Hình ảnh là bắt buộc';

        // Common validations
        if (form.category === 'DECOR_ACCESSORY') {
            if (!form.priceSell || Number(form.priceSell) <= 0) e.priceSell = 'Giá bán > 0';
            if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Số lượng > 0';
        }

        // Pot specific validations
        if (form.category === 'PLANT_POT') {
            if (!form.material.trim()) e.material = 'Chất liệu là bắt buộc';
            if (!form.color || !form.color.match(/^#[0-9A-F]{6}$/i)) e.color = 'Màu sắc là bắt buộc';
            if (!form.sizes || form.sizes.length === 0) {
                e.sizes = 'Thêm ít nhất 1 kích cỡ chậu';
            } else {
                const invalid = form.sizes.some(s =>
                    !s.name?.trim() ||
                    !s.potHeight || Number(s.potHeight) <= 0 ||
                    !s.potUpperCrossSectionArea || Number(s.potUpperCrossSectionArea) <= 0 ||
                    !s.maxSoilMassValue || Number(s.maxSoilMassValue) <= 0 ||
                    !s.price || Number(s.price) <= 0 ||
                    !s.availableQty || Number(s.availableQty) <= 0
                );
                if (invalid) e.sizes = 'Điền đầy đủ và hợp lệ cho tất cả trường size';
            }
        }

        // Soil specific validations
        if (form.category === 'SOIL') {
            if (!form.availableMassValue || Number(form.availableMassValue) <= 0) e.availableMassValue = 'Khối lượng có sẵn > 0';
            if (!form.basePricing.massValue || Number(form.basePricing.massValue) <= 0) e.basePricingMassValue = 'Khối lượng cơ bản > 0';
            if (!form.basePricing.price || Number(form.basePricing.price) <= 0) e.basePricingPrice = 'Giá cơ bản > 0';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const createDecorationData = () => {
        return {
            createPot: false,
            potData: null,
            createSoil: false,
            soilData: null,
            createDecoration: true,
            decorationData: {
                name: form.name.trim(),
                description: form.description.trim(),
                price: Number(form.priceSell),
                availableQty: Number(form.quantity),
                images: form.imageUrl ? [{image: form.imageUrl.trim()}] : []
            }
        };
    }

    const createPotData = () => {
        return {
            createPot: true,
            potData: {
                name: form.name.trim(),
                description: form.description.trim(),
                material: form.material.trim(),
                color: form.color,
                images: form.imageUrl ? [{image: form.imageUrl.trim()}] : [],
                sizes: (form.sizes || []).map(s => ({
                    name: s.name.trim(),
                    potHeight: Number(s.potHeight),
                    potUpperCrossSectionArea: Number(s.potUpperCrossSectionArea),
                    maxSoilMassValue: Number(s.maxSoilMassValue),
                    price: Number(s.price),
                    availableQty: Number(s.availableQty)
                }))
            },
            createSoil: false,
            soilData: null,
            createDecoration: false,
            decorationData: null
        };
    }

    const createSoilData = () => {
        return {
            createPot: false,
            potData: null,
            createSoil: true,
            soilData: {
                name: form.name.trim(),
                description: form.description.trim(),
                availableMassValue: Number(form.availableMassValue),
                basePricing: {
                    massValue: Number(form.basePricing.massValue),
                    massUnit: form.basePricing.massUnit,
                    price: Number(form.basePricing.price)
                },
                images: form.imageUrl ? [{image: form.imageUrl.trim()}] : []
            },
            createDecoration: false,
            decorationData: null
        };
    }

    const handleCreate = async () => {
        setMessage({type: '', text: ''});
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            let response;
            let accessoryData;

            switch (form.category) {
                case 'DECOR_ACCESSORY':
                    accessoryData = createDecorationData();
                    response = await createDecorationAccessory(accessoryData);
                    break;
                case 'PLANT_POT':
                    accessoryData = createPotData();
                    response = await createPotAccessory(accessoryData);
                    break;
                case 'SOIL':
                    accessoryData = createSoilData();
                    response = await createSoilAccessory(accessoryData);
                    break;
                default:
                    throw new Error('Loại phụ kiện không hợp lệ');
            }

            if (response && response.status === 200) {
                setMessage({type: 'success', text: 'Tạo phụ kiện thành công!'});
                setTimeout(() => {
                    onClose();
                    onCreate && onCreate();
                }, 1500);
            } else {
                setMessage({type: 'error', text: 'Tạo phụ kiện thất bại'});
            }
        } catch (error) {
            console.error('Error creating accessory:', error);
            setMessage({type: 'error', text: 'Có lỗi xảy ra khi tạo phụ kiện'});
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
            const url = await uploadToCloudinary(file, {onProgress: (p) => setUploadProgress(p)});
            setForm(prev => ({...prev, imageUrl: url}));
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
                    sx: {
                        borderRadius: 8,
                        boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    py: 3,
                    textAlign: 'center'
                }}
            >
                Tạo Phụ Kiện Mới
                <Typography variant="body2" sx={{opacity: 0.9, mt: 0.5, fontWeight: 400}}>
                    Thiết lập thông tin và đăng bán nhanh chóng
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{p: 4, backgroundColor: '#f7faf7'}}>
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

                <Box sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    marginTop: 5
                }}>
                    <Typography variant="h6" sx={{fontWeight: 600, color: '#2e7d32', mb: 1}}>Thông tin cơ bản</Typography>
                    <Divider sx={{mb: 2}}/>

                    {/* Danh mục - Đưa lên đầu */}
                    <FormControl
                        fullWidth
                        error={!!errors.category}
                        sx={{
                            mb: 2,
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
                        <Typography variant="h6" sx={{fontWeight: 600, color: '#2e7d32', mb: 1}}>Kích cỡ chậu</Typography>
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
                                mb: 2
                            }}>
                                <TextField
                                    label="Tên size"
                                    value={size.name}
                                    onChange={(e) => handleUpdateSizeField(index, 'name', e.target.value)}
                                />
                                <TextField
                                    label="Chiều cao (cm)"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    value={size.potHeight}
                                    onChange={(e) => handleUpdateSizeField(index, 'potHeight', e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                                />
                                <TextField
                                    label="Tiết diện miệng (cm²)"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    value={size.potUpperCrossSectionArea}
                                    onChange={(e) => handleUpdateSizeField(index, 'potUpperCrossSectionArea', e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end">cm²</InputAdornment> }}
                                />
                                <TextField
                                    label="Đất tối đa (g)"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    value={size.maxSoilMassValue}
                                    onChange={(e) => handleUpdateSizeField(index, 'maxSoilMassValue', e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                                />
                                <TextField
                                    label="Giá (VNĐ)"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    value={size.price}
                                    onChange={(e) => handleUpdateSizeField(index, 'price', e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                                />
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        label="Số lượng"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={size.availableQty}
                                        onChange={(e) => handleUpdateSizeField(index, 'availableQty', e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <Button color="error" variant="text" onClick={() => handleRemoveSize(index)}>Xóa</Button>
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
                                color: '#4caf50',
                                fontWeight: 600,
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
                    <Typography variant="h6" sx={{fontWeight: 600, color: '#2e7d32', mb: 1}}>Hình ảnh sản phẩm</Typography>
                    <Divider sx={{mb: 2}}/>
                    <UploadImageField
                        imageUrl={form.imageUrl}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        onFileSelected={handleFileSelected}
                        errorText={errors.imageUrl}
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
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #388e3c 0%, #4caf50 100%)',
                            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                            background: '#e0e0e0',
                            color: '#9e9e9e',
                            boxShadow: 'none'
                        }
                    }}
                >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
}


