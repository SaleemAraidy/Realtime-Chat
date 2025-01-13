import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useChatStore } from "./lib/chatStore";
import { onSnapshot } from "firebase/firestore";
import EmptyChat from "./components/chat/EmptyChat";
const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, user } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => unSub();
  }, [fetchUserInfo]);

  console.log("App.jsx: Current user: " + currentUser);

  if (isLoading)
    return (
      <div className="loading">
        <Box sx={{ display: "flex" }}>
          <CircularProgress size={100} />
        </Box>
      </div>
    );

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId ? <Chat /> : <EmptyChat />}
          {/* {chatId && <Detail />} */}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
