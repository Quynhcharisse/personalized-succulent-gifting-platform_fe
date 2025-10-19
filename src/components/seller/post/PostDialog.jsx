import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
    Box, Stack, Chip, IconButton, Avatar, Typography
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { viewProduct } from '../../../services/ProductService.jsx';
import { createPost, updatePost } from '../../../services/PostService.jsx';
import { enqueueSnackbar } from 'notistack';

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' }
];

const PostDialog = ({ open, onClose, onCreated, post, onUpdated }) => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        productId: '',
        status: 'DRAFT',
        tags: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // now postImages: array of { id?, name, link }
    const [postImages, setPostImages] = useState([]);

    useEffect(() => {
        if (open) {
            viewProduct().then(res => setProducts(res?.data?.data || []));
            if (post) {
                setForm({
                    title: post.title ?? '',
                    description: post.description ?? post.content ?? '',
                    productId: post.productId ?? (post.product?.id ?? ''),
                    status: post.status ?? 'DRAFT',
                    tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '')
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
                    status: 'DRAFT',
                    tags: ''
                });
                setPostImages([]);
            }
            setIsSubmitting(false);
        } else {
            // dialog closed: reset image entries
            setPostImages([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, post]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const updatePostImage = (index, key, value) => {
        setPostImages(prev => prev.map((it, i) => i === index ? { ...it, [key]: value } : it));
    };

    const addPostImage = () => setPostImages(prev => [...prev, { name: '', link: '' }]);

    const removePostImage = (index) => setPostImages(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

        setIsSubmitting(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                productId: Number(form.productId),
                status: form.status,
                tagNames: tagsArray,
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{post ? 'Edit Post' : 'New Post'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        minRows={3}
                        required
                    />
                    <TextField
                        select
                        label="Product"
                        name="productId"
                        value={form.productId}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        {products.map(product => (
                            <MenuItem key={product.id} value={product.id}>
                                {product.speciesName || product.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        fullWidth
                        required
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
                            <Typography variant="subtitle2">Images</Typography>
                            <Button size="small" startIcon={<AddIcon />} onClick={addPostImage}>Add image</Button>
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                Provide name and link for each image
                            </Typography>
                        </Box>

                        <Stack spacing={1}>
                            {postImages.map((pi, idx) => (
                                <Box key={pi.id ?? `pi-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        label="Name"
                                        value={pi.name}
                                        onChange={e => updatePostImage(idx, 'name', e.target.value)}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Link"
                                        value={pi.link}
                                        onChange={e => updatePostImage(idx, 'link', e.target.value)}
                                        size="small"
                                        fullWidth
                                    />
                                    <IconButton size="small" onClick={() => removePostImage(idx)} aria-label={`remove-image-${idx}`}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                            {postImages.length === 0 && (
                                <Typography variant="caption" color="text.secondary">No images added</Typography>
                            )}
                        </Stack>
                    </Box>

                    <TextField
                        label="Tags (comma separated)"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        fullWidth
                    />
                    {form.tags && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {form.tags.split(',').map((tag, idx) => (
                                tag.trim() && <Chip key={idx} label={tag.trim()} size="small" variant="outlined" />
                            ))}
                        </Stack>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting || !form.title || !form.description || !form.productId}
                >
                    {isSubmitting ? 'Submitting...' : (post ? 'Save' : 'Submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostDialog;
