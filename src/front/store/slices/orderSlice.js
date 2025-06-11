import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  isToGo: false,
};

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addToOrder: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.total = calculateTotal(state.items);
    },
    removeFromOrder: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = calculateTotal(state.items);
    },
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(item => item.id !== itemId);
        }
      }
      state.total = calculateTotal(state.items);
    },
    clearOrder: (state) => {
      state.items = [];
      state.total = 0;
    },
    setIsToGo: (state, action) => {
      state.isToGo = action.payload;
    }
  },
});

export const {
  addToOrder,
  removeFromOrder,
  updateItemQuantity,
  clearOrder,
  setIsToGo,
} = orderSlice.actions;

export default orderSlice.reducer;
