// <!-- SPDX-License-Identifier: Apache-2.0 -->
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { ReactNode } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getUser } from "./service";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import qs from "qs";


export interface IUserProfile {
  clientId: string | null;
  username: string;
  platformRoleIds: string[];
  privileges: string[];
}
interface ILoginPasswordForm {
  username: string;
  password: string;
}

// IMPORTANT: Define the structure of LoginResponseDto in your frontend too
// You can put this in a separate types file or directly here.
interface LoginResponseDto {
    token_type: string;
    scope: string;
    access_token: string;
    expires_in: number;
    refresh_token: string | null;
    refresh_expires_in: number | null;
    id_token: string | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (data: ILoginPasswordForm) => Promise<{
    status: number;
    message: string;
  }>;
  logout: () => void;
  isLoading: boolean;
  setIsLoading(value: boolean): void;
  profile: IUserProfile;
  error: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const unprotectedRoutes = ["/login", "/sign-up", "/reset-password", "/forgot-password", "/verify"];
const AuthProvider = ({ children }: { ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const router = useRouter();
  const [profile, setProfile] = useState<IUserProfile>({
    privileges: [],
    clientId: "",
    platformRoleIds: [],
    username: "",
  });
  const params = useSearchParams();
  const currentPath = router.pathname;

  useEffect(() => {
    setIsLoading(true);
    setAuthError("");
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      getUser()
        .then(({ data }) => {
          if (unprotectedRoutes.includes(currentPath)) {
            router
              .push("/")
              .finally(() => {
                setProfile(data);
                localStorage.setItem("config_svc_username", data.username);
                setIsAuthenticated(true);
                setToken(storedToken);
                setIsLoading(false);
              })
              .catch(Promise.resolve);
          } else {
            setProfile(data);
            localStorage.setItem("config_svc_username", data.username);
            setIsAuthenticated(true);
            setToken(storedToken);
            setIsLoading(false);
          }
        })
        .catch(() => {
          Promise.resolve();
          localStorage.removeItem("token");
          localStorage.removeItem("config_svc_username");
          setIsAuthenticated(false);
          router.push(`/login?next=${currentPath}`).catch(Promise.resolve)
          .then(() => {
            setIsLoading(false);
          });
        });
    } else {
      if (unprotectedRoutes.includes(currentPath)) {
        setIsAuthenticated(false);
        setIsLoading(false);
      } else {
        router
          .push(`/login?next=${currentPath}`)
          ?.then(() => {
            setIsAuthenticated(false);
            setIsLoading(false);
          })
          .catch(() => {
            Promise.resolve();
            setIsAuthenticated(false);
            setIsLoading(false);
          });
      }
    }
  }, []);

  const login = useCallback(async (data: ILoginPasswordForm) => {
      setIsLoading(true);
      setAuthError("");

      try {
        const formData = qs.stringify({
          username: data.username,
          password: data.password,
          client_id: process.env.NEXT_PUBLIC_SECURITY_BC_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_SECURITY_BC_SECRET,
          grant_type: "password",
        });

        // Explicitly type the response data to match your backend DTO
        const response = await axios.post<LoginResponseDto>( // <--- Added type here
          `${process.env.NEXT_PUBLIC_CONFIG_SVC_BE_URL}/api/auth/login`,
          formData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        // --- THIS IS THE CRUCIAL CHANGE ---
        // Extract the actual JWT from the 'access_token' property of the response object
        const token = response.data.access_token; // <--- CHANGED THIS LINE

        // Store token
        localStorage.setItem("token", token);
        localStorage.setItem("config_svc_username", data.username);

        // Fetch user profile
        const userData = await getUser();

        // Redirect and update auth state
        router
          .push(params.get("next") || "/")
          .then(() => {
            setProfile(userData.data);
            setToken(token);
            setIsAuthenticated(true);
            setIsLoading(false);
          })
          .catch(Promise.resolve);

        return {
          status: 200,
          message: "",
        };
      } catch (error: any) {
        setAuthError(error?.response?.data?.message || error.message || "Unable to login");
        return {
          status: error?.response?.status,
          message: error?.message,
        };
      } finally {
        setIsLoading(false);
      }
    }, []);


  const logout = useCallback(() => {
    setIsLoading(true);

    const unprotectedRoutes = [
      "/login",
      "/sign-up",
      "/reset-password",
      "/forgot-password",
      "/verify",
    ];
    const nextRoute = unprotectedRoutes.includes(router.pathname) ? "" : `?next=${router.pathname}`;
    router.push(`/login${nextRoute}`).finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("config_svc_username");
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    });
  }, []); // Added missing dependency for useCallback

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      token,
      isLoading,
      setIsLoading,
      profile,
      error: authError,
    }),
    [isAuthenticated, login, logout, isLoading, profile, authError, token], // Added missing dependencies for useMemo
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };