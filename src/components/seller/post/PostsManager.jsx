import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Paper, Typography, Alert } from '@mui/material';
import { Add as AddIcon, Article as ArticleIcon } from '@mui/icons-material';
import PostTable from './PostTable.jsx';
import PostDetailDialog from './PostDetailDialog.jsx';
import PostDialog from './PostDialog.jsx';
import { viewPostsBySeller } from '../../../services/PostService.jsx';
import { DASHBOARD_STYLES } from '../../constants.js';

const PostsManager = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const response = await viewPostsBySeller();
            setPosts(response?.data?.data || []);
        } catch {
            setSubmitMessage({ type: 'error', text: 'Failed to load posts' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <Container sx={DASHBOARD_STYLES.container}>
            <Paper sx={DASHBOARD_STYLES.paper}>
                <Box sx={DASHBOARD_STYLES.headerSection}>
                    <Box sx={DASHBOARD_STYLES.titleSection}>
                        <ArticleIcon sx={DASHBOARD_STYLES.titleIcon} />
                        <Box>
                            <Typography sx={DASHBOARD_STYLES.mainTitle}>
                                Quản Lý Bài Viết
                            </Typography>
                            <Typography sx={DASHBOARD_STYLES.subtitle}>
                                Quản lý các bài viết của bạn tại đây
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateDialog(true)}
                        sx={DASHBOARD_STYLES.primaryButton}
                    >
                        Tạo Bài Viết
                    </Button>
                </Box>
                {submitMessage.text && (
                    <Alert severity={submitMessage.type === 'success' ? 'success' : 'error'} sx={{ mb: 4 }}>
                        {submitMessage.text}
                    </Alert>
                )}
                <PostTable
                    postList={posts}
                    isLoading={isLoading}
                    onViewDetail={post => { setSelectedPost(post); setShowDetailDialog(true); }}
                />
            </Paper>
            <PostDetailDialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                post={selectedPost}
            />
            <PostDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onCreated={loadPosts}
            />
        </Container>
    );
};

export default PostsManager;
