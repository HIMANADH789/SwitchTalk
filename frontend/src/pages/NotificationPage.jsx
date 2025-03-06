import { useState, useEffect } from "react";
import axios from "axios";
import { Button, List, ListItem, Typography, Paper, Box } from "@mui/material";

function Notifications() {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("http://localhost:3000/auth/notifications", {
                withCredentials: true,
            });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleAccept = async (e, endpoint, payload) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:3000/auth/${endpoint}`, payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            fetchNotifications(); // Refresh notifications
        } catch (err) {
            console.error(`Error accepting ${endpoint}:`, err.message);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: "auto", mt: 3 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
                    Notifications
                </Typography>

                {notifications.length === 0 ? (
                    <Typography variant="body1" sx={{ textAlign: "center" }}>
                        No notifications yet
                    </Typography>
                ) : (
                    <List>
                        {notifications.map((notif) => (
                            <ListItem
                                key={notif._id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                    borderBottom: "1px solid #ddd",
                                    paddingBottom: 1,
                                }}
                            >
                                <Typography variant="body1">
                                    {notif.type === "follow" && (
                                        <>
                                            <strong>{notif.senderId?.name}</strong> sent you a friend request
                                        </>
                                    )}
                                    {notif.type === "post" && (
                                        <>
                                            <strong>New Post:</strong> {notif.post?.title}
                                        </>
                                    )}
                                    {notif.type === "group" && (
                                        <>
                                            <strong>{notif.groupId?.name}</strong> invited you to join
                                        </>
                                    )}
                                    {notif.type === "group-follower" && (
                                        <>
                                            <strong>{notif.senderId?.name}</strong> wants to follow{" "}
                                            <strong>{notif.groupId?.name}</strong>
                                        </>
                                    )}
                                </Typography>

                                {(notif.type === "follow" || notif.type === "group" || notif.type === "group-follower") && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={(e) =>
                                            handleAccept(e, 
                                                notif.type === "follow" ? "acceptFriend" :
                                                notif.type === "group" ? "acceptGroup" : 
                                                "acceptGroupFollow",
                                                notif.type === "group-follower" ? { fid: notif.senderId, id: notif.groupId } : { id: notif.senderId || notif.groupId }
                                            )
                                        }
                                    >
                                        Accept
                                    </Button>
                                )}
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}

export default Notifications;
