import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const PERIODOS = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}º Período`,
  value: `${i + 1}`,
}));

export default function CadastroAlunoScreen() {
  const [step, setStep] = useState(1);

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [turma, setTurma] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [erros, setErros] = useState({
    nome: "",
    matricula: "",
    celular: "",
    email: "",
    turma: "",
    periodo: "",
    cep: "",
    logradouro: "",
    numero: "",
    cidade: "",
    estado: "",
    dataInicio: "",
    dataFim: "",
  });


  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const formatarCelular = (valor: string) => {
    const nums = valor.replace(/\D/g, "");
    if (nums.length <= 11) {
      return nums.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return valor;
  };

  const formatarData = (valor: string) => {
    const nums = valor.replace(/\D/g, "");
    return nums.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
  };

  const validarData = (data: string) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(data)) return false;
    const [dia, mes, ano] = data.split("/").map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.getDate() === dia && dataObj.getMonth() === mes - 1 && dataObj.getFullYear() === ano;
  };

  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'inicio' | 'fim' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());


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

  const validarNome = (nome: string) => {
    if (/\d/.test(nome)) return "O nome não deve conter números";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s']{2,}$/.test(nome)) return "Digite um nome válido";
    return "";
  };

  const validarStep1 = () => {
    const novosErros = { ...erros };
    let valido = true;

    if (!nome.trim()) {
      novosErros.nome = "Por favor, digite seu nome completo";
      valido = false;
    } else {
      const erroNome = validarNome(nome);
      if (erroNome) {
        novosErros.nome = erroNome;
        valido = false;
      }
    }

    if (!matricula.trim()) {
      novosErros.matricula = "Por favor, digite sua matrícula";
      valido = false;
    } else if (!/^\d{8}$/.test(matricula)) {
      novosErros.matricula = "A matrícula deve ter exatamente 8 números";
      valido = false;
    }

    if (!celular.trim()) {
      novosErros.celular = "Por favor, digite seu número de celular";
      valido = false;
    } else if (celular.replace(/\D/g, "").length !== 11) {
      novosErros.celular = "Digite um número de celular válido com DDD";
      valido = false;
    }

    if (!email.trim()) {
      novosErros.email = "Por favor, digite seu e-mail";
      valido = false;
    } else if (!validarEmail(email)) {
      novosErros.email = "Digite um e-mail válido (exemplo@dominio.com)";
      valido = false;
    }

    if (!turma.trim()) {
      novosErros.turma = "Por favor, digite sua turma";
      valido = false;
    }

    if (!periodo) {
      novosErros.periodo = "Por favor, selecione seu período";
      valido = false;
    }

    setErros(novosErros);
    return valido;
  };

  const validarStep2 = () => {
    const novosErros = { ...erros };
    let valido = true;

    if (!cep.trim()) {
      novosErros.cep = "Por favor, digite o CEP";
      valido = false;
    } else if (cep.replace(/\D/g, "").length !== 8) {
      novosErros.cep = "Digite um CEP válido com 8 números";
      valido = false;
    }

    if (!logradouro.trim()) {
      novosErros.logradouro = "Por favor, digite o nome da rua";
      valido = false;
    } else if (logradouro.length < 3) {
      novosErros.logradouro = "O nome da rua deve ter pelo menos 3 caracteres";
      valido = false;
    }

    if (!numero.trim()) {
      novosErros.numero = "Por favor, digite o número";
      valido = false;
    } else if (numero === "0") {
      novosErros.numero = "Digite um número válido ou 'S/N' para sem número";
      valido = false;
    }

    if (!cidade.trim()) {
      novosErros.cidade = "Por favor, digite o nome da cidade";
      valido = false;
    } else if (cidade.length < 3) {
      novosErros.cidade = "O nome da cidade deve ter pelo menos 3 caracteres";
      valido = false;
    }

    if (!estado.trim()) {
      novosErros.estado = "Por favor, selecione o estado";
      valido = false;
    } else if (!/^[A-Z]{2}$/.test(estado)) {
      novosErros.estado = "Digite a sigla do estado (ex: SP, RJ)";
      valido = false;
    }

    setErros(novosErros);
    return valido;
  };

  const compararDatas = (data1: string, data2: string) => {
    const [dia1, mes1, ano1] = data1.split("/").map(Number);
    const [dia2, mes2, ano2] = data2.split("/").map(Number);
    const d1 = new Date(ano1, mes1 - 1, dia1);
    const d2 = new Date(ano2, mes2 - 1, dia2);
    return d1 < d2;
  };

  const validarStep3 = () => {
    const novosErros = { ...erros };
    let valido = true;

    if (!dataInicio.trim()) {
      novosErros.dataInicio = "Por favor, digite a data de início";
      valido = false;
    } else if (!validarData(dataInicio)) {
      novosErros.dataInicio = "Digite uma data válida (DD/MM/AAAA)";
      valido = false;
    }

    if (!dataFim.trim()) {
      novosErros.dataFim = "Por favor, digite a data de término";
      valido = false;
    } else if (!validarData(dataFim)) {
      novosErros.dataFim = "Digite uma data válida (DD/MM/AAAA)";
      valido = false;
    }

    if (validarData(dataInicio) && validarData(dataFim) && !compararDatas(dataInicio, dataFim)) {
      novosErros.dataFim = "A data de término deve ser posterior à data de início";
      valido = false;
    }

    setErros(novosErros);
    return valido;
  };

  const nextStep = () => {
    let valido = false;
    switch (step) {
      case 1:
        valido = validarStep1();
        break;
      case 2:
        valido = validarStep2();
        break;
      case 3:
        valido = validarStep3();
        break;
    }
    if (valido) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));


  const handleCadastro = async () => {
    // Valida todos os passos novamente antes de enviar
    const dadosPessoaisValidos = validarStep1();
    if (!dadosPessoaisValidos) {
      Alert.alert("Erro", "Por favor, verifique os dados pessoais");
      setStep(1);
      return;
    }

    const enderecoValido = validarStep2();
    if (!enderecoValido) {
      Alert.alert("Erro", "Por favor, verifique os dados de endereço");
      setStep(2);
      return;
    }

    const contratoValido = validarStep3();
    if (!contratoValido) {
      Alert.alert("Erro", "Por favor, verifique os dados do contrato");
      setStep(3);
      return;
    }

    try {

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {renderStepper()}
        <Text style={styles.stepTitle}>{renderStepTitle()}</Text>


        {step === 1 && (
          <View>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={[styles.input, erros.nome && styles.inputError]}
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                setErros(prev => ({ ...prev, nome: "" }));
              }}
              placeholder="Digite seu nome completo"
            />
            {erros.nome ? <Text style={styles.errorText}>{erros.nome}</Text> : null}

            <Text style={styles.label}>Matrícula</Text>
            <TextInput
              style={[styles.input, erros.matricula && styles.inputError]}
              value={matricula}
              onChangeText={(text) => {
                setMatricula(text.replace(/\D/g, ""));
                setErros(prev => ({ ...prev, matricula: "" }));
              }}
              placeholder="Digite sua matrícula"
              keyboardType="numeric"
            />
            {erros.matricula ? <Text style={styles.errorText}>{erros.matricula}</Text> : null}

            <Text style={styles.label}>Turma</Text>
            <TextInput
              style={[styles.input, erros.turma && styles.inputError]}
              value={turma}
              onChangeText={(text) => {
                setTurma(text);
                setErros(prev => ({ ...prev, turma: "" }));
              }}
              placeholder="Digite sua turma"
            />
            {erros.turma ? <Text style={styles.errorText}>{erros.turma}</Text> : null}

            <Text style={styles.label}>Celular</Text>
            <TextInput
              style={[styles.input, erros.celular && styles.inputError]}
              value={celular}
              onChangeText={(text) => {
                setCelular(formatarCelular(text));
                setErros(prev => ({ ...prev, celular: "" }));
              }}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {erros.celular ? <Text style={styles.errorText}>{erros.celular}</Text> : null}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, erros.email && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (text.trim() && !validarEmail(text)) {
                  setErros(prev => ({ ...prev, email: "Digite um e-mail válido (exemplo@dominio.com)" }));
                } else {
                  setErros(prev => ({ ...prev, email: "" }));
                }
              }}
              onBlur={() => {
                if (email.trim() && !validarEmail(email)) {
                  setErros(prev => ({ ...prev, email: "Digite um e-mail válido (exemplo@dominio.com)" }));
                }
              }}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {erros.email ? <Text style={styles.errorText}>{erros.email}</Text> : null}

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


        {step === 2 && (
          <View>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={[styles.input, erros.cep && styles.inputError]}
              value={cep}
              onChangeText={(text) => {
                const cepNumerico = text.replace(/\D/g, "");
                setCep(cepNumerico.replace(/^(\d{5})(\d)/, "$1-$2"));
                setErros(prev => ({ ...prev, cep: "" }));
              }}
              placeholder="00000-000"
              keyboardType="numeric"
              maxLength={9}
            />
            {erros.cep ? <Text style={styles.errorText}>{erros.cep}</Text> : null}

            <Text style={styles.label}>Logradouro</Text>
            <TextInput
              style={[styles.input, erros.logradouro && styles.inputError]}
              value={logradouro}
              onChangeText={(text) => {
                setLogradouro(text);
                setErros(prev => ({ ...prev, logradouro: "" }));
              }}
              placeholder="Rua, Avenida, etc."
            />
            {erros.logradouro ? <Text style={styles.errorText}>{erros.logradouro}</Text> : null}

            <Text style={styles.label}>Número</Text>
            <TextInput
              style={[styles.input, erros.numero && styles.inputError]}
              value={numero}
              onChangeText={(text) => {
                setNumero(text.replace(/\D/g, ""));
                setErros(prev => ({ ...prev, numero: "" }));
              }}
              placeholder="Número"
              keyboardType="numeric"
            />
            {erros.numero ? <Text style={styles.errorText}>{erros.numero}</Text> : null}

            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={[styles.input, erros.cidade && styles.inputError]}
              value={cidade}
              onChangeText={(text) => {
                setCidade(text);
                setErros(prev => ({ ...prev, cidade: "" }));
              }}
              placeholder="Cidade"
            />
            {erros.cidade ? <Text style={styles.errorText}>{erros.cidade}</Text> : null}

            <Text style={styles.label}>Estado</Text>
            <TextInput
              style={[styles.input, erros.estado && styles.inputError]}
              value={estado}
              onChangeText={(text) => {
                setEstado(text.toUpperCase());
                setErros(prev => ({ ...prev, estado: "" }));
              }}
              placeholder="Estado"
              maxLength={2}
              autoCapitalize="characters"
            />
            {erros.estado ? <Text style={styles.errorText}>{erros.estado}</Text> : null}

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity style={styles.buttonBack} onPress={prevStep}>
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={nextStep}>
                <Text style={styles.buttonText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


        {step === 3 && (
          <View>
            <Text style={styles.label}>Data de início</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dateInput,
                erros.dataInicio && styles.inputError,
              ]}
              onPress={() => {
                setSelectedDateField('inicio');
                setShowDatePicker(true);
                if (dataInicio) {
                  const [dia, mes, ano] = dataInicio.split('/').map(Number);
                  setTempDate(new Date(ano, mes - 1, dia));
                } else {
                  setTempDate(new Date());
                }
              }}
            >
              <Text style={dataInicio ? styles.dateText : styles.placeholderText}>
                {dataInicio || "Selecione a data de início"}
              </Text>
            </TouchableOpacity>
            {erros.dataInicio ? <Text style={styles.errorText}>{erros.dataInicio}</Text> : null}

            <Text style={styles.label}>Data de término</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dateInput,
                erros.dataFim && styles.inputError,
              ]}
              onPress={() => {
                setSelectedDateField('fim');
                setShowDatePicker(true);
                if (dataFim) {
                  const [dia, mes, ano] = dataFim.split('/').map(Number);
                  setTempDate(new Date(ano, mes - 1, dia));
                } else {
                  setTempDate(new Date());
                }
              }}
            >
              <Text style={dataFim ? styles.dateText : styles.placeholderText}>
                {dataFim || "Selecione a data de término"}
              </Text>
            </TouchableOpacity>
            {erros.dataFim ? <Text style={styles.errorText}>{erros.dataFim}</Text> : null}

            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && date) {
                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                    if (selectedDateField === 'inicio') {
                      setDataInicio(formattedDate);
                      setErros(prev => ({ ...prev, dataInicio: "" }));
                    } else {
                      setDataFim(formattedDate);
                      setErros(prev => ({ ...prev, dataFim: "" }));
                    }
                  }
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity style={styles.buttonBack} onPress={prevStep}>
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCadastro}>
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  dateInput: {
    justifyContent: 'center',
    paddingVertical: 15,
  },
  dateText: {
    color: '#000',
    fontSize: 14,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 14,
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "#e53935",
  },
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
  buttonBack: {
    backgroundColor: "#4a4a4a",
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
