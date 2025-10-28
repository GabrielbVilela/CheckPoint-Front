/**
 * Passos do formulário (1..3). Usado pelo StepIndicator e pelo container.
 */
export type CadastroAlunoStep = 1 | 2 | 3;

/**
 * Shape completo do formulário de cadastro de aluno.
 * Todos os campos aqui são strings porque os inputs trabalham com texto,
 * e a conversão/normalização para tipos (ex: Date ou números) deve
 * acontecer antes do envio para a API.
 */
export type CadastroAlunoForm = {
  nome: string;
  matricula: string;
  celular: string;
  email: string;
  turma: string;
  periodo: string;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  dataInicio: string; // dd/mm/yyyy
  dataFim: string; // dd/mm/yyyy
};

/**
 * Erros do formulário: chave -> mensagem. Partial porque nem todos os
 * campos terão erro ao mesmo tempo.
 */
export type CadastroAlunoErrors = Partial<Record<keyof CadastroAlunoForm, string>>;

/**
 * Opção mostrada no modal de período (label visível, value armazenado no form)
 */
export type PeriodoOption = {
  label: string;
  value: string;
};

/**
 * Campos de data permitidos no formulário (usado pelo DatePicker)
 */
export type CadastroDateField = "dataInicio" | "dataFim";
