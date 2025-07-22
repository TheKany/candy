import { useEffect } from "react";

export const useResetData = (handleResetStore: () => void) => {
  useEffect(() => {
    const handlePopState = () => {
      handleResetStore();
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      handleResetStore();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [handleResetStore]);
};
