import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Stack, Typography} from '@mui/material';
import {createPostComment, updatePost, updatePostComment, viewPosts} from '@/services/PostService.jsx';
import {viewProduct} from '@/services/ProductService.jsx';
import BuyerPostCard from './BuyerPostCard.jsx';
import BuyerCreatePost from './BuyerCreatePost.jsx';
import BuyerEmptyState from './BuyerEmptyState.jsx';
import EditPostDialog from './EditPostDialog.jsx';
import {enqueueSnackbar} from 'notistack';
import {useLocation} from 'react-router-dom';
import {reloadFromStorage} from "@/store/slices/cartSlice.js";
import {useDispatch} from "react-redux";

const POSTS_CACHE_KEY = 'buyer_posts_cache';
const PRODUCTS_CACHE_KEY = 'products_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

const isValidName = (v) => {
    if (v == null) return false;
    if (typeof v !== 'string') return false;
    const s = v.trim();
    if (s === '') return false;
    const lower = s.toLowerCase();
    return !(lower === 'null' || lower === 'undefined');
};

const getFirstName = (source = {}, keys = [], fallback = '') => {
    for (const k of keys) {
        const val = source?.[k];
        if (isValidName(val)) return val;
    }
    return fallback;
};

const fetchProductsByIds = async (ids = []) => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (unique.length === 0) return {};

    // Try to get from cache first
    try {
        const cached = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
        if (cached) {
            const {data: cachedProducts, timestamp} = JSON.parse(cached);
            const now = Date.now();

            if (now - timestamp < CACHE_EXPIRY_TIME && Array.isArray(cachedProducts)) {
                // Find products from cache
                const map = {};
                unique.forEach(id => {
                    const found = cachedProducts.find(p => p.id?.toString() === id.toString());
                    if (found) {
                        const name = getFirstName(found, ['name', 'title'], `Sản phẩm #${id}`);
                        map[id] = {id: found.id, name};
                    }
                });

                // If we found all products in cache, return early
                if (Object.keys(map).length === unique.length) {
                    return map;
                }
            }
        }
    } catch (error) {
        console.error('Error reading products cache:', error);
    }

    // Fetch from API
    const productsResponse = await viewProduct(unique);
    const res = Array.isArray(productsResponse)
        ? productsResponse
        : (productsResponse?.data?.data ?? productsResponse?.data ?? productsResponse) ?? [];
    const map = {};
    unique.forEach((id, idx) => {
        const payload = res[idx];
        const data = payload?.data ?? payload;
        if (data) {
            const name = getFirstName(data, ['name', 'title'], `Sản phẩm #${id}`);
            map[id] = {id: data.id ?? id, name};
        }
    });

    // Update cache
    try {
        const cached = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
        let cachedProducts = [];
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.data && Array.isArray(parsed.data)) {
                cachedProducts = parsed.data;
            }
        }

        // Merge new products into cache
        const productsArray = Object.values(map);
        productsArray.forEach(newProduct => {
            const existingIndex = cachedProducts.findIndex(p => p.id?.toString() === newProduct.id?.toString());
            if (existingIndex >= 0) {
                cachedProducts[existingIndex] = newProduct;
            } else {
                cachedProducts.push(newProduct);
            }
        });

        sessionStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
            data: cachedProducts,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error updating products cache:', error);
    }

    return map;
};

