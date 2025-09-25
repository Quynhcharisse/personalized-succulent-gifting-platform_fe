import React, {useState} from 'react';
import {Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import UploadImageField from '../succulent/UploadImageField.jsx';
import uploadToCloudinary from '../succulent/cloudinaryUpload.js';

export default function CreateAccessoryDialog({ open, onClose, onCreate }) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        priceSell: '',
        quantity: '',
        imageUrl: ''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Tên là bắt buộc';
        if (!form.description.trim()) e.description = 'Mô tả là bắt buộc';
        if (!form.category) e.category = 'Danh mục là bắt buộc';
        if (!form.priceSell || Number(form.priceSell) <= 0) e.priceSell = 'Giá bán > 0';
        if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Số lượng > 0';
        if (!form.imageUrl.trim()) e.imageUrl = 'Hình ảnh là bắt buộc';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCreate = async () => {
        setMessage({ type: '', text: '' });
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onCreate({
                name: form.name.trim(),
                description: form.description.trim(),
                category: form.category,
                priceSell: Number(form.priceSell),
                quantity: Number(form.quantity),
                imageUrl: form.imageUrl.trim()
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(0);
        setMessage({ type: '', text: '' });
        try {
            const url = await uploadToCloudinary(file, { onProgress: (p) => setUploadProgress(p) });
            setForm(prev => ({ ...prev, imageUrl: url }));
        } catch (e) {
            setMessage({ type: 'error', text: 'Tải ảnh thất bại' });
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const CATEGORIES = [
        { value: 'PLANT_POT', label: 'Chậu cây' },
        { value: 'SOIL', label: 'Đất trồng' },
        { value: 'DECOR_ACCESSORY', label: 'Phụ kiện trang trí' } 
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle>Tạo Phụ Kiện</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {message.text && (
                    <Alert severity={message.type === 'error' ? 'error' : 'info'} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}
                <TextField
                    label="Tên phụ kiện"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mt: 1, mb: 2 }}
                />
                <TextField
                    label="Mô tả"
                    fullWidth
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    error={!!errors.description}
                    helperText={errors.description}
                    sx={{ mb: 2 }}
                />
                <FormControl fullWidth error={!!errors.category} sx={{ mb: 2 }}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                        label="Danh mục"
                        value={form.category}
                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                        {CATEGORIES.map(c => (
                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Giá bán (VNĐ)"
                    type="number"
                    inputProps={{ min: 1 }}
                    fullWidth
                    value={form.priceSell}
                    onChange={(e) => setForm(prev => ({ ...prev, priceSell: e.target.value }))}
                    error={!!errors.priceSell}
                    helperText={errors.priceSell}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Số lượng"
                    type="number"
                    inputProps={{ min: 1 }}
                    fullWidth
                    value={form.quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                    error={!!errors.quantity}
                    helperText={errors.quantity}
                    sx={{ mb: 2 }}
                />

                <UploadImageField
                    imageUrl={form.imageUrl}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    onFileSelected={handleFileSelected}
                    errorText={errors.imageUrl}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined">Hủy</Button>
                <Button onClick={handleCreate} disabled={isSubmitting} variant="contained">
                    {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


