import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {enqueueSnackbar} from 'notistack';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import {createProductSlug} from '@utils/slugUtil.js';

const getAuthorName = (post) => {
    return (
        post?.buyerName ||
        post?.sellerName ||
        post?.authorName ||
        post?.userName ||
        post?.accountName ||
        post?.createdByName ||
        post?.seller?.name ||
        post?.buyer?.name ||
        post?.product?.sellerName ||
        (post?.sellerId ? `Người bán #${post.sellerId}` : (post?.buyerId ? `Người dùng #${post.buyerId}` : 'Ẩn danh'))
    );
};

const initialsFrom = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const BuyerPostCard = ({ post = {}, onSubmitComment }) => {
    const author = getAuthorName(post);
    const p = post || {};

    const title = p.title ?? p.data?.title ?? p.post?.title ?? (p.id ? `Bài đăng #${p.id}` : 'Không tiêu đề');

    let images = [];
    if (Array.isArray(p.images)) images = p.images;
    else if (p.images && Array.isArray(p.images.postImages)) images = p.images.postImages;

    const avatarSrc = p.userAvatar || p.user?.avatar || p.user?.avatarUrl || p.buyerAvatar || p.sellerAvatar || p.authorAvatar || p.accountAvatar || null;
    const commentsArray = (p.comments && Array.isArray(p.comments.comments)) ? p.comments.comments : (Array.isArray(p.comments) ? p.comments : []);

    const productObj = p.product || null;
    const productId = productObj?.id || p.productId;
    const productName = productObj?.name || (productId ? `Sản phẩm #${productId}` : null);
    const productSlug = productId && productName
        ? createProductSlug(productName, productId)
        : null;
    const productHref = productSlug ? `/product/${productSlug}` : '#';

    const [selectedIndex, setSelectedIndex] = useState(0);
    const mainImage = images.length > 0 ? (images[selectedIndex]?.link || images[selectedIndex]?.url || null) : null;

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // comment input state
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // comment image state (single image)
    const [commentImageFile, setCommentImageFile] = useState(null);
    const [commentImagePreview, setCommentImagePreview] = useState(null);
    const [commentUploading, setCommentUploading] = useState(false);
    const [commentUploadProgress, setCommentUploadProgress] = useState(0);

    const [commentLightboxOpen, setCommentLightboxOpen] = useState(false);
    const [commentLightboxSrc, setCommentLightboxSrc] = useState(null);

    const openCommentLightbox = (src) => {
        setCommentLightboxSrc(src);
        setCommentLightboxOpen(true);
    };
    const closeCommentLightbox = () => {
        setCommentLightboxOpen(false);
        setCommentLightboxSrc(null);
    };

    useEffect(() => {
        return () => {
            if (commentImagePreview) URL.revokeObjectURL(commentImagePreview);
        };
    }, [commentImagePreview]);

    const handleCommentFileSelected = (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        if (commentImagePreview) URL.revokeObjectURL(commentImagePreview);
        setCommentImageFile(file);
        setCommentImagePreview(URL.createObjectURL(file));
    };

    const removeCommentImage = () => {
        if (commentImagePreview) URL.revokeObjectURL(commentImagePreview);
        setCommentImageFile(null);
        setCommentImagePreview(null);
        setCommentUploadProgress(0);
    };

    const handleSubmitComment = async () => {
        const trimmed = commentText.trim();
        if (!trimmed || isSubmitting || commentUploading) return;
        setIsSubmitting(true);
        try {
            let imagePayload = null;
            if (commentImageFile) {
                setCommentUploading(true);
                try {
                    const url = await uploadToCloudinary(commentImageFile, {
                        onProgress: (p) => setCommentUploadProgress(p)
                    });
                    imagePayload = { name: commentImageFile.name || '', link: url };
                } catch (err) {
                    console.error('Upload comment image failed', err);
                    enqueueSnackbar('Tải ảnh bình luận thất bại', { variant: 'error' });
                    // allow submitting comment without image if upload fails? abort to let user retry
                    setCommentUploading(false);
                    setIsSubmitting(false);
                    return;
                } finally {
                    setCommentUploading(false);
                }
            }

            if (onSubmitComment) {
                await onSubmitComment(p.id, trimmed, imagePayload);
            }
            setCommentText('');
            removeCommentImage();
        } catch (err) {
            console.error('submit comment failed', err);
        } finally {
            setIsSubmitting(false);
            setCommentUploadProgress(0);
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
                <Box sx={{px: 2, pt: 1}}>
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
            <Box sx={{px: 2, pt: 1}}>
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
                                onClick={() => {
                                    setSelectedIndex(idx);
                                    openLightboxAt(idx);
                                }}
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
                avatar={<Avatar src={avatarSrc}>{!avatarSrc && initialsFrom(author)}</Avatar>}
                title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>}
                subheader={<Typography variant="caption" color="text.secondary">Đăng bởi: {author} | {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</Typography>}
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
                    <Typography variant="subtitle2">Bình luận
                        ({p.comments?.count ?? commentsArray.length}):</Typography>
                    {commentsArray.map(c => {
                        const author = c.buyerName || c.buyer_name || c.userName || `Người dùng #${c.accountId ?? c.buyerId ?? '??'}`;
                        const time = c.createdAt ? new Date(c.createdAt).toLocaleString() : '';
                        return (
                            <Box key={c.id ?? c.createdAt} sx={{mb: 1}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                    <Typography variant="subtitle2">{author}</Typography>
                                    {time && <Typography variant="caption" color="text.secondary">{time}</Typography>}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {c.content}
                                </Typography>
                                {c.imageUrl && (
                                    <Box mt={1}>
                                        <Box
                                            component="img"
                                            src={c.imageUrl}
                                            alt="comment-image"
                                            onClick={() => openCommentLightbox(c.imageUrl)}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                boxShadow: 1
                                            }}
                                        />
                                    </Box>
                                )}
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
                        disabled={isSubmitting || commentUploading}
                        size="small"
                    />
                    <Box>
                        <input
                            id={`comment-image-${p.id}`}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleCommentFileSelected}
                        />
                        <label htmlFor={`comment-image-${p.id}`}>
                            <IconButton component="span" color="primary" size="large" aria-label="attach image">
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </Box>
                    <IconButton
                        color="primary"
                        onClick={handleSubmitComment}
                        disabled={isSubmitting || commentUploading || !commentText.trim()}
                        aria-label="gửi bình luận"
                        sx={{ alignSelf: 'flex-end' }}
                    >
                        {isSubmitting || commentUploading ? <CircularProgress size={20}/> : <SendIcon/>}
                    </IconButton>
                </Box>

                {commentImagePreview && (
                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                        <Box component="img" src={commentImagePreview} alt="preview" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }} />
                        <Box>
                            <Typography variant="body2">{commentImageFile?.name}</Typography>
                            {commentUploading && <Typography variant="caption">Uploading: {Math.round(commentUploadProgress)}%</Typography>}
                            <Button size="small" onClick={removeCommentImage}>Remove</Button>
                        </Box>
                    </Box>
                )}
            </CardContent>

            <CardActions>
                {productId && (
                    <Link href={productHref} target="_blank" rel="noopener" sx={{ml: 'auto'}}>
                        <Button size="small">Mở sản phẩm</Button>
                    </Link>
                )}
            </CardActions>

            {/* Lightbox dialog */}
            <Dialog open={lightboxOpen} onClose={closeLightbox} maxWidth="lg" fullWidth>
                <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1}}>
                    <Box/>
                    <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                        <IconButton onClick={prevLightbox} aria-label="previous image" size="large">
                            <ArrowBackIosNewIcon/>
                        </IconButton>
                        <IconButton onClick={nextLightbox} aria-label="next image" size="large">
                            <ArrowForwardIosIcon/>
                        </IconButton>
                        <IconButton onClick={closeLightbox} aria-label="close" size="large">
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2}}>
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

            <Dialog open={commentLightboxOpen} onClose={closeCommentLightbox} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
                    <IconButton onClick={closeCommentLightbox} size="large" aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    {commentLightboxSrc && (
                        <Box
                            component="img"
                            src={commentLightboxSrc}
                            alt="comment-large"
                            sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default BuyerPostCard;