const BuyerPosts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [products, setProducts] = useState([]);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        const raw = sessionStorage.getItem('user')

        if (!raw || raw === 'undefined') {
            setCurrentUser(null)
            return
        }

        try {
            const parsed = JSON.parse(raw)
            setCurrentUser(parsed || null)
        } catch (error) {
            setCurrentUser(null)
            sessionStorage.removeItem('user') // Xóa dữ liệu không hợp lệ
        }
    }, [location.pathname])

    // Fetch products for edit dialog
    useEffect(() => {
        let mounted = true;
        viewProduct()
            .then(res => {
                if (!mounted) return;
                const items = res?.data?.data || [];
                setProducts(items);
            })
            .catch(err => {
                console.error('Failed to load products', err);
                setProducts([]);
            });
        return () => { mounted = false; };
    }, []);


    const normalizePosts = (data, { sortBy = 'createdAt', order = 'desc' } = {}) => {
        const raw = Array.isArray(data) ? data : (data && Array.isArray(data.posts) ? data.posts : []);
        const mapped = raw.map(p => {
            const comments = Array.isArray(p?.comments?.comments)
                ? p.comments.comments.map(c => ({
                    content: c.content || c.text || '',
                    buyerId: c.accountId || c.account_id || c.accountId,
                    buyerName: getFirstName(c, ['buyerName', 'userName', 'buyer_name'], 'Ẩn danh'),
                    ...c
                }))
                : (Array.isArray(p?.comments) ? p.comments.map(c => ({
                    ...c,
                    buyerName: getFirstName(c, ['buyerName', 'userName', 'buyer_name'], 'Ẩn danh')
                })) : []);

            const product = p.product || (p.productId ? { id: p.productId, name: getFirstName(p, ['productName', 'product_name'], `Sản phẩm #${p.productId}`) } : null);
            const images = Array.isArray(p?.images?.postImages) ? p.images.postImages : (Array.isArray(p?.images) ? p.images : []);

            return {
                ...p,
                comments,
                product,
                images,
                createdAt: p.createdAt ?? null
            };
        });

        const toTime = (val) => {
            if (val == null || val === '') return 0;
            const t = typeof val === 'number' ? val : Date.parse(val);
            return Number.isNaN(t) ? 0 : t;
        };

        const multiplier = order === 'asc' ? 1 : -1;

        return mapped.sort((a, b) => {
            const av = toTime(a[sortBy] ?? a.createdAt);
            const bv = toTime(b[sortBy] ?? b.createdAt);
            return (av - bv) * multiplier;
        });
    };

    const getCachedPosts = () => {
        try {
            const cached = sessionStorage.getItem(POSTS_CACHE_KEY);
            if (!cached) return null;

            const {data, timestamp} = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - timestamp < CACHE_EXPIRY_TIME) {
                return data;
            }

            // Cache expired, remove it
            sessionStorage.removeItem(POSTS_CACHE_KEY);
            return null;
        } catch (error) {
            return null;
        }
    };

    const setCachedPosts = (data) => {
        try {
            sessionStorage.setItem(POSTS_CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error caching posts:', error);
        }
    };

    useEffect(() => {
        dispatch(reloadFromStorage())
    }, [currentUser, dispatch])

    useEffect(() => {
        const onRefreshEvent = () => refresh();
        window.addEventListener('buyerPostsRefresh', onRefreshEvent);
        return () => window.removeEventListener('buyerPostsRefresh', onRefreshEvent);
    }, []);

    useEffect(() => {
        const fetch = async () => {
            // Try to get from cache first
            const cachedPosts = getCachedPosts();
            if (cachedPosts) {
                setPosts(cachedPosts);
                setIsLoading(false);
                // Fetch fresh data in background (without loading indicator)
                fetchFreshData(false);
                return;
            }

            // No cache, fetch from API
            await fetchFreshData(true);
        };
        fetch();
    }, [refreshKey]);

    const fetchFreshData = async (showLoading = true) => {
        if (showLoading) {
            setIsLoading(true);
        }
        try {
            const res = await viewPosts();
            const payload = res?.data?.data ?? res?.data ?? res;
            const normalized = normalizePosts(payload);

            const productIds = normalized.map(p => p.product?.id ?? p.productId).filter(Boolean);

            const productsMap = await fetchProductsByIds(productIds);

            const enhanced = normalized.map(p => {
                const prodId = p.product?.id ?? p.productId;
                const productFromApi = prodId ? productsMap[prodId] : null;
                const product = {
                    ...(p.product || {}),
                    ...(productFromApi || {})
                };

                const sellerName = getFirstName(p, ['sellerName', 'seller_name'], `Người bán #${p.sellerId}`);
                const seller = {id: p.sellerId, name: sellerName};

                const comments = (p.comments || []).map(c => ({
                    ...c,
                    buyerName: getFirstName(c, ['buyerName', 'userName', 'buyer_name'], `Người dùng #${c.buyerId}`)
                }));

                // Ensure product.name always has a valid string
                if (product && !isValidName(product.name)) {
                    product.name = `Sản phẩm #${prodId ?? (p.productId ?? 'unknown')}`;
                }

                return {
                    ...p,
                    product,
                    seller,
                    comments
                };
            });

            setPosts(enhanced);
            setCachedPosts(enhanced); // Cache the data
        } catch (err) {
            console.error(err);
            if (showLoading) {
                setPosts([]);
            }
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    };

    const refresh = () => {
        // Clear cache to force fresh data
        sessionStorage.removeItem(POSTS_CACHE_KEY);
        setRefreshKey(k => k + 1);
    };

    const handleCreateComment = async (postId, content, image) => {
        try {
            const payload = { content };
            if (image) payload.imageUrl = image.link;
            await createPostComment(postId, payload);
            refresh();
        } catch (err) {
            console.error('Đăng bình luận thất bại', err);
        }
    };

    const handleEditComment = async (postId, commentId, content, image) => {
        try {
            // find original comment in current posts state so we can send a full payload
            const post = posts.find(p => String(p.id) === String(postId));
            const orig = post?.comments?.find(c => String(c.id) === String(commentId)) || {};

            // Build a full payload by merging original fields and replacing content/image
            const payload = { ...orig, content };

            if (image && image.link) {
                payload.imageUrl = image.link;
            } else if (image === null) {
                // explicit null signals "remove image"
                payload.imageUrl = null;
            } // if image is undefined, keep whatever orig had

            // remove local-only fields that might confuse the API
            delete payload.id;
            // optionally remove nested objects or client-only props if present
            delete payload._temp;
            delete payload.__typename;

            if (typeof updatePostComment !== 'function') {
                throw new Error('updatePostComment is not available');
            }

            const arity = updatePostComment.length;
            if (arity >= 3) {
                await updatePostComment(postId, commentId, payload);
            } else if (arity === 2) {
                await updatePostComment(commentId, payload);
            } else {
                try {
                    await updatePostComment(postId, commentId, payload);
                } catch (e) {
                    await updatePostComment(commentId, payload);
                }
            }

            refresh();
        } catch (err) {
            console.error('Cập nhật bình luận thất bại', err);
        }
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setEditDialogOpen(true);
    };

    const handleSavePost = async (postId, payload) => {
        try {
            await updatePost(postId, payload);
            enqueueSnackbar('Cập nhật bài viết thành công', { variant: 'success' });
            setEditDialogOpen(false);
            setEditingPost(null);
            refresh();
        } catch (err) {
            console.error('Update post failed', err);
            enqueueSnackbar('Cập nhật bài viết thất bại', { variant: 'error' });
            throw err;
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            // Prefer marking as ARCHIVED
            if (typeof updatePost === 'function') {
                await updatePost(postId, { status: 'ARCHIVED' });
            } else if (typeof deletePost === 'function') {
                // fallback if updatePost not available
                await deletePost(postId);
            } else {
                throw new Error('No update/delete API available');
            }

            enqueueSnackbar('Xóa bài viết thành công', { variant: 'success' });
            refresh();
        } catch (err) {
            console.error('Delete post failed', err);
            enqueueSnackbar('Xóa bài viết thất bại', { variant: 'error' });
        }
    };

    if (isLoading) {
        return (
            <Box sx={{maxWidth: 800, mx: 'auto', py: 6, textAlign: 'center'}}>
                <CircularProgress/>
                <Typography variant="body2" color="text.secondary" mt={2}>Đang tải bài đăng...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundImage: "url('/header.jpg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            py: 4
        }}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <BuyerCreatePost onCreated={refresh} currentUser={currentUser} />
                {posts.length === 0 ? (
                    <BuyerEmptyState onRefresh={refresh}/>
                ) : (
                    <Stack spacing={3}>
                        {posts.map(post => (
                            <BuyerPostCard
                                key={post.id}
                                post={post}
                                onSubmitComment={handleCreateComment}
                                onEditComment={handleEditComment}
                                onEditPost={handleEditPost}
                                onDeletePost={handleDeletePost}
                                currentUser={currentUser}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            <EditPostDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditingPost(null);
                }}
                post={editingPost}
                onSave={handleSavePost}
                products={products}
            />
        </Box>
    );
};

export default BuyerPosts;
