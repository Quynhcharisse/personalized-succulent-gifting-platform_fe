import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Typography, Box, Chip, Stack } from '@mui/material';

const statusLabels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived'
};

const PostDetailDialog = ({ open, onClose, post }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
            Post Details
            <Button onClick={onClose} variant="outlined" size="small" sx={{ float: 'right' }}>Close</Button>
        </DialogTitle>
        <DialogContent>
            {post ? (
                <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>{post.title}</Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">
                            Product: <b>{post.product.name}</b>
                        </Typography>
                        <Chip
                            label={statusLabels[post.status] || post.status}
                            color={
                                post.status === 'PUBLISHED'
                                    ? 'success'
                                    : post.status === 'DRAFT'
                                        ? 'default'
                                        : 'warning'
                            }
                            size="small"
                        />
                    </Stack>
                    <Typography variant="body2" sx={{ mb: 2 }}>{post.content}</Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Tags: {Array.isArray(post.tags) ? post.tags.join(', ') : '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Created: {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : '-'}
                    </Typography>
                </Box>
            ) : (
                <Typography>No post selected</Typography>
            )}
        </DialogContent>
    </Dialog>
);

export default PostDetailDialog;
