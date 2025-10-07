import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Stack, Chip } from '@mui/material';
import { viewProduct } from '../../../services/ProductService.jsx';

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' }
];

const PostDialog = ({ open, onClose, onCreated }) => {
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

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>New Post</DialogTitle>
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
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostDialog;
