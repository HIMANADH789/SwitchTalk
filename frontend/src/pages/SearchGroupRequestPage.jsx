import { useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { TextField, Button, List, ListItem, Typography, Paper, Box } from "@mui/material";

function SearchGroupRequest() {
    const location = useLocation();
    const [searchResult, setSearchResult] = useState([]);
    const [form, setForm] = useState({ id: "" });
    const groupId = location.state?.groupId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:3000/auth/searchGroupRequest",
                { ...form, groupId },
                { withCredentials: true }
            );
            setSearchResult(res.data); // Fix: Ensure `res.data` is an array
        } catch (error) {
            console.error("Error searching:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value }); // Fix: Preserve form state
    };

    const handleFollow = async (e, id, type) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:3000/auth/reqUserForFollowGroup",
                { id, groupId },
                { withCredentials: true }
            );
            alert("Follow request sent! ✅");
        } catch (error) {
            console.error("Error sending follow request:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: "auto", mt: 3 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Search Group Request</Typography>

                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
                    <TextField
                        fullWidth
                        label="User ID"
                        variant="outlined"
                        name="id"
                        value={form.id}
                        onChange={handleChange}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Search
                    </Button>
                </form>

                {searchResult.length > 0 && (
                    <Box mt={3}>
                        <Typography variant="h6">Search Results:</Typography>
                        <List>
                            {searchResult.map((result) => (
                                <ListItem
                                    key={result.searched._id}
                                    sx={{ borderBottom: "1px solid #ddd", paddingBottom: 1, mb: 1 }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1">{result.searched.username}</Typography>
                                        {result.status === "none" ? (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={(e) => handleFollow(e, result.searched._id, result.type)}
                                                sx={{ mt: 1 }}
                                            >
                                                Request to Follow
                                            </Button>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                {result.status}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default SearchGroupRequest;
