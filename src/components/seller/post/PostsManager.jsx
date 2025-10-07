import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Paper, Typography, Alert } from '@mui/material';
import { Add as AddIcon, Article as ArticleIcon } from '@mui/icons-material';
import PostTable from './PostTable.jsx';
import PostDetailDialog from './PostDetailDialog.jsx';
import PostDialog from './PostDialog.jsx';
import { viewPostsBySeller } from '../../../services/PostService.jsx';

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
