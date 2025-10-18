import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Chip, Stack } from '@mui/material';
import { Article as ArticleIcon } from '@mui/icons-material';
import ActionButton from '../../buttonCustom/ActionButton.jsx';
import { DASHBOARD_STYLES } from '../../constants.js';

const statusLabels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived'
};

const PostDetailDialog = ({ open, onClose, post }) => (
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
        <DialogTitle sx={{
            ...DASHBOARD_STYLES.dialogTitle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                <ArticleIcon sx={{fontSize: '2rem'}}/>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Chi Tiết Bài Viết
                </Typography>
            </Box>

            <ActionButton
                action="cancel"
                onClick={onClose}
                sx={{
                    alignSelf: 'flex-end',
                    minWidth: 'auto',
                    px: 2,
                    py: 0.5
                }}
            />
        </DialogTitle>
        <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
            {post ? (
                <Box sx={{
                    m: { xs: 2, sm: 3 },
                    p: { xs: 2.5, sm: 4 },
                    pt: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    backgroundColor: 'white',
                    border: '1px solid rgba(76,175,80,0.12)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                }}>
                    <Box sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
                        border: '1px solid rgba(76,175,80,0.15)',
                        mb: 2
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#0b3f31' }}>
                            {post.title}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Sản phẩm: <b style={{ color: '#0b3f31' }}>{post.product?.name || '-'}</b>
                            </Typography>
                            <Chip
                                label={statusLabels[post.status] || post.status}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: post.status === 'PUBLISHED' ? '#22c55e' : 
                                                   post.status === 'DRAFT' ? '#f59e0b' : '#ef4444',
                                    color: 'white'
                                }}
                                size="small"
                            />
                        </Stack>
                    </Box>

                    <Box sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                        border: '1px solid rgba(33,150,243,0.12)',
                        mb: 2
                    }}>
                        <Typography sx={{ fontWeight: 800, mb: 1, color: '#0b3f31' }}>
                            Nội dung
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {post.content || 'Không có nội dung'}
                        </Typography>
                    </Box>

                    <Box sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #fdfcf7 100%)',
                        border: '1px solid rgba(255,193,7,0.15)',
                        mb: 2
                    }}>
                        <Typography sx={{ fontWeight: 800, mb: 1, color: '#0b3f31' }}>
                            Thẻ
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            {Array.isArray(post.tags) && post.tags.length > 0 
                                ? post.tags.join(', ') 
                                : 'Không có thẻ'}
                        </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        Ngày tạo: {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : '-'}
                    </Typography>
                </Box>
            ) : (
                <Typography>Không có bài viết được chọn</Typography>
            )}
        </DialogContent>
    </Dialog>
);

export default PostDetailDialog;
