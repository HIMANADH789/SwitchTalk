import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { TextField, Button, List, ListItem, Typography, Paper, Box } from "@mui/material";

function PostComment() {
    const [comments, setComments] = useState([]);
    const [form, setForm] = useState({ comment: "" });

    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const postId = location.state?.postId;

    useEffect(() => {
        if (postId) fetchPostComments();
    }, [postId]);

    const fetchPostComments = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/getPostComments`, {
                params: { postId },
                withCredentials: true,
            });
            setComments(res.data.comments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.comment.trim()) return; // Prevent empty comments

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/post/addPostComment`, {
                ...form,
                userId: user?._id, // Ensure user exists before using _id
                postId,
            }, { withCredentials: true });

            setForm({ comment: "" }); // Clear input field
            fetchPostComments();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", mt: 3 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Comments</Typography>

                {comments.length === 0 ? (
                    <Typography variant="body1">No comments yet</Typography>
                ) : (
                    <List>
                        {comments.map((c) => (
                            <ListItem key={c._id} sx={{ borderBottom: "1px solid #ddd", paddingBottom: 1, mb: 1 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="primary">
                                        {c.userId?.name} - {new Date(c.createdAt).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body1">{c.text}</Typography>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Write a comment..."
                        name="comment"
                        value={form.comment}
                        onChange={handleChange}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Send
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

export default PostComment;
