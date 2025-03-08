import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function AboutPage() {
  const [details, setDetails] = useState(null); 
  const friendId = useSelector((state) => state.mode.friendId);
  const groupId = useSelector((state) => state.mode.groupId);
  const id = friendId==null?groupId:friendId;
  console.log(id);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/about`, {
          params: { id },
          withCredentials: true,
        });
        console.log(res.data.details)
        setDetails(res.data.details);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    }
    fetchDetails();
  }, [id]); // Add id as a dependency

  if (!details) {
    return <h2>Loading...</h2>; // Prevents undefined errors before fetching
  }

  return (
    <div>
      {details.type === "user" ? (
        <div>
          <img src={details.profilePic} alt="Profile" />
          <h2>
            {details.name} - {details.username}
          </h2>
          <h3>Following {details.following?.length || 0}</h3>
          <h3>Followers {details.followers?.length || 0}</h3>
          <h3>Groups {details.groups?.length || 0}</h3>

          <ul>
            {details.posts?.map((p) => (
              <li key={p._id}>
                {p.image && <img src={p.image} alt="Post" />}
                <p>{p.content}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <img src={details.profilePic} alt="Group" />
          <h2>
            {details.name} - {details.groupId}
          </h2>
          <h3>Members {(details.members?.length || 0) + (details.admin?.length || 0)}</h3>

          <ul>
            {details.posts?.map((p) => (
              <li key={p._id}>
                {p.image && <img src={p.image} alt="Post" />}
                <p>{p.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {details.type === "group" && details.aliveRooms?.length > 0 ? (
        <div>
         
          {details.aliveRooms.map((r) => (
            <Link key={r} to="/group-room" state={{ roomId: r }}>
              {r}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default AboutPage;
