import { Stack, Redirect, SplashScreen, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore"; 

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const segments = useSegments();
    const inAuthGroup = segments[segments.length - 1] === 'login'; 
    const token = useAuthStore(state => state.token);

    useEffect(() => {
        if (token !== undefined) {
             SplashScreen.hideAsync();
        }
    }, [token]);

    if (!isAuthenticated && !inAuthGroup) {
        return <Redirect href="/(tabs)/login" />; 
    }
    if (isAuthenticated && inAuthGroup) {
        return <Redirect href="/(tabs)" />; 
    }
    return null; 
}

export default function RootLayout() {
  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastroaluno" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}