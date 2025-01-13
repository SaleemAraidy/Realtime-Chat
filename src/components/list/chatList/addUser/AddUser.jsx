import React, { useState } from "react";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";
import {
  buttonGroupClasses,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function AddUser({ close }) {
  const [user, setUser] = useState(null); // The user to be added not us.
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isUserAdded = async (user) => {
    console.log("###### in isUserAdded user is", user);
    const userChatsRef = doc(collection(db, "userchats"), currentUser.id);
    const currentUserChatsDoc = await getDoc(userChatsRef);
    if (currentUserChatsDoc.exists()) {
      const currentUserChats = currentUserChatsDoc.data().chats;
      console.log("***** \\\\\\\\ currentUserChats is", currentUserChats);
      const chatExists = currentUserChats.some(
        (chat) => String(chat.recieverId) === String(user.id)
      );
      console.log("********* is user adeed ??", chatExists);
      return chatExists;
    } else {
      console.log("No chats found for current user.");
      return false;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data();
        console.log("==================Found user:", foundUser);
        setUser(foundUser);
        const addedStatus = await isUserAdded(foundUser);
        setIsAdded(addedStatus);
      } else {
        setUser(null);
        setIsAdded(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    setLoading(true);

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      console.log("new doc id:", newChatRef.id);
      setIsAdded(true);
    } catch (error) {
      console.error(error);
      setIsAdded(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addUser">
      <IconButton
        className="close-btn"
        onClick={() => close()}
        color="default"
        style={{ marginBottom: "50px" }}
      >
        <CloseIcon style={{ marginBottom: "50px" }} />
      </IconButton>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./icons/avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          {loading ? (
            <CircularProgress />
          ) : isAdded ? (
            <button className="added" disabled={true}>
              Added
            </button>
          ) : (
            <button onClick={handleAdd}>Add user</button>
          )}
        </div>
      )}
    </div>
  );
}
