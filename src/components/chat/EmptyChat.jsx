import React from "react";

function EmptyChat() {
  return (
    <div
      className="emptyChat"
      style={{
        flex: 2,
        borderLeft: "1px solid grey",
        borderRight: "1px solid grey",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: "20px",
        fontWeight: "bold",
        color: "rgb(86, 85, 85)",
        flexDirection: "column",
      }}
    >
      <p style={{ marginLeft: "250px" }}>Choose a chat to start chatting</p>
    </div>
  );
}

export default EmptyChat;
