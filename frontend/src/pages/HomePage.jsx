
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMode } from "../redux/modeSlice";
import axios from "axios";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import {
    Typography,
    Button,
    FormControl,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Container
} from "@mui/material";

function Home() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const selectedMode = useSelector((state) => state.mode.selectedMode);
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);
    const modes = ["general", "hobby", "professional", "event"];

    useEffect(() => {
        if (!selectedMode) {
            dispatch(setMode("general"));
        }
    }, [dispatch, selectedMode]);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(
                `http://localhost:3000/post/getAllPosts?mode=${selectedMode}`,
                { withCredentials: true }
            );
            setPosts(res.data.posts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [selectedMode]);

    const handleLike = async (isLiked, postId) => {
        let toLike = !isLiked;
        await axios.get("http://localhost:3000/post/changeLike", {
            params: { toLike, postId },
            withCredentials: true
        });
        fetchPosts();
    };

    const handleShare = (postId) => {
        navigate('/selectFriends', { state: { postId } });
    };

    return (
        <Container maxWidth="md">
            
            <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                        value={selectedMode}
                        onChange={(e) => dispatch(setMode(e.target.value))}
                    >
                        {modes.map((mode) => (
                            <MenuItem key={mode} value={mode}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            <Typography variant="h4" sx={{ textAlign: "center", mb: 2, fontWeight: "bold", fontFamily: "Poppins" }}>
                Welcome, {user?.name || "User"}!
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
    {[
        { label: "Search", path: "/search" },
        { label: "Notifications", path: "/notifications" },
        { label: "Chats", path: "/allChats", state: { mode: selectedMode } },
        { label: "Create Group", path: "/group-creation", state: { mode: selectedMode } },
        { label: "Create Post", path: "/create-post", state: { type: 'personal', userId: user?._id, mode: selectedMode } }
    ].map(({ label, path, state }, index) => (
        <Button
            key={index}
            variant="contained"
            component={Link}
            to={path}
            state={state || undefined}
            sx={{
                backgroundColor: "black",
                color: "white",
                fontWeight: "bold",
                '&:hover': { backgroundColor: "black" }
            }}
        >
            {label}
        </Button>
    ))}
</Stack>


            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Posts
            </Typography>

            {posts.length > 0 ? (
                <Grid container spacing={2}>
                    {posts.map((p, index) => (
                        <Grid item xs={12} key={index}>
                            <Card
                                sx={{
                                    p: 2,
                                    backgroundColor: "#f2f2f2",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    maxWidth: "500px",
                                    width: "80%",
                                    margin: "auto",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                                }}
                                onClick={() => setExpandedPost(expandedPost === index ? null : index)}
                            >
                                {p.image && (
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            width: "100%",
                                            height: "400px",
                                            borderRadius: 2,
                                            objectFit: "cover"
                                        }}
                                        image={p.image}
                                        alt="Post"
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        {p.groupId ? p.groupId.name : p.userId.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
                                        <button onClick={() => handleLike(p.likes.includes(user._id), p._id)}>
                                            {p.likes.includes(user._id) ? "❤️" : "🤍"}
                                        </button> {p.likes.length} | 
                                        <button onClick={() => handleShare(p._id)}>🔄</button> {p.shares}
                                        <Button
                                            onClick={() => navigate("/post-comment", { state: { postId: p._id } })}
                                            sx={{ minWidth: 0, padding: 0, color: "gray" }}
                                        >
                                            <ChatBubbleOutlineIcon fontSize="small" />
                                        </Button>
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: expandedPost === index ? "unset" : 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                    >
                                        {p.content}
                                    </Typography>
                                    {expandedPost !== index && p.content.length > 100 && (
                                        <Typography variant="body2" color="primary">
                                            Click to see more...
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1" sx={{ textAlign: "center", color: "gray" }}>
                    No posts available for this mode.
                </Typography>
            )}
        </Container>
    );
}

export default Home;
