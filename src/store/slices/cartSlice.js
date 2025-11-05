import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY_PREFIX = 'psgp_cart_v1';

const getScopedStorageKey = () => {
    try {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return `${STORAGE_KEY_PREFIX}_guest`;
        const parsed = JSON.parse(rawUser);
        const userIdentifier = parsed?.id || parsed?.userId || parsed?.email || 'guest';
        return `${STORAGE_KEY_PREFIX}_${userIdentifier}`;
    } catch {
        return `${STORAGE_KEY_PREFIX}_guest`;
    }
};

const loadFromStorage = () => {
    try {
        const key = getScopedStorageKey();
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (items) => {
    try {
        const key = getScopedStorageKey();
        localStorage.setItem(key, JSON.stringify(items));
    } catch {}
};

const initialState = {
    items: loadFromStorage(), // each item: { id, name, status, size, image, quantity, price }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action) => {
            const { id, name, status, size, image, price } = action.payload || {};
            if (!id) return;
            const exists = state.items.find((it) => it.id === id && it.size === size);
            if (exists) {
                const currentQty = Number(exists.quantity || 1);
                exists.quantity = currentQty + 1;
                if (image && !exists.image) exists.image = image;
                if (price != null) exists.price = price;
            } else {
                state.items.push({ id, name, status, size, image, quantity: 1, price });
            }
            saveToStorage(state.items);
        },
        removeItem: (state, action) => {
            const { id, size } = typeof action.payload === 'object' ? action.payload : { id: action.payload };
            state.items = state.items.filter((it) => !(it.id === id && (size ? it.size === size : true)));
            saveToStorage(state.items);
        },
        clear: (state) => {
            state.items = [];
            saveToStorage(state.items);
        },
        reloadFromStorage: (state) => {
            state.items = loadFromStorage();
        },
    },
});

export const { addItem, removeItem, clear, reloadFromStorage } = cartSlice.actions;
export default cartSlice.reducer;


