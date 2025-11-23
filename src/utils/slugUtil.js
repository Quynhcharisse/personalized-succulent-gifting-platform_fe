/**
 * Convert product name to URL-friendly slug
 * @param {string} name - Product name
 * @returns {string} - URL-friendly slug
 */
export const createSlug = (name) => {
    if (!name) return '';
    
    // Handle object names
    const nameStr = typeof name === 'object' ? JSON.stringify(name) : String(name);
    
    return nameStr
        .toLowerCase()
        .normalize('NFD') // Normalize Vietnamese characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Create product URL slug (NO ID for security)
 * Format: slug only (e.g., "sen-da-dep")
 * @param {string} name - Product name
 * @param {number|string} id - Product ID (used internally, not in URL)
 * @returns {string} - URL slug without ID
 */
export const createProductSlug = (name, id) => {
    const slug = createSlug(name);
    // Return only slug, no ID for security
    // If slug is empty, create a hash-like slug from ID (still not exposing direct ID)
    if (!slug && id) {
        // Create a simple hash from ID to avoid exposing direct ID
        // This is a fallback only when name is completely empty
        const hash = String(id).split('').reverse().join('') + 'x';
        return `product-${hash}`;
    }
    return slug;
};

/**
 * Find product by slug from products array
 * @param {string} slug - Product slug
 * @param {Array} products - Array of products
 * @returns {Object|null} - Found product or null
 */
export const findProductBySlug = (slug, products) => {
    if (!slug || !products || !Array.isArray(products)) return null;
    
    // Normalize slug for comparison
    const normalizedSlug = slug.toLowerCase().trim();
    
    // Try to find exact match first
    for (const product of products) {
        const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;
        const productSlug = createSlug(productName);
        if (productSlug === normalizedSlug) {
            return product;
        }
    }
    
    // If no exact match, try partial match (for backward compatibility with old URLs)
    // This handles cases where old URLs might have ID at the end
    const slugWithoutId = normalizedSlug.replace(/-\d+$/, ''); // Remove trailing -number
    if (slugWithoutId !== normalizedSlug) {
        for (const product of products) {
            const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;
            const productSlug = createSlug(productName);
            if (productSlug === slugWithoutId) {
                return product;
            }
        }
    }
    
    return null;
};

/**
 * Create slug from product ID only (fallback when name is not available)
 * @param {number|string} id - Product ID
 * @returns {string} - URL slug
 */
export const createSlugFromId = (id) => {
    return `product-${id}`;
};

