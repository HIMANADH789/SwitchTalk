import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';

function CreatePost() {
    const navigate = useNavigate();
    const type = useSelector((state) => state.post.type);
    const groupId = useSelector((state) => state.mode.groupId);
    const userId = useSelector((state) => state.user.userId);
    const mode = useSelector((state) => state.mode.selectedMode);

    const [form, setForm] = useState({ content: '', image: '', mode });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (type === 'personal') {
                await axios.post('http://localhost:3000/post/createPersonalPost', form, { withCredentials: true });
                navigate('/home');
            } else {
                await axios.post('http://localhost:3000/post/createGroupPost', { ...form, groupId, userId }, { withCredentials: true });
                navigate('/group');
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto', padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Create a Post
                </Typography>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <TextField
                        label="Enter content"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        label="Image URL"
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <Button variant="contained" color="primary" type="submit" fullWidth>
                        Post
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

export default CreatePost;
