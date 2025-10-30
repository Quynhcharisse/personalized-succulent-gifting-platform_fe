import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'psgp_cart_v1';

const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
};

const initialState = {
    items: loadFromStorage(), // each item: { id, name, status, size }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action) => {
            const { id, name, status, size } = action.payload;
            if (!id) return;
            const exists = state.items.find((it) => it.id === id && it.size === size);
            if (!exists) {
                state.items.push({ id, name, status, size });
                saveToStorage(state.items);
            }
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
    },
});

export const { addItem, removeItem, clear } = cartSlice.actions;
export default cartSlice.reducer;


