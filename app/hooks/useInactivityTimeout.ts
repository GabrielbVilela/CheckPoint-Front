import { useAuthStore } from "@/store/authStore";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { AppState } from "react-native";

const INACTIVITY_TIMEOUT = 4 * 60 * 1000;

export const useInactivityTimeout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    clearTimer();
    logout()
      .catch((error) => {
        console.error("Erro ao encerrar sessao por inatividade:", error);
      })
      .finally(() => {
          router.replace("/(tabs)/login" as any);
        });
  }, [clearTimer, logout, router]);

  const resetTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(handleTimeout, INACTIVITY_TIMEOUT);
  }, [clearTimer, handleTimeout]);

  useFocusEffect(
    useCallback(() => {
      resetTimer();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          resetTimer();
        } else {
          clearTimer();
        }
      });

      return () => {
        clearTimer();
        subscription.remove();
      };
    }, [resetTimer, clearTimer])
  );

  return { resetTimer };
};

export default useInactivityTimeout;