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
            const { id, name, quantity, size, image, price } = action.payload || {};
            if (!id) return;
            const normalizedQty = Math.max(1, Number(quantity || 1));
            const exists = state.items.find((it) => it.id === id && it.size === size);
            if (exists) {
                const currentQty = Number(exists.quantity || 0);
                exists.quantity = currentQty + normalizedQty;
                if (image && !exists.image) exists.image = image;
                if (price != null) exists.price = price;
                if (name && !exists.name) exists.name = name;
            } else {
                state.items.push({ id, name, size, image, quantity: normalizedQty, price });
            }
            saveToStorage(state.items);
        },
        incrementQuantityBySize: (state, action) => {
            const { id, size, delta } = action.payload || {};
            if (!id) return;
            const amount = Number(delta ?? 1);
            const target = state.items.find((it) => it.id === id && it.size === size);
            if (!target) return;
            const currentQty = Number(target.quantity || 0);
            const nextQty = Math.max(1, currentQty + amount);
            target.quantity = nextQty;
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

export const { addItem, incrementQuantityBySize, removeItem, clear, reloadFromStorage } = cartSlice.actions;
export default cartSlice.reducer;


