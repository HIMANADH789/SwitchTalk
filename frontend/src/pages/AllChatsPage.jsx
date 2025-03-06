import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setFriendId, setGroupId } from "../redux/modeSlice";
import { Box, Typography, List, ListItem, Avatar, Paper, ListItemAvatar, ListItemText, Divider } from "@mui/material";

function AllChats() {
    const dispatch = useDispatch();
    const selectedMode = useSelector((state) => state.mode.selectedMode);
    const [allChats, setAllChats] = useState([]);

    useEffect(() => {
        const fetchAllChats = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/chat/allChats`, {
                    params: { mode: selectedMode },
                    withCredentials: true,
                });
                setAllChats(response.data.chatList);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };

        fetchAllChats();
    }, [selectedMode]);

    return (
        <Box sx={{ width: 700, margin: "auto", mt: 4 }}> {/* Increased width */}
            <Typography variant="h5" gutterBottom align="center">
                Chats
            </Typography>
            
            <Paper sx={{ borderRadius: 3, boxShadow: 3, p: 1 }}> {/* Added padding */}
                <List>
                    {allChats.map((ch, index) => (
                        <div key={ch._id}>
                           <ListItem 
    component={Link}
    to={ch.type === "private" ? "/chats" : "/group"}
    sx={{
        textDecoration: "none",
        color: "inherit",
        width: "100%",
        display: "flex",
        alignItems: "center",
        py: 1.5,
        "&:hover": { backgroundColor: "#f5f5f5" },
    }}
    onClick={() => {
        if (ch.type === "private") {
            dispatch(setFriendId(ch._id));
        } else {
            dispatch(setGroupId(ch._id));
        }
    }}
>
    <ListItemAvatar>
        <Avatar 
            src={ch.profilePic || "/default-avatar.png"} 
            sx={{ bgcolor: ch.type === "private" ? "blue" : "green", width: 50, height: 50 }} 
        />
    </ListItemAvatar>
    
    {/* Wrap inside Box to add padding */}
    <Box sx={{ pl: "50px", width: "100%" }}> 
        <ListItemText 
            primary={ch.name} 
            secondary={ch.type === "private" ? "Private Chat" : "Group Chat"} 
            primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 500 }} 
            secondaryTypographyProps={{ fontSize: "0.9rem", color: "gray" }}
        />
    </Box>
</ListItem>

                            {index !== allChats.length - 1 && <Divider />} {/* Add divider between items */}
                        </div>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}

export default AllChats;
