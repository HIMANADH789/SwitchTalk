import { useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Paper,
  Box,
} from "@mui/material";

function SearchGroupRequest() {
  const location = useLocation();
  const [searchResult, setSearchResult] = useState([]); // array of users
  const [status, setStatus] = useState(""); // single status string
  const [form, setForm] = useState({ id: "" });
  const groupId = location.state?.groupId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("with groupId:", groupId);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/searchGroupRequest`,
        { ...form, groupId },
        { withCredentials: true }
      );

      // Response structure: { searched: [ { user } ], status: "none" }
      const data = res.data;
      if (data && Array.isArray(data.searched)) {
        setSearchResult(data.searched);
        setStatus(data.status || "");
      } else {
        setSearchResult([]);
        setStatus("");
      }

      console.log("Normalized data:", data);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResult([]);
      setStatus("");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFollow = async (e, id) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/reqUserForFollowGroup`,
        { id, groupId },
        { withCredentials: true }
      );
      alert("Follow request sent!");
    } catch (error) {
      console.error("Error sending follow request:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 3 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Search Group Request
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
        >
          <TextField
            fullWidth
            label="User ID (username)"
            variant="outlined"
            name="id"
            value={form.id}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </form>

        {searchResult.length > 0 ? (
          <Box mt={3}>
            <Typography variant="h6">Search Results:</Typography>
            <List>
              {searchResult.map((user, index) => (
                <ListItem
                  key={user._id || index}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    paddingBottom: 1,
                    mb: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {user.username || user.name || "Unknown User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {status}
                  </Typography>

                  {status === "none" && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => handleFollow(e, user._id)}
                    >
                      Request to Follow
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No results found
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default SearchGroupRequest;
