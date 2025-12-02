// File: src/components/buyer/post/BuyerCreatePost.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Stack, Typography, IconButton, MenuItem } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { createPost } from '@/services/PostService.jsx';
import { viewProduct } from '@/services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import { enqueueSnackbar } from 'notistack';

const BuyerCreatePost = ({ onCreated, currentUser = null }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [productId, setProductId] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    useEffect(() => {
        let mounted = true;
        viewProduct()
            .then(res => {
                if (!mounted) return;
                const items = res?.data?.data || [];
                const purchased = items;
                setProducts(purchased);
            })
            .catch(err => {
                console.error('Failed to load products', err);
                setProducts([]);
            });
        return () => { mounted = false; };
    }, []);

    const isLoggedIn = currentUser != null;

    const handleFiles = (e) => {
        if (!isLoggedIn) {
            // redirect to sign-in page when user is not authenticated
            window.location.href = '/signin';
            return;
        }
        const fileList = Array.from(e.target.files || []);
        setFiles(fileList);
        const urls = fileList.map(f => URL.createObjectURL(f));
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews(urls);
    };

    const uploadFilesToCloud = async (fileList) => {
        const uploaded = [];
        for (const file of fileList) {
            try {
                const url = await uploadToCloudinary(file);
                uploaded.push({ name: file.name || '', link: url });
            } catch (err) {
                console.error('Upload failed for', file.name, err);
                enqueueSnackbar(`Upload failed: ${file.name}`, { variant: 'error' });
            }
        }
        return uploaded;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);

        if (!isLoggedIn) {
            // redirect to sign-in page when user is not authenticated
            window.location.href = '/login';
            return;
        }

        // require a purchased product to be attached
        if (!productId) {
            enqueueSnackbar('Vui lòng chọn sản phẩm đã mua để đăng bài', { variant: 'warning' });
            return;
        }

        if (!content.trim() && files.length === 0) return;

        setIsSubmitting(true);
        try {
            const postImages = files.length ? await uploadFilesToCloud(files) : [];

            const payload = {
                title: title || '',
                description: content || '',
                status: 'PUBLISHED',
                productId: Number(productId),
                postImages
            };

            await createPost(payload);
            enqueueSnackbar('Đăng bài thành công', { variant: 'success' });

            setTitle('');
            setContent('');
            setProductId('');
            setFiles([]);
            previews.forEach(url => URL.revokeObjectURL(url));
            setPreviews([]);
            setAttemptedSubmit(false);

            if (typeof onCreated === 'function') onCreated();
        } catch (err) {
            console.error('Create post failed', err);
            enqueueSnackbar('Tạo bài viết thất bại', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const noPurchased = products.length === 0;

    // show cancel button only when there's content (title/content) or images selected
    const hasContent = Boolean((title && title.trim()) || (content && content.trim()) || (files && files.length > 0));

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Stack spacing={1}>
                <Typography variant="subtitle1">Tạo bài đăng mới</Typography>

                {!isLoggedIn && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Bạn cần đăng nhập để tạo bài đăng.</Typography>
                        <Button href="/login" size="small" variant="outlined" sx={{ mt: 1 }}>Đăng nhập</Button>
                    </Box>
                )}

                <TextField
                    label="Tiêu đề (tùy chọn)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isLoggedIn}
                />

                <TextField
                    label="Nội dung"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    required
                    disabled={!isLoggedIn}
                />

                <TextField
                    select
                    label="Sản phẩm đã mua (bắt buộc)"
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    error={attemptedSubmit && !productId}
                    helperText={
                        noPurchased
                            ? 'Không có sản phẩm đã mua để chọn'
                            : ''
                    }
                    disabled={!isLoggedIn}
                >
                    {products.map(p => (
                        <MenuItem key={p.id ?? p.uuid ?? `${p.name}-${p.id}`} value={p.id}>
                            {p.name || p.title || `Sản phẩm #${p.id}`}
                        </MenuItem>
                    ))}
                </TextField>

                <Stack direction="row" spacing={1} alignItems="center">
                    <label htmlFor="buyer-post-images">
                        <input
                            id="buyer-post-images"
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFiles}
                            disabled={!isLoggedIn}
                        />
                        <IconButton color="primary" component="span" disabled={!isLoggedIn}>
                            <PhotoCamera />
                        </IconButton>
                    </label>
                    <Typography variant="body2" color="text.secondary">
                        {files.length} ảnh đã chọn
                    </Typography>
                </Stack>

                {previews.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
                        {previews.map((src, i) => (
                            <Box key={src} component="img" src={src} alt={`preview-${i}`} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }} />
                        ))}
                    </Stack>
                )}

                <Stack direction="row" spacing={1}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={isSubmitting || noPurchased || !isLoggedIn}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Đăng bài'}
                    </Button>

                    {hasContent && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setTitle(''); setContent(''); setProductId(''); setFiles([]); previews.forEach(url => URL.revokeObjectURL(url)); setPreviews([]); setAttemptedSubmit(false);
                            }}
                        >
                            Hủy
                        </Button>
                    )}
                </Stack>

                {/* show helper when not logged in */}
                {!isLoggedIn && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Bạn cần đăng nhập để có thể đăng bài.
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};

export default BuyerCreatePost;
