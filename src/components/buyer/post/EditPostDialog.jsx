import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Box,
    IconButton,
    Typography,
    MenuItem,
    CircularProgress
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import { enqueueSnackbar } from 'notistack';

const EditPostDialog = ({ open, onClose, post, onSave, products = [] }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [productId, setProductId] = useState('');
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (post && open) {
            setTitle(post.title || '');
            setContent(post.description || '');
            setProductId(post.productId || post.product?.id || '');

            // Extract existing images
            const imgs = Array.isArray(post.images)
                ? post.images
                : (post.images?.postImages || []);
            setExistingImages(imgs);
        }
    }, [post, open]);

    useEffect(() => {
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newPreviews]);

    const handleNewFiles = (e) => {
        const fileList = Array.from(e.target.files || []);
        setNewFiles(prev => [...prev, ...fileList]);
        const urls = fileList.map(f => URL.createObjectURL(f));
        setNewPreviews(prev => [...prev, ...urls]);
    };

    const removeExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNewImage = (idx) => {
        URL.revokeObjectURL(newPreviews[idx]);
        setNewFiles(prev => prev.filter((_, i) => i !== idx));
        setNewPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const uploadFilesToCloud = async (fileList) => {
        const uploaded = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            try {
                const url = await uploadToCloudinary(file, {
                    onProgress: (p) => {
                        const overallProgress = ((i + p / 100) / fileList.length) * 100;
                        setUploadProgress(Math.round(overallProgress));
                    }
                });
                uploaded.push({ name: file.name || '', link: url });
            } catch (err) {
                console.error('Upload failed for', file.name, err);
                enqueueSnackbar(`Upload thất bại: ${file.name}`, { variant: 'error' });
            }
        }
        return uploaded;
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            enqueueSnackbar('Vui lòng nhập nội dung', { variant: 'warning' });
            return;
        }

        if (!productId) {
            enqueueSnackbar('Vui lòng chọn sản phẩm', { variant: 'warning' });
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            // Upload new files
            const newlyUploaded = newFiles.length > 0
                ? await uploadFilesToCloud(newFiles)
                : [];

            // Combine existing images with newly uploaded ones
            const allImages = [
                ...existingImages.map(img => ({
                    name: img.name || '',
                    link: img.link || img.url
                })),
                ...newlyUploaded
            ];

            const payload = {
                title: title || '',
                description: content || '',
                status: 'PUBLISHED',
                productId: Number(productId),
                postImages: allImages
            };

            if (onSave) {
                await onSave(post.id, payload);
            }

            handleClose();
        } catch (err) {
            console.error('Update post failed', err);
            enqueueSnackbar('Cập nhật bài viết thất bại', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        setTitle('');
        setContent('');
        setProductId('');
        setExistingImages([]);
        setNewFiles([]);
        newPreviews.forEach(url => URL.revokeObjectURL(url));
        setNewPreviews([]);
        setUploadProgress(0);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Chỉnh sửa bài viết
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Tiêu đề (tùy chọn)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Nội dung"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                        required
                    />

                    <TextField
                        select
                        label="Sản phẩm (bắt buộc)"
                        value={productId}
                        onChange={e => setProductId(e.target.value)}
                        size="small"
                        fullWidth
                        required
                    >
                        {products.map(p => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.name || p.title || `Sản phẩm #${p.id}`}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Ảnh hiện tại:</Typography>
                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
                                {existingImages.map((img, i) => (
                                    <Box key={i} sx={{ position: 'relative' }}>
                                        <Box
                                            component="img"
                                            src={img.link || img.url}
                                            alt={`existing-${i}`}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                objectFit: 'cover',
                                                borderRadius: 1
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeExistingImage(i)}
                                            sx={{
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* New images */}
                    {newPreviews.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Ảnh mới:</Typography>
                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
                                {newPreviews.map((src, i) => (
                                    <Box key={i} sx={{ position: 'relative' }}>
                                        <Box
                                            component="img"
                                            src={src}
                                            alt={`new-${i}`}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                objectFit: 'cover',
                                                borderRadius: 1
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeNewImage(i)}
                                            sx={{
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <Stack direction="row" spacing={1} alignItems="center">
                        <label htmlFor="edit-post-images">
                            <input
                                id="edit-post-images"
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleNewFiles}
                            />
                            <IconButton color="primary" component="span">
                                <PhotoCamera />
                            </IconButton>
                        </label>
                        <Typography variant="body2" color="text.secondary">
                            Thêm ảnh mới
                        </Typography>
                    </Stack>

                    {isSubmitting && uploadProgress > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Đang tải lên... {uploadProgress}%</Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting || !content.trim() || !productId}
                >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditPostDialog;

