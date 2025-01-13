import React from "react";
import "./login.css";
import { toast } from "react-toastify";
import { auth, db } from "../../lib/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import upload from "../../lib/upload.js";
import authErrorMessages from "../../lib/errorMessages.js";

const Login = () => {
  const [avatar, setAvatar] = React.useState({
    file: null,
    url: "/icons/avatar.png",
  });

  const [loadingLogin, setLoadingLogin] = React.useState(false);
  const [loadingSignup, setLoadingSignup] = React.useState(false);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      setAvatar({
        file: newFile,
        url: URL.createObjectURL(newFile),
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!", {
        autoClose: 1500,
      });
    } catch (error) {
      console.log(error);
      const errorMessage =
        authErrorMessages[error.code] ||
        "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoadingSignup(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("This Username is Unavailable");
        return;
      }
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = avatar.file
        ? await upload(avatar.file)
        : "/icons/avatar.png";
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("User registered successfully!", {
        autoClose: 3000,
      });
    } catch (error) {
      console.log(error);
      const errorMessage =
        authErrorMessages[error.code] ||
        "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingSignup(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back!</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loadingSignup || loadingLogin}>
            {loadingLogin ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img
              src={avatar.url || "/icons/avatar.png"}
              alt="Avatar Preview"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            />
            <p>Upload an image</p>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loadingSignup || loadingLogin}>
            {loadingSignup ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
