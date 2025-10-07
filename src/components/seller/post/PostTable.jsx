import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress, Box, Typography, Chip, Stack } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const statusLabels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived'
};

const statusColors = {
    DRAFT: 'default',
    PUBLISHED: 'success',
    ARCHIVED: 'warning'
};

const PostTable = ({ postList, isLoading, onViewDetail }) => {
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" size={60} />
            </Box>
        );
    }
    return (
        <TableContainer component={Paper} sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
            border: '1px solid rgba(33, 150, 243, 0.1)'
        }}>
            <Table>
                <TableHead>
                    <TableRow sx={{
                        background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                        '& .MuiTableCell-head': {
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '1rem'
                        }
                    }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Tags</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.isArray(postList) && postList.map(post => (
                        <TableRow key={post.id}>
                            <TableCell>#{post.id}</TableCell>
                            <TableCell>{post.title}</TableCell>
                            <TableCell>{post.productName}</TableCell>
                            <TableCell>
                                <Chip
                                    label={statusLabels[post.status] || post.status}
                                    color={statusColors[post.status] || 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {Array.isArray(post.tags) && post.tags.length > 0
                                        ? post.tags.map((tag, idx) => (
                                            <Chip key={idx} label={tag} size="small" variant="outlined" />
                                        ))
                                        : <Typography variant="caption" color="text.secondary">-</Typography>
                                    }
                                </Stack>
                            </TableCell>
                            <TableCell>{post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
                            <TableCell align="center">
                                <Tooltip title="View Details">
                                    <IconButton color="primary" onClick={() => onViewDetail(post)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {Array.isArray(postList) && postList.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No posts found
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PostTable;
