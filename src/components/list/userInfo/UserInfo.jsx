import React from "react";
import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";
export default function UserInfo() {
  const { currentUser } = useUserStore();
  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "iconsavatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        {/* <img src="icons/more.png" alt="" />
        <img src="icons/video.png" alt="" />
        <img src="icons/edit.png" alt="" /> */}
        <button className="logout" onClick={() => auth.signOut()}>
          Log Out
        </button>
      </div>
    </div>
  );
}
