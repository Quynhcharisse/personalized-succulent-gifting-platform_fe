import React, {useEffect, useState} from 'react';
import {Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import {updateAccessory} from '../../../services/ProductService.jsx';

export default function UpdateAccessoryDialog({ open, onClose, accessory, onUpdated }) {
    const [form, setForm] = useState({
        id: '',
        name: '',
        description: '',
        quantity: '',
        category: '',
        priceSell: '',
        imageUrl: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && accessory) {
            setForm({
                id: accessory.id ?? '',
                name: accessory.name ?? '',
                description: accessory.description ?? '',
                quantity: accessory.quantity ?? '',
                category: accessory.category ?? '',
                priceSell: accessory.priceSell ?? '',
                imageUrl: accessory.imageUrl ?? ''
            });
            setMessage({ type: '', text: '' });
        }
    }, [open, accessory]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Tên là bắt buộc';
        if (!form.description.trim()) errs.description = 'Mô tả là bắt buộc';
        if (!form.category) errs.category = 'Danh mục là bắt buộc';
        if (!form.priceSell || Number(form.priceSell) <= 0) errs.priceSell = 'Giá bán > 0';
        if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Số lượng > 0';
        if (!form.imageUrl.trim()) errs.imageUrl = 'Hình ảnh là bắt buộc';
        return errs;
    };

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setMessage({ type: '', text: '' });
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length > 0) return;
        setSubmitting(true);
        try {
            const payload = {
                id: Number(form.id),
                name: form.name.trim(),
                description: form.description.trim(),
                quantity: Number(form.quantity),
                category: form.category,
                priceSell: Number(form.priceSell),
                imageUrl: form.imageUrl.trim()
            };
            const res = await updateAccessory(payload);
            const msg = res?.data?.message || 'Cập nhật phụ kiện thành công';
            setMessage({ type: 'success', text: msg });
            if (typeof onUpdated === 'function') onUpdated();
            setTimeout(() => onClose && onClose(), 700);
        } catch (e) {
            const apiMsg = e?.response?.data?.message || 'Cập nhật thất bại';
            setMessage({ type: 'error', text: apiMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const CATEGORIES = [
        { value: 'CHAU', label: 'Chậu' },
        { value: 'DAT', label: 'Đất' },
        { value: 'PHAN', label: 'Phân' },
        { value: 'DUNG_CU', label: 'Dụng cụ' }
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle>Cập Nhật Phụ Kiện</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {message.text && (
                    <Alert severity={message.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}
                <TextField
                    label="Tên phụ kiện"
                    name="name"
                    fullWidth
                    value={form.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mt: 1, mb: 2 }}
                />
                <TextField
                    label="Mô tả"
                    name="description"
                    fullWidth
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    sx={{ mb: 2 }}
                />
                <FormControl fullWidth error={!!errors.category} sx={{ mb: 2 }}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                        label="Danh mục"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        {CATEGORIES.map(c => (
                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Giá bán (VNĐ)"
                    name="priceSell"
                    type="number"
                    inputProps={{ min: 1 }}
                    fullWidth
                    value={form.priceSell}
                    onChange={handleChange}
                    error={!!errors.priceSell}
                    helperText={errors.priceSell}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Số lượng"
                    name="quantity"
                    type="number"
                    inputProps={{ min: 1 }}
                    fullWidth
                    value={form.quantity}
                    onChange={handleChange}
                    error={!!errors.quantity}
                    helperText={errors.quantity}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Image URL"
                    name="imageUrl"
                    fullWidth
                    value={form.imageUrl}
                    onChange={handleChange}
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined">Đóng</Button>
                <Button onClick={handleSubmit} disabled={submitting} variant="contained">
                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


