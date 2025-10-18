import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Article as ArticleIcon } from '@mui/icons-material';
import {viewProduct} from '../../../services/ProductService.jsx';
import { DASHBOARD_STYLES } from '../../constants.js';

const STATUS_OPTIONS = [
    {value: 'DRAFT', label: 'Draft'},
    {value: 'PUBLISHED', label: 'Published'},
    {value: 'ARCHIVED', label: 'Archived'}
];

const PostDialog = ({open, onClose, onCreated}) => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        productId: '',
        status: 'DRAFT',
        tags: ''
    });

    useEffect(() => {
        if (open) {
            viewProduct().then(res => setProducts(res?.data?.data || []));
            setForm({
                title: '',
                description: '',
                productId: '',
                status: 'DRAFT',
                tags: ''
            });
        }
    }, [open]);

    const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

    const handleSubmit = () => {
        // Prepare tags as array
        const submitData = {
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
        };
        // Call createPost API here with submitData, then:
        onCreated && onCreated();
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
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
                justifyContent: 'center'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <ArticleIcon sx={{fontSize: '2rem'}}/>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Tạo Bài Viết Mới
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                <Box sx={DASHBOARD_STYLES.formSection}>
                    <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                        Thông tin cơ bản
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <TextField
                            label="Tiêu đề"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={DASHBOARD_STYLES.formField}
                        />
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            minRows={3}
                            required
                            sx={DASHBOARD_STYLES.formField}
                        />
                    </Box>
                </Box>

                <Box sx={DASHBOARD_STYLES.formSection}>
                    <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                        Cài đặt bài viết
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <TextField
                            select
                            label="Sản phẩm"
                            name="productId"
                            value={form.productId}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={DASHBOARD_STYLES.formField}
                        >
                            {products.map(product => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.speciesName || product.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Trạng thái"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={DASHBOARD_STYLES.formField}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Thẻ (phân cách bằng dấu phẩy)"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            fullWidth
                            sx={DASHBOARD_STYLES.formField}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f7faf7' }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderColor: '#0b3f31',
                        color: '#0b3f31',
                        '&:hover': {
                            borderColor: '#073026',
                            backgroundColor: 'rgba(11, 63, 49, 0.05)'
                        }
                    }}
                >
                    Hủy
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    sx={DASHBOARD_STYLES.primaryButton}
                >
                    Tạo Bài Viết
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostDialog;
