import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: null,
    friendId: null,
    groupId: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setMode: (state, action) => { state.mode = action.payload; },
        setFriendId: (state, action) => { state.friendId = action.payload; },
        setGroupId: (state, action) => { state.groupId = action.payload; },
        resetChatState: () => initialState, // Reset state when needed
    },
});

export const { setMode, setFriendId, setGroupId, resetChatState } = chatSlice.actions;
export default chatSlice.reducer;
