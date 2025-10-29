import React, {useEffect, useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Stack, Alert, Box, FormControl, InputLabel, Select, MenuItem, Chip, Card, Divider} from '@mui/material';
import {updateSucculent} from '../../../services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import {FENGSHUI, ZODIACS, DASHBOARD_STYLES} from '../../constants.js';

const UpdateSucculentDialog = ({open, onClose, succulent, onUpdated}) => {
    const [form, setForm] = useState({
        speciesName: '',
        description: '',
        imageUrl: '',
        fengShuiList: [],
        zodiacList: [],
        sizeList: [] // { sizeName, price, quantity }
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({type: '', text: ''});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (open && succulent) {
            const initialSizes = (succulent.size && typeof succulent.size === 'object')
                ? Object.entries(succulent.size).map(([key, val]) => ({
                    sizeName: key,
                    price: val?.price ?? '',
                    quantity: val?.quantity ?? '',
                    minArea: val?.minArea ?? '',
                    maxArea: val?.maxArea ?? ''
                }))
                : Array.isArray(succulent.sizeList)
                    ? succulent.sizeList.map(s => ({
                        sizeName: s.sizeName || s.name || '',
                        price: s.price ?? s.priceSell ?? '',
                        quantity: s.quantity ?? '',
                        minArea: s.minArea ?? '',
                        maxArea: s.maxArea ?? ''
                    }))
                    : [];

            setForm({
                speciesName: succulent.speciesName ?? '',
                description: succulent.description ?? '',
                imageUrl: succulent.imageUrl ?? '',
                fengShuiList: succulent.fengShuiElements || [],
                zodiacList: succulent.zodiacs || [],
                sizeList: initialSizes.length > 0 ? initialSizes : [{ sizeName: '', price: '', quantity: '' }]
            });
            setMessage({type: '', text: ''});
        }
    }, [open, succulent]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const currentSizeKeys = (() => {
        if (!succulent?.size || typeof succulent.size !== 'object') return new Set();
        return new Set(Object.keys(succulent.size).map(k => String(k).trim().toLowerCase()));
    })();

    const validate = () => {
        const errors = {};
        const name = (form.speciesName || '').trim();
        const desc = (form.description || '').trim();
        const url = (form.imageUrl || '').trim();
        if (!name) errors.speciesName = 'Tên loài là bắt buộc';
        else if (name.length > 100) errors.speciesName = 'Tên loài không được vượt quá 100 ký tự';
        if (!desc) errors.description = 'Mô tả là bắt buộc';
        if (!url) errors.imageUrl = 'Image URL is required';
        else if (!/^(http|https):\/\//i.test(url)) errors.imageUrl = 'Invalid Image URL format';
        else if (!/\.(jpg|jpeg|png|gif)$/i.test(url)) errors.imageUrl = 'Image URL must end with a valid image file extension (jpg, jpeg, png, gif)';

        const sizes = form.sizeList || [];
        if (sizes.length === 0) errors.sizeList = 'Vui lòng chọn ít nhất một kích thước';
        if (sizes.length > 5) errors.sizeList = 'Hệ thống chỉ có tối đa 5 kích thước';
        const seen = new Set();
        sizes.forEach((s, i) => {
            const raw = s.sizeName;
            if (!raw || !String(raw).trim()) {
                errors[`size_${i}_name`] = 'Tên kích thước là bắt buộc';
            } else {
                const key = String(raw).trim().toLowerCase();
                if (seen.has(key)) {
                    errors[`size_${i}_name`] = `Kích thước '${s.sizeName}' bị trùng lặp trong yêu cầu cập nhật`;
                } else {
                    seen.add(key);
                    if (!currentSizeKeys.has(key)) {
                        errors[`size_${i}_name`] = `Kích thước '${s.sizeName}' không tồn tại trong hệ thống`;
                    }
                }
            }
            if (s.price === '' || Number(s.price) <= 0) errors[`size_${i}_price`] = 'Cần nhập giá bán lớn hơn 0';
            if (s.quantity === '' || Number(s.quantity) < 0) errors[`size_${i}_quantity`] = 'Số lượng cây không được là số âm';
        });
        return errors;
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
            const err = validate();
            if (Object.keys(err).length > 0) {
                setMessage({type: 'error', text: Object.values(err)[0]});
                setSubmitting(false);
                return;
            }
            const requestBody = {
                id: Number(succulent.id),
                speciesName: form.speciesName.trim(),
                description: form.description.trim(),
                imageUrl: form.imageUrl.trim(),
                fengShuiList: form.fengShuiList,
                zodiacList: form.zodiacList,
                sizeList: (form.sizeList || []).map(s => ({
                    sizeName: String(s.sizeName).trim().toLowerCase(),
                    price: Number(s.price),
                    quantity: Number(s.quantity),
                    minArea: Number(s.minArea) || 0,
                    maxArea: Number(s.maxArea) || 0
                }))
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
                    sx: DASHBOARD_STYLES.dialog
                }
            }}
        >
            <DialogTitle sx={DASHBOARD_STYLES.dialogTitle}>
                Cập Nhật Sản Phẩm
            </DialogTitle>
            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {message.text && (
                    <Alert severity={message.type === 'success' ? 'success' : 'error'} sx={{mb: 3, borderRadius: 2}}>
                        {message.text}
                    </Alert>
                )}

                {/* Basic Information */}
                <Card sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    border: '1px solid rgba(11, 63, 49, 0.15)'
                }}>
                    <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                        Thông tin cơ bản
                    </Typography>
                    <Divider sx={{mb: 3}}/>
                    
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <TextField
                            label="Tên loài"
                            name="speciesName"
                            value={form.speciesName}
                            onChange={handleChange}
                            sx={DASHBOARD_STYLES.formField}
                        />
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            multiline
                            minRows={3}
                            sx={DASHBOARD_STYLES.formField}
                        />
                    </Box>
                </Card>

                {/* Attributes */}
                <Card sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    border: '1px solid rgba(11, 63, 49, 0.15)'
                }}>
                    <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                        Thuộc tính đặc biệt
                    </Typography>
                    <Divider sx={{mb: 3}}/>
                    
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <FormControl fullWidth>
                            <InputLabel>Phong Thủy</InputLabel>
                            <Select
                                multiple
                                label="Phong Thủy"
                                value={form.fengShuiList}
                                onChange={(e) => setForm(prev => ({...prev, fengShuiList: e.target.value}))}
                                renderValue={(selected) => (
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                        {selected.map((val) => (
                                            <Chip key={val} label={FENGSHUI.find(opt => opt.value === val)?.label || val} size="small"/>
                                        ))}
                                    </Box>
                                )}
                                sx={DASHBOARD_STYLES.formField}
                            >
                                {FENGSHUI.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Cung Hoàng Đạo</InputLabel>
                            <Select
                                multiple
                                label="Cung Hoàng Đạo"
                                value={form.zodiacList}
                                onChange={(e) => setForm(prev => ({...prev, zodiacList: e.target.value}))}
                                renderValue={(selected) => (
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                        {selected.map((val) => (
                                            <Chip key={val} label={ZODIACS.find(opt => opt.value === val)?.label || val} size="small"/>
                                        ))}
                                    </Box>
                                )}
                                sx={DASHBOARD_STYLES.formField}
                            >
                                {ZODIACS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Card>

                {/* Size Configuration */}
                <Card sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    border: '1px solid rgba(11, 63, 49, 0.15)'
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#0b3f31'}}>
                            🌱 Cấu hình kích thước
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => setForm(prev => ({
                                ...prev,
                                sizeList: (prev.sizeList || []).length >= Math.min(5, currentSizeKeys.size)
                                    ? prev.sizeList
                                    : [...prev.sizeList, { sizeName: '', price: '', quantity: '', minArea: '', maxArea: '' }]
                            }))}
                            sx={{
                                borderColor: '#0b3f31',
                                color: '#0b3f31',
                                '&:hover': {
                                    borderColor: '#0b3f31',
                                    backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                }
                            }}
                        >
                            Thêm kích thước
                        </Button>
                    </Box>
                    <Divider sx={{mb: 3}}/>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {form.sizeList.map((s, idx) => {
                            const usedKeys = new Set((form.sizeList || []).map((x, xIdx) => xIdx === idx ? null : String(x.sizeName || '').trim().toLowerCase()));
                            const options = Array.from(currentSizeKeys).filter((k) => !usedKeys.has(k));
                            const currentValue = String(s.sizeName || '').trim().toLowerCase();
                            if (currentValue && !options.includes(currentValue)) options.unshift(currentValue);
                            
                            return (
                                <Card key={idx} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fffe',
                                    borderRadius: 2,
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    position: 'relative'
                                }}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                            Kích thước #{idx + 1}
                                        </Typography>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => {
                                                const list = [...form.sizeList];
                                                list.splice(idx, 1);
                                                setForm(prev => ({...prev, sizeList: list.length ? list : [{ sizeName: '', price: '', quantity: '', minArea: '', maxArea: '' }]}));
                                            }}
                                            sx={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                                }
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                    </Box>

                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                        <FormControl fullWidth>
                                            <InputLabel>Tên kích thước</InputLabel>
                                            <Select
                                                label="Tên kích thước"
                                                value={s.sizeName || ''}
                                                onChange={(e) => {
                                                    const list = [...form.sizeList];
                                                    list[idx] = {...list[idx], sizeName: e.target.value};
                                                    setForm(prev => ({...prev, sizeList: list}));
                                                }}
                                                sx={DASHBOARD_STYLES.formField}
                                            >
                                                {options.map((opt) => (
                                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <TextField
                                                fullWidth
                                                label="Giá bán (₫)"
                                                type="number"
                                                value={s.price}
                                                onChange={(e) => {
                                                    const list = [...form.sizeList];
                                                    list[idx] = {...list[idx], price: e.target.value};
                                                    setForm(prev => ({...prev, sizeList: list}));
                                                }}
                                                sx={DASHBOARD_STYLES.formField}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Số lượng"
                                                type="number"
                                                value={s.quantity}
                                                onChange={(e) => {
                                                    const list = [...form.sizeList];
                                                    list[idx] = {...list[idx], quantity: e.target.value};
                                                    setForm(prev => ({...prev, sizeList: list}));
                                                }}
                                                sx={DASHBOARD_STYLES.formField}
                                            />
                                        </Box>

                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <TextField
                                                fullWidth
                                                label="Diện tích tối thiểu (m²)"
                                                type="number"
                                                value={s.minArea || ''}
                                                onChange={(e) => {
                                                    const list = [...form.sizeList];
                                                    list[idx] = {...list[idx], minArea: e.target.value};
                                                    setForm(prev => ({...prev, sizeList: list}));
                                                }}
                                                sx={DASHBOARD_STYLES.formField}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Diện tích tối đa (m²)"
                                                type="number"
                                                value={s.maxArea || ''}
                                                onChange={(e) => {
                                                    const list = [...form.sizeList];
                                                    list[idx] = {...list[idx], maxArea: e.target.value};
                                                    setForm(prev => ({...prev, sizeList: list}));
                                                }}
                                                sx={DASHBOARD_STYLES.formField}
                                            />
                                        </Box>
                                    </Box>
                                </Card>
                            );
                        })}
                    </Box>
                </Card>

                {/* Image Upload */}
                <Card sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    border: '1px solid rgba(11, 63, 49, 0.15)'
                }}>
                    <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                        📸 Hình ảnh sản phẩm
                    </Typography>
                    <Divider sx={{mb: 3}}/>
                    
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <input type="file" accept="image/*" onChange={handleFilePicked} style={{display: 'none'}} id="update-succulent-upload" />
                            <label htmlFor="update-succulent-upload">
                                <Button 
                                    component="span" 
                                    variant="outlined" 
                                    disabled={isUploading} 
                                    sx={{
                                        borderRadius: 2, 
                                        fontWeight: 600,
                                        borderColor: '#0b3f31',
                                        color: '#0b3f31',
                                        '&:hover': {
                                            borderColor: '#0b3f31',
                                            backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                        }
                                    }}
                                >
                                    {isUploading ? `Đang tải... ${uploadProgress}%` : 'Chọn hình ảnh'}
                                </Button>
                            </label>
                            {isUploading && (
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    Tiến độ: {uploadProgress}%
                                </Typography>
                            )}
                        </Box>

                        {(form.imageUrl || succulent?.imageUrl) && (
                            <Box sx={{
                                border: '2px solid rgba(11, 63, 49, 0.2)',
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: '#f8fffe'
                            }}>
                                <img
                                    src={form.imageUrl || succulent.imageUrl}
                                    alt="preview"
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            </Box>
                        )}

                        {form.imageUrl && (
                            <Box sx={{
                                p: 2,
                                backgroundColor: '#f0fff6',
                                borderRadius: 2,
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}>
                                <Typography variant="body2" sx={{color: 'text.secondary', mb: 1}}>
                                    URL hình ảnh:
                                </Typography>
                                <Typography variant="body2" sx={{wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem'}}>
                                    {form.imageUrl}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Card>
            </DialogContent>
            <DialogActions sx={{p: 3}}>
                <ActionButton
                    onClick={onClose}
                    type={"button"}
                    action={"close"}/>
                <ActionButton
                    onClick={handleSubmit}
                    disabled={submitting}
                    action={"update"}
                    type={"submit"}
                >
                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateSucculentDialog;


