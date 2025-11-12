import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CadastroAlunoStep } from "../types/types";

type StepIndicatorProps = {
  activeStep: CadastroAlunoStep;
  totalSteps?: number;
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  activeStep,
  totalSteps = 3,
}) => {
  return (
    <View style={styles.container}>
      {/* Renderiza círculos numerados e linhas entre eles.
          O passo é considerado 'ativo' quando activeStep >= step (permissivo)
          — isso mostra progresso cumulativo (ex: activeStep = 2 marca 1 e 2). */}
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = (index + 1) as CadastroAlunoStep;
        const isActive = activeStep >= step;
        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.circle,
                { backgroundColor: isActive ? "#42a148" : "#ccc" },
              ]}
            >
              <Text style={styles.number}>{step}</Text>
            </View>
            {step !== totalSteps && <View style={styles.line} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  circle: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  number: {
    color: "#fff",
    fontWeight: "bold",
  },
  line: {
    backgroundColor: "#ccc",
    height: 2,
    width: 40,
  },
});

export default StepIndicator;
