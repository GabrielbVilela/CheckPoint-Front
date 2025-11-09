/**
 * Remove todos os caracteres não numéricos.
 * Ex: onlyDigits("(12) 3456-7890") -> "1234567890"
 */
export const onlyDigits = (value: string) => value.replace(/\D/g, "");

/**
 * Aplica máscara simples de telefone brasileira (DD) 9xxxx-xxxx
 * - aceita até 11 dígitos (inclui 9 como primeiro dígito do número)
 * Ex: formatPhone("11987654321") -> "(11) 98765-4321"
 */
export const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Formata string de data no padrão dd/mm/yyyy enquanto o usuário digita.
 * Ex: "01012020" -> "01/01/2020"
 */
export const formatDateInput = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

/**
 * Converte um objeto Date em string dd/mm/yyyy.
 * Útil para popular os campos após seleção no DateTimePicker.
 */
export const formatDateFromDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Máscara de CEP: 00000-000
 * Ex: "12345678" -> "12345-678"
 */
export const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

/**
 * Formata hora no padrǜo HH:MM. Mantém apenas 4 dígitos.
 */
export const formatTimeInput = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

