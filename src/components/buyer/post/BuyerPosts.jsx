import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack, TextField, Button, Divider, List, ListItem, ListItemText } from '@mui/material';
import { viewPosts } from '../../../services/PostService.jsx';
import { createPostComment } from '../../../services/PostService.jsx';

const BuyerPosts = () => {
    const [posts, setPosts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            const res = await viewPosts();
            setPosts(res?.data?.data || []);
        };
        fetchPosts();
    }, [refresh]);

    const handleCommentChange = (postId, value) => {
        setCommentInputs(prev => ({ ...prev, [postId]: value }));
    };

    const handleCommentSubmit = async (postId) => {
        const content = commentInputs[postId];
        if (!content) return;
        await createPostComment(postId, { content });
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setRefresh(r => !r); // Refresh comments
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
            <Typography variant="h4" fontWeight={700} mb={3}>Seller Posts</Typography>
            <Stack spacing={3}>
                {posts.map(post => (
                    <Card key={post.id} sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6">{post.title}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Product: <b>{post.product.name}</b>
                                </Typography>
                            </Stack>
                            <Typography variant="body2" mb={1}>{post.description}</Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={1}>
                                {Array.isArray(post.tags) && post.tags.length > 0
                                    ? post.tags.map((tag, idx) => (
                                        <Chip key={idx} label={tag} size="small" variant="outlined" />
                                    ))
                                    : <Typography variant="caption" color="text.secondary">No tags</Typography>
                                }
                            </Stack>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" mb={1}>Comments</Typography>
                            <List dense>
                                {Array.isArray(post.comments) && post.comments.length > 0 ? (
                                    post.comments.map((c, idx) => (
                                        <ListItem key={idx} alignItems="flex-start">
                                            <ListItemText
                                                primary={c.buyerName || 'Anonymous'}
                                                secondary={c.content}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>No comments yet</Typography>
                                )}
                            </List>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={e => handleCommentChange(post.id, e.target.value)}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleCommentSubmit(post.id)}
                                    disabled={!commentInputs[post.id]}
                                >
                                    Comment
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default BuyerPosts;
