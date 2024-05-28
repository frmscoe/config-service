/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { ReactNode } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getUser } from "./service";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";

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
const AuthProvider = ({ children }: { children: ReactNode }) => {
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
                setIsAuthenticated(true);
                setToken(storedToken);
                setIsLoading(false);
              })
              .catch(Promise.resolve);
          } else {
            setProfile(data);
            setIsAuthenticated(true);
            setToken(storedToken);
            setIsLoading(false);
          }
        })
        .catch(() => {
          Promise.resolve();
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          router.push(`/login?next=${currentPath}`).catch(Promise.resolve);
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
      const response = await axios.post(
        `/api/token`,
        {
          ...data,
          client_id: process.env.NEXT_PUBLIC_SECURITY_BC_CLIENT_ID,
          grant_type: "password",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      const userData = await getUser();
      router
          .push(params.get("next") || "/")
          .then(() => {
            setProfile(userData.data);
            setToken(access_token);
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
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    });
  }, [token]);

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
    [login, logout, isLoading, profile],
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
