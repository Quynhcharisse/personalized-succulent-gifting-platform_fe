import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Paper, Typography, Alert, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Article as ArticleIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import PostTable from './PostTable.jsx';
import PostDialog from './PostDialog.jsx';
import {viewPostsBySeller} from '../../../services/PostService.jsx';

const mapStatusToKey = (rawStatus) => {
    if (!rawStatus) return null;
    const s = String(rawStatus).toLowerCase();
    if (s.includes('nháp') || s.includes('draft')) return 'DRAFT';
    if (s.includes('xuất') || s.includes('published') || s.includes('publish')) return 'PUBLISHED';
    if (s.includes('lưu') || s.includes('archive') || s.includes('archived')) return 'ARCHIVED';
    return rawStatus;
};

const normalizePost = (p) => {
    const product = p.product
        || (p.productName ? { name: p.productName } : null)
        || (p.productId ? { id: p.productId, name: `#${p.productId}` } : { name: '-' });

    // robustly extract status whether backend returns string or object
    const rawStatus = (() => {
        if (!p) return null;
        if (typeof p.status === 'string') return p.status;
        if (p.status && typeof p.status === 'object') return p.status.name ?? p.status.value ?? p.status.key ?? '';
        return p.status ?? p.statusName ?? p.status_key ?? '';
    })();

    // normalize tags -> array of strings
    let tags = [];
    if (Array.isArray(p.tags)) {
        tags = p.tags;
    } else if (p.tags && Array.isArray(p.tags.postTags)) {
        tags = p.tags.postTags.map(t => {
            if (!t) return '';
            if (typeof t === 'string') return t;
            return t.name ?? t.tagName ?? t.value ?? '';
        }).filter(Boolean);
    } else if (typeof p.tags === 'string') {
        tags = p.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // normalize images/postImages -> array of { id?, name, link }
    let postImages = [];
    if (Array.isArray(p.postImages)) {
        postImages = p.postImages.map(i => ({
            id: i.id ?? undefined,
            name: i.name ?? '',
            link: i.link ?? i.url ?? ''
        }));
    } else if (p.images && Array.isArray(p.images.postImages)) {
        postImages = p.images.postImages.map(i => ({
            id: i.id ?? undefined,
            name: i.name ?? '',
            link: i.link ?? i.url ?? ''
        }));
    } else if (Array.isArray(p.images)) {
        postImages = p.images.map((i, idx) => {
            if (typeof i === 'string') return { id: `idx-${idx}`, name: '', link: i };
            return { id: i.id ?? undefined, name: i.name ?? '', link: i.url ?? i.link ?? '' };
        });
    }

    return {
        // spread raw object first, then override with normalized fields so normalization sticks
        ...p,
        id: p.id,
        title: p.title ?? '',
        content: p.content ?? p.description ?? '',
        description: p.description ?? '',
        product,
        tags,
        postImages,
        // keep legacy `images` field pointing to same normalized array for compatibility
        images: postImages,
        status: mapStatusToKey(rawStatus),
        createdAt: p.createdAt ?? p.created_at ?? null,
        updatedAt: p.updatedAt ?? p.updated_at ?? null
    };
};

const PostsManager = ({ sellerId }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const loadPosts = async () => {
        setIsLoading(true);
        setSubmitMessage({ type: '', text: '' });
        try {
            const response = await viewPostsBySeller(sellerId);
            const rawPosts = response?.data?.data?.posts ?? [];
            const normalized = Array.isArray(rawPosts) ? rawPosts.map(normalizePost) : [];
            setPosts(normalized);
            if (!normalized.length) {
                setSubmitMessage({ type: 'info', text: 'No posts found' });
            }
        } catch (err) {
            console.error('loadPosts error', err);
            setSubmitMessage({ type: 'error', text: 'Failed to load posts' });
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [sellerId]);

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
            <Paper elevation={0} sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                borderRadius: 4,
                background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArticleIcon sx={{
                            fontSize: { xs: 38, sm: 44 },
                            color: 'primary.main',
                            mr: 2,
                            filter: 'drop-shadow(0 4px 6px rgba(33, 150, 243, 0.2))'
                        }} />
                        <Box>
                            <Typography variant="h4" sx={{
                                fontWeight: 900,
                                color: 'primary.dark',
                                letterSpacing: 1,
                                fontSize: { xs: '1.7rem', sm: '2.2rem' }
                            }}>
                                Post Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage your posts here
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Refresh posts">
                            <IconButton color="primary" onClick={loadPosts} aria-label="refresh posts">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setShowCreateDialog(true)}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                py: 1.2,
                                px: 3,
                                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)'
                                }
                            }}
                        >
                            New Post
                        </Button>
                    </Box>
                </Box>

                {submitMessage.text && (
                    <Alert severity={submitMessage.type === 'success' ? 'success' : submitMessage.type === 'error' ? 'error' : 'info'} sx={{ mb: 4 }}>
                        {submitMessage.text}
                    </Alert>
                )}

                <PostTable
                    postList={posts}
                    isLoading={isLoading}
                    onViewDetail={post => { setSelectedPost(post); setShowEditDialog(true); }}
                />
            </Paper>

            {/* Edit dialog: key ensures remount when selectedPost changes, onClose refreshes list */}
            <PostDialog
                key={`edit-${selectedPost?.id ?? 'none'}`}
                open={showEditDialog}
                onClose={() => { setShowEditDialog(false); loadPosts(); }}
                post={selectedPost}
                onUpdated={loadPosts}
            />

            {/* Create dialog: ensure list refresh on close as well */}
            <PostDialog
                key="create-dialog"
                open={showCreateDialog}
                onClose={() => { setShowCreateDialog(false); loadPosts(); }}
                onCreated={loadPosts}
            />
        </Container>
    );
};

export default PostsManager;
