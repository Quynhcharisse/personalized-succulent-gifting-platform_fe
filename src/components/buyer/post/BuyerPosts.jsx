import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Stack, Typography} from '@mui/material';
import {createPostComment, viewPosts, updatePostComment} from '@/services/PostService.jsx';
import {viewProduct} from '@/services/ProductService.jsx';
import BuyerPostCard from './BuyerPostCard.jsx';
import BuyerCreatePost from './BuyerCreatePost.jsx';
import BuyerEmptyState from './BuyerEmptyState.jsx';

const POSTS_CACHE_KEY = 'buyer_posts_cache';
const PRODUCTS_CACHE_KEY = 'products_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

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
                        map[id] = {id: found.id, name: found.name || found.title || `Sản phẩm #${id}`};
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
        if (data) map[id] = {id: data.id ?? id, name: data.name ?? data.title ?? `Sản phẩm #${id}`};
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

    const normalizePosts = (data) => {
        const raw = Array.isArray(data) ? data : (data && Array.isArray(data.posts) ? data.posts : []);
        return raw.map(p => {
            const tags = Array.isArray(p?.tags?.postTags)
                ? p.tags.postTags.map(t => t.tagName)
                : (Array.isArray(p?.tags) ? p.tags : []);

            const comments = Array.isArray(p?.comments?.comments)
                ? p.comments.comments.map(c => ({
                    content: c.content || c.text || '',
                    buyerId: c.accountId || c.account_id || c.accountId,
                    buyerName: c.buyerName || c.userName || 'Ẩn danh',
                    ...c
                }))
                : (Array.isArray(p?.comments) ? p.comments : []);

            const product = p.product || (p.productId ? {id: p.productId, name: p.productName || '-'} : null);
            const images = Array.isArray(p?.images?.postImages) ? p.images.postImages : (Array.isArray(p?.images) ? p.images : []);

            return {
                ...p,
                tags,
                comments,
                product,
                images,
            };
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

                const seller = {id: p.sellerId, name: p.sellerName || `Người bán #${p.sellerId}`};

                const comments = (p.comments || []).map(c => ({
                    ...c,
                    buyerName: c.buyerName || c.buyer_name || `Người dùng #${c.buyerId}`
                }));

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
                <BuyerCreatePost onCreated={refresh} />
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
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default BuyerPosts;
