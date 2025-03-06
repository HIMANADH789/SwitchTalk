import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
    name: 'post',
    initialState: {
        type: 'personal', // Default type
    },
    reducers: {
        setType: (state, action) => {
            state.type = action.payload;
        }
    }
});

export const { setType } = postSlice.actions;
export default postSlice.reducer;
