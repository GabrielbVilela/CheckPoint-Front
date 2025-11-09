import { onlyDigits } from "./formatters";
import {
  CadastroAlunoErrors,
  CadastroAlunoForm,
  CadastroAlunoStep,
} from "./types";

// Regex simples para validar formato bÃ¡sico de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para nome permitindo letras acentuadas e espaÃ§os, exigindo pelo menos 2 caracteres
const nameRegex =
  /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF'`^~\s]{2,}$/u;

export const validateEmail = (email: string) => emailRegex.test(email);

export const validateName = (name: string) => nameRegex.test(name);

/**
 * Valida uma string no formato dd/mm/yyyy verificando se a data existe no calendÃ¡rio.
 * ObservaÃ§Ã£o: esta funÃ§Ã£o assume que a string jÃ¡ estÃ¡ no formato correto (2/2/4) e
 * compara componentes via Date para evitar datas invÃ¡lidas (ex: 31/02/2020).
 */
export const isValidDate = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.length !== 8) {
    return false;
  }
  const [day, month, year] = [
    Number(digits.slice(0, 2)),
    Number(digits.slice(2, 4)),
    Number(digits.slice(4, 8)),
  ];

  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

/**
 * Verifica se a data `end` Ã© posterior Ã  `start`. Ambas em dd/mm/yyyy.
 * Converte para Date e compara. Retorna false se os formatos nÃ£o tiverem 8 dÃ­gitos.
 * Nota: nÃ£o considera horÃ¡rio â€” compara somente a data (meia-noite local).
 */
export const isEndAfterStart = (start: string, end: string) => {
  const startDigits = onlyDigits(start);
  const endDigits = onlyDigits(end);
  if (startDigits.length !== 8 || endDigits.length !== 8) {
    return false;
  }
  const startDate = new Date(
    Number(startDigits.slice(4, 8)),
    Number(startDigits.slice(2, 4)) - 1,
    Number(startDigits.slice(0, 2))
  );
  const endDate = new Date(
    Number(endDigits.slice(4, 8)),
    Number(endDigits.slice(2, 4)) - 1,
    Number(endDigits.slice(0, 2))
  );
  return startDate < endDate;
};

export const isValidTime = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.length !== 4) {
    return false;
  }
  const hours = Number(digits.slice(0, 2));
  const minutes = Number(digits.slice(2));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
};

const timeToMinutes = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.length !== 4) {
    return null;
  }
  const hours = Number(digits.slice(0, 2));
  const minutes = Number(digits.slice(2));
  if ([hours, minutes].some((n) => Number.isNaN(n))) {
    return null;
  }
  return hours * 60 + minutes;
};

const mergeErrors = (
  current: CadastroAlunoErrors,
  incoming: CadastroAlunoErrors
) => ({ ...current, ...incoming });

/**
 * Valida os campos do step atual retornando um objeto com mensagens de erro por campo.
 * O container (cadastroaluno) deve usar esse retorno para bloquear avanÃ§o de step.
 */
