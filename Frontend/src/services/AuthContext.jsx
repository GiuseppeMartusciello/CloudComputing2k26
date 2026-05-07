import { createContext, useContext, useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { getMe } from "../services/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState(null);

  // MSAL Login con Redirect
  const login = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error("Login failed:", e);
    });
  };

  // MSAL Logout con Redirect alla Home
  const logout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
      account: accounts[0],
    }).catch((e) => {
      console.error("Logout failed:", e);
    });
  };

  // Effetto per recuperare il profilo utente dal backend dopo il login
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      // Possiamo recuperare i dati dell'utente dal token o dal nostro backend
      getMe()
        .then((me) => {
          setUser(me);
        })
        .catch((err) => {
          console.error("Errore recupero profilo:", err);
          // Se il backend non riconosce ancora l'utente (es. prima volta), lo gestiremo
        });
    } else {
      setUser(null);
    }
  }, [isAuthenticated, accounts, instance]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isAuthenticated,
        user,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
