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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {enqueueSnackbar} from 'notistack';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import {createProductSlug} from '@utils/slugUtil.js';
import {updatePostComment} from "@/services/PostService.jsx";

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

const BuyerPostCard = ({ post = {}, onSubmitComment, onEditComment, onEditPost, onDeletePost, currentUser = null }) => {
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

    // comment input state (new comment)
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // comment image state (single image for new comment)
    const [commentImageFile, setCommentImageFile] = useState(null);
    const [commentImagePreview, setCommentImagePreview] = useState(null);
    const [commentUploading, setCommentUploading] = useState(false);
    const [commentUploadProgress, setCommentUploadProgress] = useState(0);

    // edit comment state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editUploading, setEditUploading] = useState(false);
    const [editUploadProgress, setEditUploadProgress] = useState(0);

    const [deletingCommentId, setDeletingCommentId] = useState(null);

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
            if (editImagePreview) URL.revokeObjectURL(editImagePreview);
        };
    }, [commentImagePreview, editImagePreview]);

    const handleCommentFileSelected = (e) => {
        if (!isLoggedIn) {
            // redirect to sign-in page
            window.location.href = '/login';
            return;
        }
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
        if (!isLoggedIn) {
            // redirect to sign-in page
            window.location.href = '/login';
            return;
        }
        const trimmed = commentText.trim();
        if (!trimmed || isSubmitting || commentUploading) return;
        setIsSubmitting(true);
        try {
            let imagePayload = null;
            if (commentImageFile) {
                setCommentUploading(true);
                try {
                    const url = await uploadToCloudinary(commentImageFile, {
                        onProgress: p => setCommentUploadProgress(p)
                    });
                    imagePayload = { name: commentImageFile.name || '', link: url };
                } catch (err) {
                    enqueueSnackbar('Upload ảnh bình luận thất bại', { variant: 'error' });
                    console.error(err);
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
            enqueueSnackbar('Gửi bình luận thất bại', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
            setCommentUploadProgress(0);
        }
    };

    // --- Edit comment handlers ---
    const startEdit = (c) => {
        if (!isCommentOwner(c)) {
            enqueueSnackbar('Bạn chỉ có thể chỉnh sửa bình luận của chính mình', { variant: 'warning' });
            return;
        }
        setEditingCommentId(c.id);
        setEditText(c.content || c.text || '');
        setEditImageFile(null);
        setEditImagePreview(c.imageUrl || c.image || null);
    };

    const cancelEdit = () => {
        if (editImagePreview) URL.revokeObjectURL(editImagePreview);
        setEditingCommentId(null);
        setEditText('');
        setEditImageFile(null);
        setEditImagePreview(null);
        setEditUploading(false);
        setEditUploadProgress(0);
    };

    const handleEditFileSelected = (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        if (editImagePreview) URL.revokeObjectURL(editImagePreview);
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const removeEditImage = () => {
        if (editImagePreview) URL.revokeObjectURL(editImagePreview);
        setEditImageFile(null);
        setEditImagePreview(null);
        setEditUploadProgress(0);
    };

    const submitEdit = async (commentId) => {
        // verify ownership before submitting
        const orig = commentsArray.find(cc => String(cc.id) === String(commentId));
        if (!isCommentOwner(orig)) {
            enqueueSnackbar('Không có quyền chỉnh sửa bình luận này', { variant: 'warning' });
            return;
        }

        const trimmed = editText.trim();
        if (!trimmed || editUploading) return;
        setEditUploading(true);
        try {
            let imagePayload = null;
            if (editImageFile) {
                try {
                    const url = await uploadToCloudinary(editImageFile, {
                        onProgress: p => setEditUploadProgress(p)
                    });
                    imagePayload = { name: editImageFile.name || '', link: url };
                } catch (err) {
                    enqueueSnackbar('Upload ảnh thất bại', { variant: 'error' });
                    console.error(err);
                    setEditUploading(false);
                    return;
                }
            } else if (editImagePreview) {
                imagePayload = { name: '', link: editImagePreview };
            }

            // call parent handler: (postId, commentId, content, image)
            if (typeof onEditComment === 'function') {
                await onEditComment(p.id, commentId, trimmed, imagePayload);
                enqueueSnackbar('Cập nhật bình luận thành công', { variant: 'success' });
            }
            cancelEdit();
        } catch (err) {
            console.error('edit comment failed', err);
            enqueueSnackbar('Cập nhật bình luận thất bại', { variant: 'error' });
        } finally {
            setEditUploading(false);
            setEditUploadProgress(0);
        }
    };

    const handleDeleteComment = async (commentId) => {
        // ensure owner before delete
        const orig = commentsArray.find(c => String(c.id) === String(commentId));
        if (!isCommentOwner(orig)) {
            enqueueSnackbar('Không có quyền xóa bình luận này', { variant: 'warning' });
            return;
        }

        if (!commentId) return;
        const ok = window.confirm('Bạn có chắc muốn xóa bình luận này?');
        if (!ok) return;

        setDeletingCommentId(commentId);
        try {
            // Build payload marking status as DELETED
            const payload = { ...orig, status: 'DELETED' };

            // remove local-only fields that might confuse the API
            delete payload.id;
            delete payload._temp;
            delete payload.__typename;

            if (typeof updatePostComment !== 'function') {
                throw new Error('updatePostComment is not available');
            }

            const arity = updatePostComment.length;
            if (arity >= 3) {
                await updatePostComment(p.id, commentId, payload);
            } else if (arity === 2) {
                await updatePostComment(commentId, payload);
            } else {
                // fallback try both
                try {
                    await updatePostComment(p.id, commentId, payload);
                } catch (e) {
                    await updatePostComment(commentId, payload);
                }
            }

            enqueueSnackbar('Xóa bình luận thành công', { variant: 'success' });
            window.dispatchEvent(new Event('buyerPostsRefresh'));
        } catch (err) {
            console.error('Delete (mark DELETED) comment failed', err);
            enqueueSnackbar('Xóa bình luận thất bại', { variant: 'error' });
        } finally {
            setDeletingCommentId(null);
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
                                component="img"
                                src={img.link || img.url}
                                alt={img.name || `img-${idx}`}
                                onClick={() => openLightboxAt(idx)}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    gridArea
                                }}
                            />
                        );
                    })}
                </Box>
            </Box>
        );
    };

    // ownership helper: determines if the given comment belongs to current user
    const isCommentOwner = (c) => {
        if (!c || currentUser == null) return false;
        const owner = c.name || c.buyerName || c.userId || c.user?.id || c.buyer_id || c.account_id || c.user?.name;
        if (owner == null) return false;
        return String(owner) === String(currentUser.user?.name);
    };

    // comment input section: disable if not logged in
    const isLoggedIn = currentUser != null;

    // Check if current user is the post owner
    const isPostOwner = () => {
        if (!currentUser || !p) return false;
        const postOwnerId = p.userName;
        return String(currentUser.user.name) === String(postOwnerId);
    };

    const handleEditPost = () => {
        if (!isPostOwner()) {
            enqueueSnackbar('Bạn chỉ có thể chỉnh sửa bài viết của chính mình', { variant: 'warning' });
            return;
        }
        if (onEditPost) onEditPost(p);
    };

    const handleDeletePost = async () => {
        if (!isPostOwner()) {
            enqueueSnackbar('Bạn chỉ có thể xóa bài viết của chính mình', { variant: 'warning' });
            return;
        }
        const ok = window.confirm('Bạn có chắc muốn xóa bài viết này?');
        if (!ok) return;
        if (onDeletePost) await onDeletePost(p.id);
    };

    return (
        <Card>
            <CardHeader
                avatar={<Avatar src={avatarSrc}>{!avatarSrc && initialsFrom(author)}</Avatar>}
                title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>}
                subheader={<Typography variant="caption" color="text.secondary">Đăng bởi: {author} | {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</Typography>}
                action={
                    isPostOwner() && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={handleEditPost} title="Sửa bài viết">
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleDeletePost} title="Xóa bài viết">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )
                }
            />

            {renderImagesGrid()}

            <CardContent>
                <Typography variant="body1" paragraph>
                    {p.description || '-'}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2">Sản phẩm:</Typography>
                    {productId ? (
                        <Link href={productHref} target="_blank" rel="noopener" sx={{ ml: 1 }}>
                            <Typography sx={{ fontWeight: 600 }}>{productName}</Typography>
                        </Link>
                    ) : (
                        <Typography color="text.secondary">Không có sản phẩm liên kết</Typography>
                    )}
                </Stack>

                <Stack mt={2} spacing={1}>
                    <Typography variant="subtitle2">Bình luận ({p.comments?.count ?? commentsArray.length}):</Typography>

                    {commentsArray.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Chưa có bình luận</Typography>
                    )}

                    {commentsArray.map((c) => {
                        const commenterName = c.buyerName || c.buyer_name || c.userName || c.user?.name || c.name || 'Ẩn danh';
                        // prefer comment-level avatar fields
                        const commentAvatarSrc =
                            c.userAvatar ||
                            c.user?.avatar ||
                            c.user?.avatarUrl ||
                            c.buyerAvatar ||
                            c.sellerAvatar ||
                            c.authorAvatar ||
                            c.accountAvatar ||
                            c.avatarUrl ||
                            null;

                        const isEditing = editingCommentId && String(editingCommentId) === String(c.id);
                        const own = isCommentOwner(c);

                        return (
                            <Box key={c.id ?? `${p.id}-c-${Math.random()}`} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Avatar src={commentAvatarSrc} sx={{ width: 40, height: 40 }}>
                                    {!commentAvatarSrc && initialsFrom(commenterName)}
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="subtitle2">{commenterName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {c.createdAt ? ` • ${new Date(c.createdAt).toLocaleString()}` : ''}
                                        </Typography>

                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                            {/* edit only for own comments */}
                                            {!isEditing && own && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => startEdit(c)}
                                                    aria-label="edit-comment"
                                                    title="Sửa"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            )}

                                            {/* save/cancel when editing (only for owner) */}
                                            {isEditing && own && (
                                                <>
                                                    <Button size="small" onClick={() => submitEdit(c.id)} disabled={editUploading}>
                                                        {editUploading ? 'Đang lưu...' : 'Lưu'}
                                                    </Button>
                                                    <Button size="small" onClick={cancelEdit}>Huỷ</Button>
                                                </>
                                            )}

                                            {/* delete only for own comments */}
                                            {own && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteComment(c.id)}
                                                    aria-label="delete-comment"
                                                    title="Xóa"
                                                    disabled={deletingCommentId === c.id}
                                                >
                                                    {deletingCommentId === c.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>

                                    {!isEditing ? (
                                        <>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content || c.text || c.message}</Typography>

                                            { (c.imageUrl || c.image) && (
                                                <Box mt={1}>
                                                    <Box
                                                        component="img"
                                                        src={c.imageUrl || c.image}
                                                        alt="comment-image"
                                                        onClick={() => openCommentLightbox(c.imageUrl || c.image)}
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
                                        </>
                                    ) : (
                                        <Box mt={1} display="flex" flexDirection="column" gap={1}>
                                            <TextField
                                                value={editText}
                                                onChange={e => setEditText(e.target.value)}
                                                multiline
                                                minRows={2}
                                                fullWidth
                                                size="small"
                                            />

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <label htmlFor={`edit-comment-file-${c.id}`}>
                                                    <input
                                                        id={`edit-comment-file-${c.id}`}
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={handleEditFileSelected}
                                                    />
                                                    <IconButton component="span" size="small">
                                                        <PhotoCamera fontSize="small" />
                                                    </IconButton>
                                                </label>

                                                <Button size="small" onClick={() => removeEditImage()}>Remove image</Button>

                                                {editUploading && <CircularProgress size={18} />}
                                            </Stack>

                                            {editImagePreview && (
                                                <Box component="img" src={editImagePreview} alt="edit-preview" sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }} />
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>

                {/* comment input */}
                {isLoggedIn ? (
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
                ) : (
                    <Box mt={2} p={2} borderRadius={1} bgcolor="#f9f9f9" display="flex" flexDirection="column" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                            Bạn cần đăng nhập để bình luận. Vui lòng nhấn vào nút dưới đây để đăng nhập.
                        </Typography>
                        <Button variant="contained" color="primary" size="small" onClick={() => { window.location.href = '/login'; }}>
                            Đăng nhập
                        </Button>
                    </Box>
                )}

                {commentImagePreview && (
                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                        <Box component="img" src={commentImagePreview} alt="preview" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }} />
                        <Box>
                            <Typography variant="body2">{commentImageFile?.name}</Typography>
                            <Box>
                                <Button size="small" onClick={removeCommentImage}>Remove</Button>
                            </Box>
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