export const validateStep = (
  step: CadastroAlunoStep,
  form: CadastroAlunoForm
): CadastroAlunoErrors => {
  const errors: CadastroAlunoErrors = {};

  if (step === 1) {
    // Nome
    if (!form.nome.trim()) {
      errors.nome = "Informe o nome completo.";
    } else if (!validateName(form.nome.trim())) {
      errors.nome = "Digite um nome valido.";
    }

    // MatrÃ­cula: espera 8 dÃ­gitos numÃ©ricos
    const matriculaDigits = onlyDigits(form.matricula);
    if (!matriculaDigits) {
      errors.matricula = "Informe a matricula.";
    } else if (matriculaDigits.length !== 8) {
      errors.matricula = "A matricula deve ter 8 digitos.";
    }

    // Celular: espera 11 dÃ­gitos com DDD
    const celularDigits = onlyDigits(form.celular);
    if (!celularDigits) {
      errors.celular = "Informe o numero de celular.";
    } else if (celularDigits.length !== 11) {
      errors.celular = "Digite um celular valido com DDD.";
    }

    // Email
    if (!form.email.trim()) {
      errors.email = "Informe o e-mail.";
    } else if (!validateEmail(form.email.trim())) {
      errors.email = "Digite um e-mail valido.";
    }

    // Turma e periodo
    if (!form.turma.trim()) {
      errors.turma = "Informe a turma.";
    }

    if (!form.periodo) {
      errors.periodo = "Selecione o periodo.";
    }
  }

  if (step === 2) {
    // CEP
    const cepDigits = onlyDigits(form.cep);
    if (!cepDigits) {
      errors.cep = "Informe o CEP.";
    } else if (cepDigits.length !== 8) {
      errors.cep = "O CEP deve ter 8 digitos.";
    }

    // Logradouro
    if (!form.logradouro.trim()) {
      errors.logradouro = "Informe o logradouro.";
    } else if (form.logradouro.trim().length < 3) {
      errors.logradouro = "O logradouro deve ter pelo menos 3 caracteres.";
    }

    // Numero
    if (!form.numero.trim()) {
      errors.numero = "Informe o numero.";
    }

    // Cidade
    if (!form.cidade.trim()) {
      errors.cidade = "Informe a cidade.";
    } else if (form.cidade.trim().length < 3) {
      errors.cidade = "A cidade deve ter pelo menos 3 caracteres.";
    }

    // Estado (UF)
    if (!form.estado.trim()) {
      errors.estado = "Informe o estado.";
    } else if (!/^[A-Z]{2}$/.test(form.estado.trim())) {
      errors.estado = "Use a sigla do estado (ex: SP).";
    }
  }


  if (step === 3) {
    if (!form.dataInicio.trim()) {
      errors.dataInicio = "Informe a data de inicio.";
    } else if (!isValidDate(form.dataInicio)) {
      errors.dataInicio = "Data de inicio invalida.";
    }

    if (!form.dataFim.trim()) {
      errors.dataFim = "Informe a data de termino.";
    } else if (!isValidDate(form.dataFim)) {
      errors.dataFim = "Data de termino invalida.";
    }

    if (
      isValidDate(form.dataInicio) &&
      isValidDate(form.dataFim) &&
      !isEndAfterStart(form.dataInicio, form.dataFim)
    ) {
      errors.dataFim = "A data de termino deve ser posterior a data de inicio.";
    }

    if (!form.horaInicio.trim()) {
      errors.horaInicio = "Informe a hora inicial prevista.";
    } else if (!isValidTime(form.horaInicio)) {
      errors.horaInicio = "Hora inicial invalida (HH:MM).";
    }

    if (!form.horaFim.trim()) {
      errors.horaFim = "Informe a hora final prevista.";
    } else if (!isValidTime(form.horaFim)) {
      errors.horaFim = "Hora final invalida (HH:MM).";
    }

    if (isValidTime(form.horaInicio) && isValidTime(form.horaFim)) {
      const startMinutes = timeToMinutes(form.horaInicio);
      const endMinutes = timeToMinutes(form.horaFim);
      if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
        errors.horaFim = "Hora final deve ser posterior a inicial.";
      }
    }

    if (!form.tolerancia.trim()) {
      errors.tolerancia = "Defina a tolerancia em minutos.";
    } else {
      const value = Number(form.tolerancia);
      if (Number.isNaN(value) || value < 0) {
        errors.tolerancia = "Informe um numero valido para a tolerancia.";
      }
    }

    if (!form.raio.trim()) {
      errors.raio = "Informe o raio permitido em metros.";
    } else {
      const value = Number(form.raio);
      if (Number.isNaN(value) || value <= 0) {
        errors.raio = "Informe um raio maior que zero.";
      }
    }

    if (!form.turmaId.trim()) {
      errors.turmaId = "Selecione a turma vinculada.";
    }

    if (!form.convenioId.trim()) {
      errors.convenioId = "Selecione o convenio.";
    }

    if (!form.supervisorId.trim()) {
      errors.supervisorId = "Selecione o supervisor.";
    }
  }


  return errors;
};

/**
 * Valida todos os steps e retorna todos os erros acumulados.
 * Ãštil antes da submissÃ£o final para garantir que nada foi pulado.
 */
export const validateAllSteps = (form: CadastroAlunoForm) => {
  let errors: CadastroAlunoErrors = {};
  ( [1, 2, 3] as CadastroAlunoStep[] ).forEach((step) => {
    errors = mergeErrors(errors, validateStep(step, form));
  });
  return errors;
};

export default validateStep;
