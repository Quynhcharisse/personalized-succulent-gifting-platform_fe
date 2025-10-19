import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { viewPosts, createPostComment } from '../../../services/PostService.jsx';
import { viewProduct } from '../../../services/ProductService.jsx';
import BuyerPostCard from './BuyerPostCard.jsx';
import BuyerEmptyState from './BuyerEmptyState.jsx';

const fetchProductsByIds = async (ids = []) => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (unique.length === 0) return {};
    const productsResponse = await viewProduct(unique);
    const res = Array.isArray(productsResponse)
        ? productsResponse
        : (productsResponse?.data?.data ?? productsResponse?.data ?? productsResponse) ?? [];
    const map = {};
    unique.forEach((id, idx) => {
        const payload = res[idx];
        const data = payload?.data ?? payload;
        if (data) map[id] = { id: data.id ?? id, name: data.name ?? data.title ?? `Product #${id}` };
    });
    return map;
};

const fetchUsersByIds = async (ids = []) => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (unique.length === 0) return {};
    const res = await Promise.all(unique.map(id =>
        fetch(`/api/users/${id}`).then(r => r.json().catch(() => null))
    ));
    const map = {};
    unique.forEach((id, idx) => {
        const payload = res[idx];
        const data = payload?.data ?? payload;
        if (data) map[id] = { id: data.id ?? id, name: data.name ?? data.username ?? `User #${id}` };
    });
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
                    buyerName: c.buyerName || c.userName || 'Anonymous',
                    ...c
                }))
                : (Array.isArray(p?.comments) ? p.comments : []);

            const product = p.product || (p.productId ? { id: p.productId, name: p.productName || '-' } : null);
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

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const res = await viewPosts();
                // payload may be at res.data.data or res.data
                const payload = res?.data?.data ?? res?.data ?? res;
                const normalized = normalizePosts(payload);

                // collect ids
                const productIds = normalized.map(p => p.product?.id ?? p.productId).filter(Boolean);
                const sellerIds = normalized.map(p => p.sellerId).filter(Boolean);
                const commenterIds = normalized.flatMap(p => (p.comments || []).map(c => c.buyerId)).filter(Boolean);
                const userIds = Array.from(new Set([...sellerIds, ...commenterIds]));

                // fetch products and users in parallel
                const [productsMap, usersMap] = await Promise.all([
                    fetchProductsByIds(productIds),
                    fetchUsersByIds(userIds)
                ]);

                // inject names
                const enhanced = normalized.map(p => {
                    const prodId = p.product?.id ?? p.productId;
                    const productFromApi = prodId ? productsMap[prodId] : null;
                    const product = {
                        ...(p.product || {}),
                        ...(productFromApi || {})
                    };

                    const seller = usersMap[p.sellerId] ? usersMap[p.sellerId] : { id: p.sellerId, name: p.sellerName || `Seller #${p.sellerId}` };

                    const comments = (p.comments || []).map(c => {
                        const author = usersMap[c.buyerId] ?? {};
                        return {
                            ...c,
                            buyerName: c.buyerName || author.name || c.buyerName || `User #${c.buyerId}`
                        };
                    });

                    return {
                        ...p,
                        product,
                        seller,
                        comments
                    };
                });

                setPosts(enhanced);
            } catch (err) {
                console.error(err);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [refreshKey]);

    const refresh = () => setRefreshKey(k => k + 1);

    const handleCreateComment = async (postId, content) => {
        try {
            await createPostComment(postId, { content });
            refresh();
        } catch (err) {
            console.error('Failed to post comment', err);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', py: 6, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" mt={2}>Loading posts...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
            <Typography variant="h4" fontWeight={700} mb={3}>Seller Posts</Typography>

            {posts.length === 0 ? (
                <BuyerEmptyState onRefresh={refresh} />
            ) : (
                <Stack spacing={3}>
                    {posts.map(post => (
                        <BuyerPostCard
                            key={post.id}
                            post={post}
                            onSubmitComment={handleCreateComment}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default BuyerPosts;
