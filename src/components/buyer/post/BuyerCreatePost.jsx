// File: src/components/buyer/post/BuyerCreatePost.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Stack, Typography, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { createPost } from '@/services/PostService.jsx';
import { viewProduct } from '@/services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import { enqueueSnackbar } from 'notistack';

const PRODUCTS_CACHE_KEY = 'create_post_products_cache';
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

const BuyerCreatePost = ({ onCreated, currentUser = null }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [productId, setProductId] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    // Load products from cache or fetch from API
    useEffect(() => {
        let mounted = true;

        const loadProducts = async () => {
            // Try to get from cache first
            try {
                const cached = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const now = Date.now();
                    
                    // If cache is still valid, use it immediately
                    if (now - timestamp < CACHE_EXPIRY_TIME && Array.isArray(data)) {
                        if (mounted) {
                            setProducts(data);
                        }
                        
                        // Fetch fresh data in background (optional)
                        fetchAndCacheProducts(mounted, false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error reading products cache:', error);
            }

            // No valid cache, fetch from API
            await fetchAndCacheProducts(mounted, true);
        };

        const fetchAndCacheProducts = async (isMounted, showLoading) => {
            if (showLoading && isMounted) {
                setIsLoadingProducts(true);
            }

            try {
                const res = await viewProduct();
                const items = res?.data?.data || [];
                
                if (isMounted) {
                    setProducts(items);
                    setIsLoadingProducts(false);
                }

                // Cache the result
                try {
                    sessionStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
                        data: items,
                        timestamp: Date.now()
                    }));
                } catch (cacheError) {
                    console.error('Error caching products:', cacheError);
                }
            } catch (err) {
                console.error('Failed to load products', err);
                if (isMounted) {
                    setProducts([]);
                    setIsLoadingProducts(false);
                }
            }
        };

        loadProducts();

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

    const handleOpen = () => {
        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // Reset form when closing
        setTitle('');
        setContent('');
        setProductId('');
        setFiles([]);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);
        setAttemptedSubmit(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);

        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }

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

            handleClose();
            if (typeof onCreated === 'function') onCreated();
        } catch (err) {
            console.error('Create post failed', err);
            enqueueSnackbar('Tạo bài viết thất bại', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const noPurchased = products.length === 0;

    return (
        <>
            {/* Floating Action Button */}
            <Box 
                sx={{ 
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                        boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #1B5E20 0%, #0d3b1e 100%)',
                            boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    ✨ Tạo bài đăng mới
                </Button>
            </Box>

            {/* Dialog Form */}
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1,
                    borderBottom: '2px solid',
                    borderColor: 'primary.main'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Tạo bài đăng mới
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Tiêu đề (tùy chọn)"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            fullWidth
                            placeholder="Nhập tiêu đề bài viết..."
                        />

                        <TextField
                            label="Nội dung"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            multiline
                            minRows={4}
                            fullWidth
                            required
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        />

                        <TextField
                            select
                            label="Sản phẩm đã mua (bắt buộc)"
                            value={productId}
                            onChange={e => setProductId(e.target.value)}
                            fullWidth
                            required
                            error={attemptedSubmit && !productId}
                            helperText={
                                isLoadingProducts 
                                    ? 'Đang tải danh sách sản phẩm...'
                                    : (noPurchased
                                        ? 'Không có sản phẩm đã mua để chọn'
                                        : (attemptedSubmit && !productId ? 'Vui lòng chọn sản phẩm' : ''))
                            }
                            disabled={isLoadingProducts}
                        >
                            {products.map(p => (
                                <MenuItem key={p.id ?? p.uuid ?? `${p.name}-${p.id}`} value={p.id}>
                                    {p.name || p.title || `Sản phẩm #${p.id}`}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <label htmlFor="buyer-post-images">
                                    <input
                                        id="buyer-post-images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFiles}
                                    />
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={<PhotoCamera />}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Chọn ảnh
                                    </Button>
                                </label>
                                <Typography variant="body2" color="text.secondary">
                                    {files.length > 0 ? `${files.length} ảnh đã chọn` : 'Chưa có ảnh nào'}
                                </Typography>
                            </Stack>

                            {previews.length > 0 && (
                                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
                                    {previews.map((src, i) => (
                                        <Box 
                                            key={src} 
                                            component="img" 
                                            src={src} 
                                            alt={`preview-${i}`} 
                                            sx={{ 
                                                width: 100, 
                                                height: 100, 
                                                objectFit: 'cover', 
                                                borderRadius: 2,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }} 
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button 
                        onClick={handleClose}
                        sx={{ textTransform: 'none' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || noPurchased || isLoadingProducts}
                        sx={{
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600
                        }}
                    >
                        {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BuyerCreatePost;
