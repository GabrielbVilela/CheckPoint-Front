import ApprovalDashboard from "@/components/dashboard/ApprovalDashboard";
import LogoutConfirm from "@/components/LogoutConfirm";
import AvaliacaoPanel from "@/components/dashboard/AvaliacaoPanel";
import { useAuthStore } from "@/store/authStore";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";

const ProfessorScreen = () => {
  const role = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  if (role !== "professor") {
    return <Redirect href="/(tabs)/login" />;
  }

  return (
    <>
      <ApprovalDashboard
        title="Painel do Professor"
        subtitle="Acompanhe justificativas e diários pendentes da sua turma."
        onLogoutPress={() => setLogoutVisible(true)}
      >
        <AvaliacaoPanel />
      </ApprovalDashboard>
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

export default ProfessorScreen;
