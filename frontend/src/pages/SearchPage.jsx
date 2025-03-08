import { useState } from "react";
import axios from "axios";
import { Button, TextField, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, Box } from "@mui/material";

function Search() {
    const [searchResult, setSearchResult] = useState([]);
    const [form, setForm] = useState({ id: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/search`, form, { withCredentials: true });
            console.log(res.data);
            setSearchResult(prev => [...prev, res.data]);
        } catch {
            console.error("Error");
        }
    };

    const handleChange = (e) => {
        setForm({ [e.target.name]: e.target.value });
    };

    const handleFollow = async (e, id, type) => {
        e.preventDefault();
        try {
            if (type === 'user') {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/followUser`, { id }, { withCredentials: true });
                console.log(res.data.user);
            } else {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/followGroup`, { id }, { withCredentials: true });
                console.log(res.data);
            }
        } catch {
            console.error("Error");
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: "auto", mt: 3 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Search
                </Typography>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Enter ID"
                        name="id"
                        onChange={handleChange}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Search
                    </Button>
                </form>

                {searchResult.length > 0 && (
                    <Box mt={2}>
                        <Typography variant="h6">Search Results:</Typography>
                        <List>
                            {searchResult.map((result) =>
                                result.type === 'user' ? (
                                    result.status === 'none' ? (
                                        <ListItem key={result.searched._id} divider>
                                            <ListItemText primary={result.searched.username} />
                                            <ListItemSecondaryAction>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={(e) => handleFollow(e, result.searched._id, result.type)}
                                                >
                                                    Follow
                                                </Button>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ) : (
                                        <ListItem key={result.searched._id} divider>
                                            <ListItemText primary={result.searched.username} secondary={result.status} />
                                        </ListItem>
                                    )
                                ) : (
                                    result.status === 'none' ? (
                                        <ListItem key={result.searched._id} divider>
                                            <ListItemText primary={result.searched.name} />
                                            <ListItemSecondaryAction>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={(e) => handleFollow(e, result.searched._id, result.type)}
                                                >
                                                    Follow
                                                </Button>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ) : (
                                        <ListItem key={result.searched._id} divider>
                                            <ListItemText primary={result.searched.name} secondary={result.status} />
                                        </ListItem>
                                    )
                                )
                            )}
                        </List>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default Search;
