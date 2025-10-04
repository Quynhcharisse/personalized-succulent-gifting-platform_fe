import React, {useEffect, useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Stack, Alert, Box} from '@mui/material';
import {updateSucculent} from '../../../services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import ActionButton from "../../buttonCustom/ActionButton.jsx";

const UpdateSucculentDialog = ({open, onClose, succulent, onUpdated}) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        quantity: '',
        priceSell: '',
        imageUrl: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({type: '', text: ''});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (open && succulent) {
            setForm({
                name: succulent.speciesName ?? '',
                description: succulent.description ?? '',
                quantity: succulent.quantity ?? '',
                priceSell: succulent.priceSell ?? '',
                imageUrl: succulent.imageUrl ?? ''
            });
            setMessage({type: '', text: ''});
        }
    }, [open, succulent]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async () => {
        setMessage({type: '', text: ''});
        // Basic validation
        if (!succulent?.id) {
            setMessage({type: 'error', text: 'Thiếu ID sản phẩm'});
            return;
        }
        try {
            setSubmitting(true);
            const requestBody = {
                id: Number(succulent.id),
                name: form.name,
                description: form.description,
                quantity: form.quantity === '' ? null : Number(form.quantity),
                priceSell: form.priceSell === '' ? null : Number(form.priceSell),
                imageUrl: form.imageUrl
            };

            const response = await updateSucculent(requestBody);
            const resData = response?.data;
            if (resData?.message) {
                setMessage({type: 'success', text: resData.message});
                // Refresh list in parent
                if (typeof onUpdated === 'function') onUpdated();
                // Close after short delay
                setTimeout(() => {
                    onClose && onClose();
                }, 800);
            } else {
                setMessage({type: 'error', text: 'Cập nhật thất bại'});
            }
        } catch (error) {
            const apiMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
            setMessage({type: 'error', text: apiMsg});
        } finally {
            setSubmitting(false);
        }
    };

    const handleFilePicked = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(0);
        setMessage({type: '', text: ''});
        try {
            const url = await uploadToCloudinary(file, {
                onProgress: (p) => setUploadProgress(p)
            });
            setForm(prev => ({...prev, imageUrl: url}));
            setMessage({type: 'success', text: 'Tải ảnh thành công'});
        } catch (err) {
            setMessage({type: 'error', text: 'Tải ảnh thất bại'});
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
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
            <DialogContent sx={{p: 3, pt: 5}}>
                {message.text && (
                    <Alert severity={message.type === 'success' ? 'success' : 'error'} sx={{mb: 2}}>
                        {message.text}
                    </Alert>
                )}
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <TextField
                        label="Tên sản phẩm"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        sx={{flex: '1 1 100%', mt: 2}}
                    />
                    <TextField
                        label="Mô tả"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        sx={{flex: '1 1 100%'}}
                        multiline
                        minRows={3}
                    />
                    <TextField
                        label="Số lượng"
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={handleChange}
                        sx={{flex: {xs: '1 1 100%', sm: '1 1 calc(50% - 8px)'}}}
                    />
                    <TextField
                        label="Giá bán"
                        name="priceSell"
                        type="number"
                        value={form.priceSell}
                        onChange={handleChange}
                        sx={{flex: {xs: '1 1 100%', sm: '1 1 calc(50% - 8px)'}}}
                    />
                    
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flex: '1 1 100%'}}>
                        <input type="file" accept="image/*" onChange={handleFilePicked} style={{display: 'none'}} id="update-succulent-upload" />
                        <label htmlFor="update-succulent-upload">
                            <Button component="span" variant="outlined" disabled={isUploading} sx={{borderRadius: 2, fontWeight: 600}}>
                                {isUploading ? `Đang tải... ${uploadProgress}%` : 'Tải ảnh lên'}
                            </Button>
                        </label>
                        {form.imageUrl && (
                            <Typography variant="body2" sx={{ml: 1, wordBreak: 'break-all', color: 'text.secondary'}}>
                                {form.imageUrl}
                            </Typography>
                        )}
                    </Box>
                    {succulent?.imageUrl && (
                        <img
                            src={form.imageUrl || succulent.imageUrl}
                            alt="preview"
                            style={{maxWidth: '100%', borderRadius: 8, border: '1px solid #eee'}}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{p: 3}}>
                <ActionButton
                    onClick={onClose}
                    type={"button"}
                    action={"close"}/>
                <ActionButton
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateSucculentDialog;


