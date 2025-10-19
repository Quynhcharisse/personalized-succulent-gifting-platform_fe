import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    CardHeader,
    CardActions,
    Typography,
    Link,
    Stack,
    Box,
    Button,
    TextField,
    IconButton,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const BuyerPostCard = ({ post, onSubmitComment }) => {
    const p = post || {};

    const title = p.title ?? p.data?.title ?? p.post?.title ?? (p.id ? `Post #${p.id}` : 'Untitled');

    let images = [];
    if (Array.isArray(p.images)) images = p.images;
    else if (p.images && Array.isArray(p.images.postImages)) images = p.images.postImages;

    const tagsArray = (p.tags && Array.isArray(p.tags.postTags)) ? p.tags.postTags : (Array.isArray(p.tags) ? p.tags : []);
    const commentsArray = (p.comments && Array.isArray(p.comments.comments)) ? p.comments.comments : (Array.isArray(p.comments) ? p.comments : []);

    const productObj = p.product || null;
    const productId = productObj?.id || p.productId;
    const productName = productObj?.name || (productId ? `View product #${productId}` : null);
    const productHref = productId ? `/product/${productId}` : '#';

    const [selectedIndex, setSelectedIndex] = useState(0);
    const mainImage = images.length > 0 ? (images[selectedIndex]?.link || images[selectedIndex]?.url || null) : null;

    // comment input state
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        const trimmed = commentText.trim();
        if (!trimmed || isSubmitting) return;
        setIsSubmitting(true);
        try {
            // await parent handler if provided (BuyerPosts returns async handler)
            if (onSubmitComment) await onSubmitComment(p.id, trimmed);
            setCommentText('');
        } catch (err) {
            console.error('submit comment failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment();
        }
    };

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
            />

            {mainImage ? (
                <CardMedia
                    component="img"
                    height="320"
                    image={mainImage}
                    alt={images[selectedIndex]?.name || title}
                    sx={{ objectFit: 'cover' }}
                />
            ) : null}

            {images.length > 1 && (
                <Box sx={{ px: 2, pt: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
                        {images.map((img, idx) => (
                            <Box
                                key={img.id ?? img.link ?? idx}
                                component="img"
                                src={img.link || img.url}
                                alt={img.name || `thumb-${idx}`}
                                onClick={() => setSelectedIndex(idx)}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    border: idx === selectedIndex ? '2px solid' : '1px solid',
                                    borderColor: idx === selectedIndex ? 'primary.main' : 'divider'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            <CardContent>
                <Typography variant="body1" paragraph>
                    {p.description || '-'}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2">Product:</Typography>
                    {productId ? (
                        <Link href={productHref} underline="hover" target="_blank" rel="noopener">
                            {productName}
                        </Link>
                    ) : (
                        <Typography color="text.secondary">No product linked</Typography>
                    )}
                </Stack>

                <Stack mt={2} spacing={1}>
                    <Typography variant="subtitle2">Tags:</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {tagsArray.length > 0 ? tagsArray.map(t => t.tagName ?? t).join(', ') : '-'}
                    </Typography>
                </Stack>

                <Stack mt={2} spacing={1}>
                    <Typography variant="subtitle2">Comments ({p.comments?.count ?? commentsArray.length}):</Typography>
                    {commentsArray.map(c => (
                        <Typography key={c.id ?? c.createdAt} variant="body2" color="text.secondary">
                            {c.content}
                        </Typography>
                    ))}
                </Stack>

                {/* comment input */}
                <Box mt={2} display="flex" gap={1} alignItems="flex-end">
                    <TextField
                        label="Write a comment"
                        placeholder="Type your comment and press Enter or click send"
                        multiline
                        maxRows={4}
                        fullWidth
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSubmitting}
                        size="small"
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSubmitComment}
                        disabled={isSubmitting || !commentText.trim()}
                        aria-label="send comment"
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </CardContent>

            <CardActions>
                {productId && (
                    <Link href={productHref} target="_blank" rel="noopener" sx={{ ml: 'auto' }}>
                        <Button size="small">Open Product</Button>
                    </Link>
                )}
            </CardActions>
        </Card>
    );
};

export default BuyerPostCard;
