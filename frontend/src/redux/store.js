import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import modeReducer from "./modeSlice";
import postReducer from "./postSlice";

const persistConfig = {
    key: "root",
    storage,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

const store = configureStore({
    reducer: {
        user: persistedUserReducer,
        mode: modeReducer,
        post: postReducer,
    },
});

export const persistor = persistStore(store);
export default store;
