import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Typography,
    Link,
    Stack,
    Box,
    Button,
    TextField,
    IconButton,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const BuyerPostCard = ({ post, onSubmitComment }) => {
    const p = post || {};

    const title = p.title ?? p.data?.title ?? p.post?.title ?? (p.id ? `Bài đăng #${p.id}` : 'Không tiêu đề');

    let images = [];
    if (Array.isArray(p.images)) images = p.images;
    else if (p.images && Array.isArray(p.images.postImages)) images = p.images.postImages;

    const tagsArray = (p.tags && Array.isArray(p.tags.postTags)) ? p.tags.postTags : (Array.isArray(p.tags) ? p.tags : []);
    const commentsArray = (p.comments && Array.isArray(p.comments.comments)) ? p.comments.comments : (Array.isArray(p.comments) ? p.comments : []);

    const productObj = p.product || null;
    const productId = productObj?.id || p.productId;
    const productName = productObj?.name || (productId ? `Sản phẩm #${productId}` : null);
    const productHref = productId ? `/product/${productId}` : '#';

    const [selectedIndex, setSelectedIndex] = useState(0);
    const mainImage = images.length > 0 ? (images[selectedIndex]?.link || images[selectedIndex]?.url || null) : null;

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // comment input state
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        const trimmed = commentText.trim();
        if (!trimmed || isSubmitting) return;
        setIsSubmitting(true);
        try {
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

    // Lightbox controls
    const openLightboxAt = (idx) => {
        setLightboxIndex(idx);
        setLightboxOpen(true);
    };
    const closeLightbox = () => setLightboxOpen(false);
    const prevLightbox = () => setLightboxIndex(i => (i - 1 + images.length) % images.length);
    const nextLightbox = () => setLightboxIndex(i => (i + 1) % images.length);

    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevLightbox();
            if (e.key === 'ArrowRight') nextLightbox();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, images.length]);

    const renderImagesGrid = () => {
        const cnt = images.length;
        if (cnt === 0) return null;

        const containerHeight = 320;

        if (cnt === 1) {
            return (
                <Box sx={{ px: 2, pt: 1 }}>
                    <Box
                        component="img"
                        src={images[0]?.link || images[0]?.url}
                        alt={images[0]?.name || title}
                        onClick={() => openLightboxAt(0)}
                        sx={{
                            width: '100%',
                            height: containerHeight,
                            objectFit: 'contain',
                            backgroundColor: '#f5f5f5',
                            display: 'block',
                            p: 1,
                            borderRadius: 1,
                            cursor: 'pointer'
                        }}
                    />
                </Box>
            );
        }

        let gridTemplateColumns = '1fr 1fr';
        let gridTemplateRows = '1fr';
        if (cnt === 2) {
            gridTemplateColumns = '1fr 1fr';
            gridTemplateRows = '1fr';
        } else if (cnt === 3) {
            gridTemplateColumns = '2fr 1fr';
            gridTemplateRows = '1fr 1fr';
        } else {
            gridTemplateColumns = '1fr 1fr';
            gridTemplateRows = '1fr 1fr';
        }

        const itemsToRender = cnt > 4 ? images.slice(0, 4) : images.slice(0, Math.min(cnt, 4));

        return (
            <Box sx={{ px: 2, pt: 1 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 1,
                        width: '100%',
                        height: containerHeight,
                        gridTemplateColumns,
                        gridTemplateRows,
                        gridTemplateAreas: cnt === 3 ? `"a b" "a c"` : undefined
                    }}
                >
                    {itemsToRender.map((img, idx) => {
                        const key = img.id ?? img.link ?? idx;
                        const isExtraOverlay = idx === 3 && cnt > 4;
                        const gridArea = cnt === 3 ? (idx === 0 ? 'a' : (idx === 1 ? 'b' : 'c')) : undefined;
                        return (
                            <Box
                                key={key}
                                onClick={() => { setSelectedIndex(idx); openLightboxAt(idx); }}
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    gridArea,
                                    overflow: 'hidden',
                                    borderRadius: 1,
                                    cursor: 'pointer'
                                }}
                                component="div"
                            >
                                <Box
                                    component="img"
                                    src={img.link || img.url}
                                    alt={img.name || `img-${idx}`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                        display: 'block',
                                        backgroundColor: '#f5f5f5'
                                    }}
                                />
                                {isExtraOverlay && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.45)',
                                            color: '#fff',
                                            fontSize: 20,
                                            fontWeight: 600
                                        }}
                                    >
                                        {`+${cnt - 4}`}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    };

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
            />

            {renderImagesGrid()}

            <CardContent>
                <Typography variant="body1" paragraph>
                    {p.description || '-'}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2">Sản phẩm:</Typography>
                    {productId ? (
                        <Link href={productHref} underline="hover" target="_blank" rel="noopener">
                            {productName}
                        </Link>
                    ) : (
                        <Typography color="text.secondary">Không có sản phẩm liên kết</Typography>
                    )}
                </Stack>

                <Stack mt={2} spacing={1}>
                    <Typography variant="subtitle2">Thẻ:</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {tagsArray.length > 0 ? tagsArray.map(t => t.tagName ?? t).join(', ') : '-'}
                    </Typography>
                </Stack>

                <Stack mt={2} spacing={1}>
                    <Typography variant="subtitle2">Bình luận ({p.comments?.count ?? commentsArray.length}):</Typography>
                    {commentsArray.map(c => {
                        const author = c.buyerName || c.buyer_name || c.userName || `Người dùng #${c.accountId ?? c.buyerId ?? '??'}`;
                        const time = c.createdAt ? new Date(c.createdAt).toLocaleString() : '';
                        return (
                            <Box key={c.id ?? c.createdAt} sx={{ mb: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                    <Typography variant="subtitle2">{author}</Typography>
                                    {time && <Typography variant="caption" color="text.secondary">{time}</Typography>}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {c.content}
                                </Typography>
                            </Box>
                        );
                    })}
                </Stack>

                {/* comment input */}
                <Box mt={2} display="flex" gap={1} alignItems="flex-end">
                    <TextField
                        label="Viết bình luận"
                        placeholder="Nhập bình luận và nhấn Enter hoặc gửi"
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
                        aria-label="gửi bình luận"
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </CardContent>

            <CardActions>
                {productId && (
                    <Link href={productHref} target="_blank" rel="noopener" sx={{ ml: 'auto' }}>
                        <Button size="small">Mở sản phẩm</Button>
                    </Link>
                )}
            </CardActions>

            {/* Lightbox dialog */}
            <Dialog open={lightboxOpen} onClose={closeLightbox} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
                    <Box />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <IconButton onClick={prevLightbox} aria-label="previous image" size="large">
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        <IconButton onClick={nextLightbox} aria-label="next image" size="large">
                            <ArrowForwardIosIcon />
                        </IconButton>
                        <IconButton onClick={closeLightbox} aria-label="close" size="large">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    {images[lightboxIndex] ? (
                        <Box
                            component="img"
                            src={images[lightboxIndex].link || images[lightboxIndex].url}
                            alt={images[lightboxIndex].name || `image-${lightboxIndex}`}
                            sx={{
                                maxHeight: '80vh',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default BuyerPostCard;
