import { createContext, useContext, useState } from "react";
import { useData } from "../data/store.js";
import { isHeadOf } from "../data/queries.js";

// Remembers who is signed in.
// "Remember me" → localStorage (survives closing the browser), otherwise sessionStorage.

const SESSION_KEY = "npua-session";
const AuthContext = createContext(null);

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const data = useData();
  const [userId, setUserId] = useState(readSession);
  const user = data.users.find((u) => u.id === userId && u.active) ?? null;

  const login = (signedInUser, remember) => {
    try {
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, signedInUser.id);
    } catch {
      // storage blocked: the session just won't survive a refresh
    }
    setUserId(signedInUser.id);
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setUserId(null);
  };

  const value = {
    user,
    isDean: user?.type === "dean",
    headOf: isHeadOf(data, user), // the ամբիոն this user leads, or null
    can: (permission) => Boolean(user?.permissions.includes(permission)),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
