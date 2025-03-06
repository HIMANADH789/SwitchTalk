import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, Box } from '@mui/material';

function GroupCreationForm() {
    const navigate = useNavigate();
    const mode = useSelector((state) => state.mode.selectedMode);
    
    const [form, setForm] = useState({ name: '', groupId: '', mode: '' });

    useEffect(() => {
        if (mode) {
            setForm((prevForm) => ({ ...prevForm, mode }));
        }
    }, [mode]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/group/createGroup', form, { withCredentials: true });

            if (res.data.message === 'Successful Creation') {
                navigate('/home');
            } else {
                alert('Failed to create');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Card sx={{ width: 400, p: 3, boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h5" textAlign="center" fontWeight="bold" mb={2}>
                        Create a Group
                    </Typography>
                    <form onSubmit={submitForm}>
                        <TextField
                            label="Group Name"
                            variant="outlined"
                            fullWidth
                            name="name"
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Group ID"
                            variant="outlined"
                            fullWidth
                            name="groupId"
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                fontWeight: "bold",
                                "&:hover": { backgroundColor: "#333" }
                            }}
                        >
                            Create
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}

export default GroupCreationForm;
