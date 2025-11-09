import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";

const TabsLayout = () => {
  const userRole = useAuthStore((state) => state.userRole);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const segments = useSegments();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: "none",
        gestureEnabled: false
      }}
    >
      {/* Tela de login sempre disponível */}
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }} 
      />
      
      <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="cadastroaluno" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="professor" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="supervisor" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="coordenador" options={{ headerShown: false, gestureEnabled: false }} />
      
      {/* Redireciona usuários não autenticados para o login */}
      {!isAuthenticated && <Redirect href="/(tabs)/login" />}
      
      {/* Redireciona usuários autenticados para suas respectivas telas */}
      {isAuthenticated && userRole === "aluno" && segments[1] === "login" && (
        <Redirect href="/(tabs)" />
      )}
      {isAuthenticated && userRole === "coordenador" && segments[1] === "login" && <Redirect href="/(tabs)/coordenador" />}
      {isAuthenticated && userRole === "professor" && segments[1] === "login" && <Redirect href="/(tabs)/professor" />}
      {isAuthenticated && userRole === "supervisor" && segments[1] === "login" && <Redirect href="/(tabs)/supervisor" />}
      {isAuthenticated && userRole === "admin" && segments[1] === "login" && <Redirect href="/(tabs)/admin" />}
    </Stack>
  );
};

export default TabsLayout;
