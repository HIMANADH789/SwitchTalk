import React, { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

function CreateRoom() {
  const navigate = useNavigate();
  const groupId = useSelector((state) => state.mode.groupId);
  const { user } = useSelector((state) => state.user);
  const userId= user._id;

  const [form, setForm] = useState({
    name: "",
    group: groupId,
    type: "chat",
    about: "",
    admin: userId,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/room/createRoom`, form, {
        withCredentials: true,
      });
      navigate("/group-room", { state: { roomId: res.data.roomId } });
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Create a Room
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Room Name"
            name="name"
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="About"
            name="about"
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Room Type</InputLabel>
            <Select name="type" value={form.type} onChange={handleChange}>
              <MenuItem value="chat">Chat</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5, fontSize: "1rem" }}
          >
            Create Room
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateRoom;