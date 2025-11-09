import ApprovalDashboard from "@/components/dashboard/ApprovalDashboard";
import LogoutConfirm from "@/components/LogoutConfirm";
import { useAuthStore } from "@/store/authStore";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";

const SupervisorScreen = () => {
  const role = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  if (role !== "supervisor") {
    return <Redirect href="/(tabs)/login" />;
  }

  return (
    <>
      <ApprovalDashboard
        title="Centro do Supervisor"
        subtitle="Revise e aprove justificativas e diários enviados pelos estagiários da sua empresa."
        onLogoutPress={() => setLogoutVisible(true)}
      />
      <LogoutConfirm
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => {
          await logout();
          setLogoutVisible(false);
          router.replace("/(tabs)/login");
        }}
      />
    </>
  );
};

export default SupervisorScreen;
