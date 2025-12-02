import React, {useEffect, useState} from 'react';
import {
    Box, Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, IconButton, MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Article as ArticleIcon, Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import {viewProduct} from '@/services/ProductService.jsx';
import { createPost, updatePost } from '@/services/PostService.jsx';
import { enqueueSnackbar } from 'notistack';
import { DASHBOARD_STYLES } from '../../constants.js';
import UploadImageField from '../succulent/UploadImageField.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';

const STATUS_OPTIONS = [
    {value: 'DRAFT', label: 'Draft'},
    {value: 'PUBLISHED', label: 'Published'},
    {value: 'ARCHIVED', label: 'Archived'}
];

const PostDialog = ({open, onClose, onCreated, post, onUpdated}) => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        productId: '',
        status: 'DRAFT'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // now postImages: array of { id?, name, link }
    const [postImages, setPostImages] = useState([]);

    // per-image uploading/progress state: { [index]: { isUploading: boolean, progress: number } }
    const [uploadingMap, setUploadingMap] = useState({});

    useEffect(() => {
        if (open) {
            viewProduct().then(res => setProducts(res?.data?.data || []));
            if (post) {
                setForm({
                    title: post.title ?? '',
                    description: post.description ?? post.content ?? '',
                    productId: post.productId ?? (post.product?.id ?? ''),
                    status: post.status ?? 'DRAFT'
                });
                // Normalize existing images / postImages and preserve ids
                const imgs = Array.isArray(post.postImages)
                    ? post.postImages.map((i, idx) => ({
                        id: i.id ?? i.name ?? `idx-${idx}`,
                        name: i.name ?? '',
                        link: i.link ?? ''
                    }))
                    : Array.isArray(post.images)
                        ? post.images.map((i, idx) => {
                            if (typeof i === 'string') return { id: `idx-${idx}`, name: '', link: i };
                            return { id: i.id ?? i.name ?? `idx-${idx}`, name: i.name ?? '', link: i.url ?? i.path ?? i };
                        })
                        : [];
                setPostImages(imgs);
            } else {
                setForm({
                    title: '',
                    description: '',
                    productId: '',
                    status: 'DRAFT'
                });
                setPostImages([]);
            }
            setIsSubmitting(false);
            setUploadingMap({});
        } else {
            // dialog closed: reset image entries and uploading states
            setPostImages([]);
            setUploadingMap({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, post]);

    const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

    const updatePostImage = (index, key, value) => {
        setPostImages(prev => prev.map((it, i) => i === index ? { ...it, [key]: value } : it));
    };

    const addPostImage = () => setPostImages(prev => [...prev, { name: '', link: '' }]);

    const removePostImage = (index) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
        setUploadingMap(prev => {
            const copy = {...prev};
            delete copy[index];
            return copy;
        });
    };

    const handlePostImageFileSelected = async (index, event) => {
        const file = event.target?.files?.[0];
        if (!file) return;
        setUploadingMap(prev => ({...prev, [index]: { isUploading: true, progress: 0 }}));
        try {
            const imageUrl = await uploadToCloudinary(file, {
                onProgress: (p) => setUploadingMap(prev => ({...prev, [index]: { isUploading: true, progress: p }}))
            });
            setPostImages(prev => prev.map((pi, i) => i === index ? { ...pi, link: imageUrl, name: pi.name || file.name } : pi));
            enqueueSnackbar('Upload ảnh thành công', { variant: 'success' });
        } catch (error) {
            console.error('Upload failed', error);
            enqueueSnackbar('Tải ảnh thất bại', { variant: 'error' });
        } finally {
            setUploadingMap(prev => ({...prev, [index]: {...(prev[index] || {}), isUploading: false}}));
            if (event.target) event.target.value = '';
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                productId: Number(form.productId),
                status: form.status,
                // include id when present so backend can reconcile images
                postImages: postImages.map(pi => ({
                    ...(pi.id ? { id: pi.id } : {}),
                    name: pi.name ?? '',
                    link: pi.link ?? ''
                }))
            };

            if (post) {
                await updatePost(post.id, payload);
                enqueueSnackbar('Post updated successfully', { variant: 'success' });
                onUpdated && onUpdated();
            } else {
                await createPost(payload);
                enqueueSnackbar('Post created successfully', { variant: 'success' });
                onCreated && onCreated();
            }
            onClose();
        } catch (error) {
            console.error('post submit error', error);
            const serverMessage = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to submit post. Please try again.';
            enqueueSnackbar(String(serverMessage), { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
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
                        {post ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
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

                        {/* Post images as name+link list */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2">Hình ảnh</Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={addPostImage}>Thêm ảnh</Button>
                            </Box>

                            <Stack spacing={1}>
                                {postImages.map((pi, idx) => (
                                    <Box key={pi.id ?? `pi-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <TextField
                                            label="Tên"
                                            value={pi.name}
                                            onChange={e => updatePostImage(idx, 'name', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                        <Box sx={{ width: 320 }}>
                                            <UploadImageField
                                                imageUrl={pi.link}
                                                isUploading={!!uploadingMap[idx]?.isUploading}
                                                uploadProgress={uploadingMap[idx]?.progress || 0}
                                                onFileSelected={(e) => handlePostImageFileSelected(idx, e)}
                                            />
                                        </Box>
                                        <IconButton size="small" onClick={() => removePostImage(idx)} aria-label={`remove-image-${idx}`}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                {postImages.length === 0 && (
                                    <Typography variant="caption" color="text.secondary">Chưa thêm ảnh</Typography>
                                )}
                            </Stack>
                        </Box>
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
                    disabled={isSubmitting}>Huỷ
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={DASHBOARD_STYLES.primaryButton}
                    disabled={isSubmitting || !form.title || !form.description || !form.productId}
                >
                    {isSubmitting ? 'Đang lưu...' : (post ? 'Lưu' : 'Tạo bài viết')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostDialog;
