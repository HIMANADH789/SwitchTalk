import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Checkbox, FormControlLabel, Button, Typography, Paper, Box, CircularProgress } from "@mui/material";

const SelectToShare = () => {
    const navigate = useNavigate();
    const [mates, setMates] = useState([]);
    const [form, setForm] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { postId, chatId } = location.state || {};
    const { user } = useSelector((state) => state.user);
    const selectedMode = useSelector((state) => state.mode.selectedMode);

    useEffect(() => {
        const fetchMates = async () => {
            try {
                const res = await axios.get("http://localhost:3000/auth/getMates", {
                    params: { userId: user._id, mode: selectedMode },
                    withCredentials: true
                });
                setMates(res.data.mates);
            } catch (error) {
                console.error("Error fetching mates:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMates();
    }, [user._id, selectedMode]);

    const handleChange = (e, mate) => {
        const { checked } = e.target;
        setForm((prev) =>
            checked
                ? [...prev, mate] // Add when checked
                : prev.filter((m) => m._id !== mate._id) // Remove when unchecked
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:3000/auth/shareToMates",
                { form, postId, chatId },
                { withCredentials: true }
            );
            alert("Post Shared Successfully ✅");
            navigate("/home");
        } catch (error) {
            console.error("Error sending post:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: "auto", mt: 3 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Select Mates to Share
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : mates.length === 0 ? (
                    <Typography color="textSecondary">No mates available.</Typography>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {mates.map((m) => (
                            <FormControlLabel
                                key={m._id}
                                control={
                                    <Checkbox
                                        checked={form.some((mate) => mate._id === m._id)}
                                        onChange={(e) => handleChange(e, m)}
                                    />
                                }
                                label={m.name}
                            />
                        ))}
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Send
                        </Button>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default SelectToShare;
