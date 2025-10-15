import axiosClient from "../config/APIConfig.jsx";

// Create a new post
export const createPost = async (postData) => {
    const response = await axiosClient.post("/posts", postData);
    return response || null;
};

// View all posts
export const viewPosts = async () => {
    const response = await axiosClient.get("/posts");
    return response || null;
};

// View all posts by a specific seller
export const viewPostsBySeller = async (sellerId) => {
    const response = await axiosClient.get(`/posts/seller`);
    return response || null;
};

// View a post by ID
export const viewPost = async (id) => {
    const response = await axiosClient.get(`/posts/${id}`);
    return response || null;
};

// Update a post by ID
export const updatePost = async (id, postData) => {
    const response = await axiosClient.put(`/posts/${id}`, postData);
    return response || null;
};

// Delete a post by ID
export const deletePost = async (id) => {
    const response = await axiosClient.delete(`/posts/${id}`);
    return response || null;
};

// Create a comment on a post
export const createPostComment = async (postId, commentData) => {
    const response = await axiosClient.post(`/posts/${postId}/comments`, commentData);
    return response || null;
};

// Update a comment by ID
export const updatePostComment = async (commentId, commentData) => {
    const response = await axiosClient.put(`/posts/comments/${commentId}`, commentData);
    return response || null;
};

// Delete a comment by ID
export const deletePostComment = async (commentId) => {
    const response = await axiosClient.delete(`/posts/comments/${commentId}`);
    return response || null;
};

// Get all post tags
export const getPostTags = async () => {
    const response = await axiosClient.get("/posts/tags");
    return response || null;
};