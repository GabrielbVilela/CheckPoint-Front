import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { usePointRegistration } from "@/hooks/usePointRegistration";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import "expo-router/entry";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 80,
  },
  mainTitle: {
    color: "#000",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 50,
  },
  pointCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 15,
    borderWidth: 1,
    elevation: 3,
    maxWidth: 350,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: "90%",
  },
  userInfoBox: {
    alignItems: "flex-start",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 10,
    width: "100%",
  },
  collaboratorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userInfoText: {
    color: "#333",
    fontSize: 14,
  },
  timeText: {
    color: "#333",
    fontSize: 50,
    fontWeight: "bold",
  },
  dateText: {
    color: "#666",
    fontSize: 18,
    marginBottom: 40,
  },
  mainButton: {
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 15,
    width: "100%",
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  confirmationText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
  },
  cancelButton: {
    backgroundColor: "#E53935",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#E53935",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
});

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const fullDate = date.toLocaleDateString("pt-BR");
  return { time, fullDate };
};

const PointScreenAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  const userRole = useAuthStore((state) => state.userRole);

  const {
    pointData,
    loading: isProcessing,
    error: pointError,
    capturePoint,
    confirmPointRegistration,
    cancelConfirmation,
  } = usePointRegistration();

  const [localTime, setLocalTime] = useState(new Date().toISOString());
  const isAluno = userRole === "aluno";
  const { resetTimer } = useInactivityTimeout();

  const handleCapturePoint = useCallback(() => {
    resetTimer();
    capturePoint();
  }, [resetTimer, capturePoint]);

  const handleConfirmPointRegistration = useCallback(() => {
    resetTimer();
    confirmPointRegistration();
  }, [resetTimer, confirmPointRegistration]);

  const handleCancelConfirmation = useCallback(() => {
    resetTimer();
    cancelConfirmation();
  }, [resetTimer, cancelConfirmation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayTimestamp = useMemo(
    () => (pointData ? pointData.timestamp : localTime),
    [pointData, localTime]
  );

  const { time, fullDate } = formatTimestamp(displayTimestamp);

  if (!isAluno) {
    return (
      <TouchableWithoutFeedback onPress={resetTimer}>
        <View style={[styles.container, { justifyContent: "center" }]}>
          <Text style={styles.mainTitle}>ACESSO RESTRITO</Text>
          <Text style={styles.errorText}>
            Seu perfil ({userRole?.toUpperCase()}) nao tem acesso a esta tela.
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  if (pointData) {
    return (
      <TouchableWithoutFeedback onPress={resetTimer}>
        <View style={styles.container}>
          <Text style={styles.mainTitle}>PONTO ELETRONICO</Text>

          <View style={styles.pointCard}>
            <View style={styles.userInfoBox}>
              <Text style={styles.collaboratorTitle}>Colaborador</Text>
            <Text style={styles.userInfoText}>
              ALUNO: {user?.name ?? "Usuario autenticado"}
            </Text>
            <Text style={styles.userInfoText}>
              MATRICULA: {user?.matricula ?? user?.id ?? "-"}
            </Text>
          </View>

          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.dateText}>{fullDate}</Text>

          <Text style={styles.confirmationText}>Confirmar o registro?</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelConfirmation}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.registerButton]}
              onPress={handleConfirmPointRegistration}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {pointError && <Text style={styles.errorText}>{pointError}</Text>}
      </View>
    </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={resetTimer}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>PONTO ELETRONICO</Text>

        <View style={styles.pointCard}>
          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.dateText}>{fullDate}</Text>

          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleCapturePoint}
              disabled={!!pointError}
            >
              <Text style={styles.mainButtonText}>BATER PONTO!</Text>
            </TouchableOpacity>
          )}

          {pointError && <Text style={styles.errorText}>{pointError}</Text>}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const PointScreen = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated) {
          await router.replace("/(tabs)/login" as any);
          return;
        }

        if (userRole !== "aluno") {
          await router.replace("/(tabs)/cadastroaluno" as any);
        }
      } catch (error) {
        console.error("Erro ao redirecionar:", error);
      }
    };

    checkAuth();
  }, [isAuthenticated, userRole, router]);

  if (!isAuthenticated || userRole !== "aluno") {
    return null;
  }

  return <PointScreenAuthenticated />;
};

export default PointScreen;
