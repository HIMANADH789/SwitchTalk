import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/userSlice";
import { 
    Container, 
    TextField, 
    Button, 
    Typography, 
    Paper, 
    Box, 
    Alert 
} from "@mui/material";

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form, setForm] = useState({ username: "", name: "", email: "", password: "" });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, form, { withCredentials: true });

            if (res.data.message === "Registration successful!") {
                dispatch(setUser(res.data.user)); 
                navigate("/home"); 
            } else {
                setError("Registration failed. Try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center", borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Register
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Username"
                        name="username"
                        variant="outlined"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Name"
                        name="name"
                        variant="outlined"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        variant="outlined"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        name="password"
                        type="password"
                        variant="outlined"
                        onChange={handleChange}
                        required
                    />
                    <Button 
                        type="submit" 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 2, mb: 1 }}
                    >
                        Register
                    </Button>
                </form>
                <Box mt={2}>
                    <Typography variant="body2">
                        Already have an account?{" "}
                        <Button onClick={() => navigate("/login")} sx={{ textTransform: "none" }}>
                            Login
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default Register;
