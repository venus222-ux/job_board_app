import { useEffect } from "react";
import { useStore } from "./store/useStore";

export const useAuthRefresh = () => {
  const { isAuth, startTokenRefreshLoop } = useStore();

  useEffect(() => {
    if (isAuth) startTokenRefreshLoop();
  }, [isAuth, startTokenRefreshLoop]);
};
