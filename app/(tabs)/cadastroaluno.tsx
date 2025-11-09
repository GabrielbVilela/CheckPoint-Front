import CatalogDashboard from "@/components/dashboard/CatalogDashboard";
import StudentManager from "@/components/catalog/StudentManager";
import ImportAlunosWizard from "@/components/catalog/ImportAlunosWizard";
import ReportsSnapshot from "@/components/dashboard/ReportsSnapshot";
import LogoutConfirm from "@/components/LogoutConfirm";
import { useAuthStore } from "@/store/authStore";
import { Redirect, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";

const ALLOWED_ROLES = ["admin", "coordenador"];

const CadastroAlunoScreen = () => {
  const role = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const subtitle = useMemo(() => {
    if (role === "admin") {
      return "Centralize o cadastro completo de estagiários (dados + contrato) no mesmo fluxo dos demais cadastros.";
    }
    if (role === "coordenador") {
      return "Cadastre alunos e acompanhe contratos ativos com o mesmo padrão visual de turmas, empresas e supervisores.";
    }
    return "Cadastre alunos reutilizando o mesmo padrão visual dos demais múdulos.";
  }, [role]);

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return <Redirect href="/(tabs)/login" />;
  }

  const handleInformImport = () => {
    Alert.alert(
      "Importações em massa",
      "Role até o card 'Importação de alunos (CSV)' para enviar o arquivo. O modelo esperado está descrito no componente."
    );
  };

  return (
    <>
      <CatalogDashboard
        title="Cadastro e importação de alunos"
        subtitle={subtitle}
        onLogoutPress={() => setLogoutVisible(true)}
        actions={[
          {
            label: "Abrir fluxo individual",
            description: "Utilize o botão 'Novo aluno' para iniciar o formulário completo dentro do modal.",
            onPress: () => Alert.alert("Cadastro individual", "Use o card 'Cadastro individual de aluno' para iniciar."),
          },
          {
            label: "Importação via CSV",
            description: "Disponível no card abaixo com pré-visualização dos registros.",
            onPress: handleInformImport,
          },
        ]}
      >
        <StudentManager />
        <ImportAlunosWizard />
        <ReportsSnapshot />
      </CatalogDashboard>
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

export default CadastroAlunoScreen;
