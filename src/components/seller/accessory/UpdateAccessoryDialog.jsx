import React, {useEffect, useState} from 'react';
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
import UploadImageField from '../succulent/UploadImageField.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import {createDecorationAccessory, createPotAccessory, createSoilAccessory} from '../../../services/ProductService.jsx';
import ButtonCancel from "../../buttonCustom/ButtonCancel.jsx";

export default function UpdateAccessoryDialog({open, onClose, onUpdate, accessoryData}) {
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

    // Populate form when accessoryData changes
    useEffect(() => {
        if (accessoryData && open) {
            setForm({
                name: accessoryData.name || '',
                description: accessoryData.description || '',
                category: accessoryData.category || '',
                priceSell: accessoryData.priceSell || accessoryData.price || '',
                quantity: accessoryData.quantity || accessoryData.availableQty || '',
                imageUrl: accessoryData.imageUrl || accessoryData.images?.[0]?.image || '',
                material: accessoryData.material || '',
                color: accessoryData.color || '',
                availableMassValue: accessoryData.availableMassValue || '',
                basePricing: {
                    massValue: accessoryData.basePricing?.massValue || '',
                    massUnit: accessoryData.basePricing?.massUnit || 'gram',
                    price: accessoryData.basePricing?.price || ''
                }
            });
        }
    }, [accessoryData, open]);

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

    const createDecorationPayload = () => {
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

    const createPotPayload = () => {
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

    const createSoilPayload = () => {
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

    const handleUpdate = async () => {
        setMessage({type: '', text: ''});
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            let response;
            let payload;

            switch (form.category) {
                case 'DECOR_ACCESSORY':
                    payload = createDecorationPayload();
                    response = await createDecorationAccessory(payload);
                    break;
                case 'PLANT_POT':
                    payload = createPotPayload();
                    response = await createPotAccessory(payload);
                    break;
                case 'SOIL':
                    payload = createSoilPayload();
                    response = await createSoilAccessory(payload);
                    break;
                default:
                    throw new Error('Loại phụ kiện không hợp lệ');
            }

            if (response && response.status === 200) {
                setMessage({type: 'success', text: 'Cập nhật phụ kiện thành công!'});
                setTimeout(() => {
                    onClose();
                    onUpdate && onUpdate();
                }, 1500);
            } else {
                setMessage({type: 'error', text: 'Cập nhật phụ kiện thất bại'});
            }
        } catch (error) {
            console.error('Error updating accessory:', error);
            setMessage({type: 'error', text: 'Có lỗi xảy ra khi cập nhật phụ kiện'});
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                slotProps={{paper: {sx: {borderRadius: 3}}}}>
            <DialogTitle>Cập nhật Phụ Kiện</DialogTitle>
            <DialogContent sx={{pt: 3}}>
                {message.text && (
                    <Alert severity={message.type === 'error' ? 'error' : 'info'} sx={{mb: 2}}>
                        {message.text}
                    </Alert>
                )}
                <TextField
                    label="Tên phụ kiện"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm(prev => ({...prev, name: e.target.value}))}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{mt: 1, mb: 2}}
                />
                <TextField
                    label="Mô tả"
                    fullWidth
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
                    error={!!errors.description}
                    helperText={errors.description}
                    sx={{mb: 2}}
                />
                <FormControl fullWidth error={!!errors.category} sx={{mb: 2}}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                        label="Danh mục"
                        value={form.category}
                        onChange={(e) => setForm(prev => ({...prev, category: e.target.value}))}
                    >
                        {CATEGORIES.map(c => (
                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Conditional fields based on category */}
                {form.category === 'DECOR_ACCESSORY' && (
                    <>
                        <TextField
                            label="Giá bán (VNĐ)"
                            type="number"
                            slotProps={{
                                input: {min: 1}
                            }}
                            fullWidth
                            value={form.priceSell}
                            onChange={(e) => setForm(prev => ({...prev, priceSell: e.target.value}))}
                            error={!!errors.priceSell}
                            helperText={errors.priceSell}
                            sx={{mb: 2}}
                        />
                        <TextField
                            label="Số lượng"
                            type="number"
                            slotProps={{
                                input: {min: 1}
                            }}
                            fullWidth
                            value={form.quantity}
                            onChange={(e) => setForm(prev => ({...prev, quantity: e.target.value}))}
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            sx={{mb: 2}}
                        />
                    </>
                )}

                {form.category === 'PLANT_POT' && (
                    <Grid container spacing={2} sx={{mb: 2}}>
                        <Grid item xs={6}>
                            <TextField
                                label="Chất liệu"
                                fullWidth
                                value={form.material}
                                onChange={(e) => setForm(prev => ({...prev, material: e.target.value}))}
                                error={!!errors.material}
                                helperText={errors.material}
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
                                />
                                <Box
                                    component="input"
                                    type="color"
                                    value={form.color}
                                    onChange={handleColorChange}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        border: '1px solid #ccc',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        padding: 0,
                                        backgroundColor: 'transparent'
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                )}

                {form.category === 'SOIL' && (
                    <>
                        <TextField
                            label="Khối lượng có sẵn (gram)"
                            type="number"
                            slotProps={{
                                input: {min: 1}
                            }}
                            fullWidth
                            value={form.availableMassValue}
                            onChange={(e) => setForm(prev => ({...prev, availableMassValue: e.target.value}))}
                            error={!!errors.availableMassValue}
                            helperText={errors.availableMassValue}
                            sx={{mb: 2}}
                        />
                        <Typography variant="subtitle2" sx={{mb: 1, mt: 2}}>Giá cơ bản</Typography>
                        <Grid container spacing={2} sx={{mb: 2}}>
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
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
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
                                    label="Giá (VNĐ)"
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
            <DialogActions sx={{p: 3}}>
                <ButtonCancel/>
                <Button onClick={handleUpdate} disabled={isSubmitting} variant="contained">
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
