import {
  CadastroAlunoErrors,
  CadastroAlunoForm,
  CadastroAlunoStep,
} from "../types/types";
import { onlyDigits } from "./formatters";

// Regex simples para validar formato básico de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para nome permitindo letras acentuadas e espaços, exigindo pelo menos 2 caracteres
const nameRegex =
  /^[A-Za-zÀ-ÖØ-öø-ÿ'`^~\s]{2,}$/;

export const validateEmail = (email: string) => emailRegex.test(email);

export const validateName = (name: string) => nameRegex.test(name);

/**
 * Valida uma string no formato dd/mm/yyyy verificando se a data existe no calendário.
 * Observação: esta função assume que a string já está no formato correto (2/2/4) e
 * compara componentes via Date para evitar datas inválidas (ex: 31/02/2020).
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
 * Verifica se a data `end` é posterior à `start`. Ambas em dd/mm/yyyy.
 * Converte para Date e compara. Retorna false se os formatos não tiverem 8 dígitos.
 * Nota: não considera horário — compara somente a data (meia-noite local).
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

const mergeErrors = (
  current: CadastroAlunoErrors,
  incoming: CadastroAlunoErrors
) => ({ ...current, ...incoming });

/**
 * Valida os campos do step atual retornando um objeto com mensagens de erro por campo.
 * O container (cadastroaluno) deve usar esse retorno para bloquear avanço de step.
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

    // Matrícula: espera 8 dígitos numéricos
    const matriculaDigits = onlyDigits(form.matricula);
    if (!matriculaDigits) {
      errors.matricula = "Informe a matricula.";
    } else if (matriculaDigits.length !== 8) {
      errors.matricula = "A matricula deve ter 8 digitos.";
    }

    // Celular: espera 11 dígitos com DDD
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
    // Datas: inicio e termino
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

    // Verifica relação entre as datas (fim > inicio)
    if (
      isValidDate(form.dataInicio) &&
      isValidDate(form.dataFim) &&
      !isEndAfterStart(form.dataInicio, form.dataFim)
    ) {
      errors.dataFim = "A data de termino deve ser posterior a data de inicio.";
    }
  }

  return errors;
};

/**
 * Valida todos os steps e retorna todos os erros acumulados.
 * Útil antes da submissão final para garantir que nada foi pulado.
 */
export const validateAllSteps = (form: CadastroAlunoForm) => {
  let errors: CadastroAlunoErrors = {};
  ( [1, 2, 3] as CadastroAlunoStep[] ).forEach((step) => {
    errors = mergeErrors(errors, validateStep(step, form));
  });
  return errors;
};

export default validateStep;