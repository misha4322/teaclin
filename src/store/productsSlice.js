import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue, getState }) => {
    try {

      
      const startTime = Date.now();
      const response = await axios.get(
        'https://tea-server-production.up.railway.app/api/products',
        {
          timeout: 10000,
          validateStatus: (status) => status < 500
        }
      );
      
      const duration = Date.now() - startTime;

      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      

      
      return response.data;
    } catch (error) {

      
      
      console.groupEnd();
      
      return rejectWithValue({
        message: 'Ошибка загрузки продуктов',
        details: {
          errorMessage: error.message,
          stack: error.stack,
          responseData: error.response?.data,
          responseStatus: error.response?.status
        }
      });
    } finally {
      console.log('[fetchProducts] Request finished');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    lastFetch: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        console.log('[productsSlice] Fetch products pending');
        state.status = 'loading';
        state.error = null;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log('[productsSlice] Fetch products fulfilled');
        console.log('Payload received:', action.payload);
        
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('[productsSlice] Fetch products rejected');
        console.error('Error payload:', action.payload);
        console.error('Error details:', action.error);
        
        state.status = 'failed';
        state.error = action.payload || {
          message: 'Unknown error',
          details: action.error
        };
      });
  },
});

export default productsSlice.reducer;
