import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import ButtonCancel from '../../buttonCustom/ButtonCancel.jsx';
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
        }
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({type: '', text: ''});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                sizes: []
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
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    py: 3,
                    textAlign: 'center'
                }}
            >
                Tạo Phụ Kiện Mới
            </DialogTitle>
            <DialogContent sx={{p: 4, backgroundColor: '#fafafa'}}>
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

                {/* Danh mục - Đưa lên đầu */}
                <FormControl
                    fullWidth
                    error={!!errors.category}
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
                                    {c.value === 'PLANT_POT'}
                                    {c.value === 'SOIL'}
                                    {c.value === 'DECOR_ACCESSORY'}
                                    {c.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Tên phụ kiện"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm(prev => ({...prev, name: e.target.value}))}
                    error={!!errors.name}
                    helperText={errors.name}
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
                />
                <TextField
                    label="Mô tả chi tiết"
                    fullWidth
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
                    error={!!errors.description}
                    helperText={errors.description}
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
                />
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
                        />
                    </>
                )}

                {form.category === 'PLANT_POT' && (
                    <Grid container spacing={3} sx={{mb: 3}}>
                        <Grid item xs={6}>
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
                        </Grid>
                        <Grid item xs={6}>
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
                        </Grid>
                    </Grid>
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
                        <Grid container spacing={3} sx={{mb: 3}}>
                            <Grid item xs={4}>
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
                                    helperText={errors.basePricingMassValue}
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
                            </Grid>
                            <Grid item xs={4}>
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
                            </Grid>
                            <Grid item xs={4}>
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
                                />
                            </Grid>
                        </Grid>
                    </>
                )}

                <UploadImageField
                    imageUrl={form.imageUrl}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    onFileSelected={handleFileSelected}
                    errorText={errors.imageUrl}
                />
            </DialogContent>
            <DialogActions
                sx={{
                    p: 4,
                    backgroundColor: '#f5f5f5',
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


