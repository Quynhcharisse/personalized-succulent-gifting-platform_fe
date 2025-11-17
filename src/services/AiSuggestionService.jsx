import axios from "axios";

/**
 * Get AI suggestion for custom request based on user query
 * Calls Dify AI API directly from frontend
 * @param {string} query - User's request description
 * @param {string} userId - Current user ID
 * @returns {Promise} Response with AI suggestion data
 */
export const getAiSuggestion = async (query, userId) => {
    const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';
    const DIFY_TOKEN = import.meta.env.VITE_DIFY_AI_TOKEN;

    if (!DIFY_TOKEN) {
        throw new Error('VITE_DIFY_AI_TOKEN is not configured in environment variables');
    }

    try {
        const response = await axios.post(
            DIFY_API_URL,
            {
                inputs: {},
                query: query,
                response_mode: "blocking",
                user: userId
            },
            {
                headers: {
                    'Authorization': `Bearer ${DIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response || null;
    } catch (error) {
        console.error('Error calling Dify AI:', error);
        throw error;
    }
};
