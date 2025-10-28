import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PERIODOS } from "../constants";
import { PeriodoOption } from "../types";

/**
 * Modal que apresenta uma lista de opções de período (PERIODOS).
 * - visible: controla visibilidade do modal
 * - onClose: callback para fechar
 * - onSelect: retorna a opção selecionada ao container
 */
type PeriodoModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: PeriodoOption) => void;
};

export const PeriodoModal: React.FC<PeriodoModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Cabeçalho e lista de opções geradas a partir de constants.ts */}
        <Text style={styles.title}>Escolha o periodo</Text>
        {PERIODOS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.item}
            onPress={() => onSelect(option)}
          >
            {/* label visível para o usuário; value é usado pelo formulário */}
            <Text style={styles.itemText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "60%",
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  item: {
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 15,
  },
  cancel: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 12,
  },
  cancelText: {
    color: "#007bff",
    fontSize: 16,
  },
});

export default PeriodoModal;