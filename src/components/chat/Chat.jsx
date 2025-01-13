import React from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [chat, setChat] = React.useState();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [img, setImg] = React.useState({
    file: null,
    url: "",
  });

  const endRef = React.useRef(null);
  const { chatId, user, isCurrentUserBlocked, isRecieverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isRecieverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavopr: "smooth" });
  }, [chat?.messages]);

  React.useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => unSub();
  }, [chatId]);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleEmojiClick = (event) => {
    setText((prev) => prev + event.emoji);
    //setIsEmojiPickerOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      setImg({
        file: newFile,
        url: URL.createObjectURL(newFile),
      });
      setText("📷 Photo");
      handleSend();
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "/icons/avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor sit amet</p>
          </div>
        </div>
        <div className="buttons">
          <button onClick={handleBlock} disabled={isCurrentUserBlocked}>
            {isCurrentUserBlocked
              ? "You are Blocked."
              : isRecieverBlocked
              ? "Unblock User"
              : "Block User"}
          </button>
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser.id ? "my message" : "message"
            }
            key={message.createdAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/*<span>5 min ago</span>*/}
            </div>
          </div>
        ))}
        {/*  {img.url && (
          <div className="my message">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )} */}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img
              src="/icons/img.png"
              alt=""
              style={{
                opacity: isCurrentUserBlocked || isRecieverBlocked ? 0.5 : 1,
              }}
            />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
            disabled={isCurrentUserBlocked || isRecieverBlocked}
          />
          {/*<img src="/icons/camera.png" alt="" />
          <img src="/icons/mic.png" alt="" />*/}
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked
              ? "You cannot send messages."
              : isRecieverBlocked
              ? "Unblock user to chat"
              : "Type a message..."
          }
          onChange={handleChange}
          value={text}
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        />
        <div className="emojis">
          <img
            src="/icons/emoji.png"
            alt=""
            style={{
              opacity: isCurrentUserBlocked || isRecieverBlocked ? 0.5 : 1,
            }}
            onClick={() => {
              if (!(isCurrentUserBlocked || isRecieverBlocked)) {
                setIsEmojiPickerOpen((prev) => !prev);
              }
            }}
          />
          <div className="picker">
            <EmojiPicker
              open={isEmojiPickerOpen}
              onEmojiClick={handleEmojiClick}
            />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
