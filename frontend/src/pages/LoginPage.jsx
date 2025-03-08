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
    Box 
} from "@mui/material";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form, setForm] = useState({ username: "", password: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, form, { withCredentials: true });
          
                dispatch(setUser(res.data.user)); 
                navigate("/home");
           
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center", borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
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
                        Login
                    </Button>
                </form>
                <Box mt={2}>
                    <Typography variant="body2">
                        Don't have an account?{" "}
                        <Button onClick={() => navigate("/register")} sx={{ textTransform: "none" }}>
                            Register
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;
