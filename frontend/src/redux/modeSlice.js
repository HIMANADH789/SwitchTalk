import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedMode: "general",
    friendId: null,  
    groupId: null, 
};

const modeSlice = createSlice({
    name: "mode",
    initialState,
    reducers: {
        setMode: (state, action) => {
            state.selectedMode = action.payload;
            
        },
        setFriendId: (state, action) => {
            state.friendId = action.payload;
            state.groupId = null; // Ensure only one is active
        },
        setGroupId: (state, action) => {
            state.groupId = action.payload;
            state.friendId = null; // Ensure only one is active
        },
    },
});

export const { setMode, setFriendId, setGroupId } = modeSlice.actions;
export default modeSlice.reducer;
