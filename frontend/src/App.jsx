import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import store, { persistor } from "./redux/store";
import ProtectRoute from "./ProtectRoute";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import SearchGroupRequestPage from "./pages/SearchGroupRequestPage";
import NotificationPage from "./pages/NotificationPage";
import AllChatsPage from "./pages/AllChatsPage";
import ChatPage from "./pages/ChatPage";
import GroupPage from "./pages/GroupPage";
import AboutPage from "./pages/AboutPage";
import CreateRoom from "./pages/CreateRoom";
import GroupRoom from "./pages/GroupRoom";
import GroupCreationForm from "./pages/GroupCreationForm";
import CreatePost from "./pages/CreatePost";
import PostComment from "./pages/PostComment";
import SelectToShare from "./pages/SelectToShare";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#ff4081",
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e",
        },
        text: {
            primary: "#ffffff",
            secondary: "#b0b0b0",
        },
    },
    typography: {
        fontFamily: "Roboto, sans-serif",
    },
});

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />
                             
                           
                            <Route path="/home" element={<ProtectRoute element={<HomePage />} />} />
                            <Route path="/notifications" element={<ProtectRoute element={<NotificationPage />} />} />
                            <Route path="/search" element={<ProtectRoute element={<SearchPage />} />} />
                            <Route path="/search-group-request" element={<ProtectRoute element={<SearchGroupRequestPage />} />} />
                            <Route path="/allChats" element={<ProtectRoute element={<AllChatsPage />} />} />
                            <Route path="/chats" element={<ProtectRoute element={<ChatPage />} />} />
                            <Route path="/group-creation" element={<ProtectRoute element={<GroupCreationForm />} />} />
                            <Route path="/group" element={<ProtectRoute element={<GroupPage />} />} />
                            <Route path="/about" element={<ProtectRoute element={<AboutPage />} />} />
                            <Route path="/create-post" element={<ProtectRoute element={<CreatePost />} />} />
                            <Route path="/post-comment" element={<ProtectRoute element={<PostComment />} />} />
                            <Route path="/create-room" element={<ProtectRoute element={<CreateRoom />} />} />
                            <Route path="/group-room" element={<ProtectRoute element={<GroupRoom />} />} />
                            <Route path="/selectFriends" element={<ProtectRoute element={<SelectToShare />} />} />

                            <Route path="*" element={<LoginPage />} />
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
