// cadastroaluno.tsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Períodos de 1º ao 10º
const PERIODOS = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}º Período`,
  value: `${i + 1}`,
}));

export default function CadastroAlunoScreen() {
  const [step, setStep] = useState(1);

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [turma, setTurma] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Endereço
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Contrato
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Buscar endereço automaticamente ao digitar 8 dígitos no CEP
  useEffect(() => {
    const buscarEndereco = async () => {
      const cepLimpo = cep.replace(/\D/g, "");
      if (cepLimpo.length !== 8) return;
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await response.json();
        if (data.erro) {
          Alert.alert("CEP não encontrado");
          setLogradouro("");
          setCidade("");
          setEstado("");
        } else {
          setLogradouro(data.logradouro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
        }
      } catch (error) {
        Alert.alert("Erro ao buscar CEP");
      }
    };
    if (cep && cep.replace(/\D/g, "").length === 8) {
      buscarEndereco();
    }
  }, [cep]);

  const handleSelectPeriodo = (value: string) => {
    const opt = PERIODOS.find((p) => p.value === value);
    if (opt) setPeriodo(opt.label);
    setModalVisible(false);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Cadastro com API
  const handleCadastro = async () => {
    if (!nome || !matricula || !celular || !email || !turma || !periodo) {
      Alert.alert("Preencha todos os dados pessoais!");
      setStep(1);
      return;
    }
    if (!cep || !logradouro || !numero || !cidade || !estado) {
      Alert.alert("Preencha todos os dados de endereço!");
      setStep(2);
      return;
    }
    if (!dataInicio || !dataFim) {
      Alert.alert("Preencha todos os dados de contrato!");
      setStep(3);
      return;
    }

    try {
      // Inline API (mesmo estilo de login/criar conta)
      const response = await axios.post("http://localhost:3000/alunos", {
        nome,
        matricula,
        celular,
        email,
        turma,
        periodo,
        cep,
        logradouro,
        numero,
        cidade,
        estado,
        dataInicio,
        dataFim,
      });

      Alert.alert("Sucesso!", `Aluno cadastrado com ID: ${response.data.id}`);
    } catch (error) {
      Alert.alert("Erro!", "Não foi possível cadastrar o aluno.");
    }
  };

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <View
            style={[
              styles.stepCircle,
              { backgroundColor: step >= s ? "#42a148" : "#ccc" },
            ]}
          >
            <Text style={styles.stepNumber}>{s}</Text>
          </View>
          {s !== 3 && <View style={styles.stepLine} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStepTitle = () => {
    switch (step) {
      case 1:
        return "Dados";
      case 2:
        return "Endereço";
      case 3:
        return "Contrato";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderStepper()}
      <Text style={styles.stepTitle}>{renderStepTitle()}</Text>

      {/* Step 1: Dados pessoais */}
      {step === 1 && (
        <View>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome completo"
          />

          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            value={matricula}
            onChangeText={setMatricula}
            placeholder="Digite sua matrícula"
          />

          <Text style={styles.label}>Turma</Text>
          <TextInput
            style={styles.input}
            value={turma}
            onChangeText={setTurma}
            placeholder="Digite sua turma"
          />

          <Text style={styles.label}>Celular</Text>
          <TextInput
            style={styles.input}
            value={celular}
            onChangeText={setCelular}
            placeholder="Digite seu celular"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Período</Text>
          <TouchableOpacity
            style={[styles.input, styles.activityButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: periodo ? "#000" : "#aaa" }}>
              {periodo || "Selecione o período"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={nextStep}>
            <Text style={styles.buttonText}>Próximo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Endereço */}
      {step === 2 && (
        <View>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            style={styles.input}
            value={cep}
            onChangeText={setCep}
            placeholder="Digite seu CEP"
            keyboardType="numeric"
            maxLength={9}
          />

          <Text style={styles.label}>Logradouro</Text>
          <TextInput
            style={styles.input}
            value={logradouro}
            onChangeText={setLogradouro}
            placeholder="Rua, Avenida, etc."
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={setNumero}
            placeholder="Número"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={cidade}
            onChangeText={setCidade}
            placeholder="Cidade"
          />

          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={estado}
            onChangeText={setEstado}
            placeholder="Estado"
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity style={styles.button} onPress={prevStep}>
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={nextStep}>
              <Text style={styles.buttonText}>Próximo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Contrato */}
      {step === 3 && (
        <View>
          <Text style={styles.label}>Data de início</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={dataInicio}
            onChangeText={setDataInicio}
          />

          <Text style={styles.label}>Data de término</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={dataFim}
            onChangeText={setDataFim}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity style={styles.button} onPress={prevStep}>
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleCadastro}>
              <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Período */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Escolha o período</Text>
          {PERIODOS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.sheetItem}
              onPress={() => handleSelectPeriodo(opt.value)}
            >
              <Text style={styles.sheetItemText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.sheetCancel}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.sheetCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#f9f9f9",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#ccc",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: "#555",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  activityButton: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#42a148",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  sheetItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sheetItemText: {
    fontSize: 15,
  },
  sheetCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetCancelText: {
    fontSize: 16,
    color: "#007bff",
  },
});
