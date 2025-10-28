import { PeriodoOption } from "./types";

/**
 * Lista de opções de período utilizada pelo PeriodoModal.
 * Gerada dinamicamente para evitar valores hard-coded.
 * Cada opção tem um `label` (visível) e um `value` (armazenado no form).
 */
export const PERIODOS: PeriodoOption[] = Array.from({ length: 10 }, (_, index) => {
  const value = `${index + 1}`;
  return {
    label: `${index + 1} Periodo`,
    value,
  };
});
