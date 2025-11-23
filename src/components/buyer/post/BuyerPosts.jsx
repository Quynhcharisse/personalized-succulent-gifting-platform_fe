import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Stack, Typography} from '@mui/material';
import {createPostComment, viewPosts} from '@/services/PostService.jsx';
import {viewProduct} from '@/services/ProductService.jsx';
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
        if (data) map[id] = {id: data.id ?? id, name: data.name ?? data.title ?? `Sản phẩm #${id}`};
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

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
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
            await createPostComment(postId, {content});
            refresh();
        } catch (err) {
            console.error('Đăng bình luận thất bại', err);
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
                {posts.length === 0 ? (
                    <BuyerEmptyState onRefresh={refresh}/>
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
        </Box>
    );
};

export default BuyerPosts;
