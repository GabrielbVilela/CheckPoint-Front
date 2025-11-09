import { useCallback, useEffect, useState } from "react";

import {
  listConvenios,
  listCursos,
  listEmpresas,
  listSupervisoresExternos,
  listTurmas,
} from "@/services/catalogos";

export type CatalogMetrics = {
  cursos: number;
  turmas: number;
  empresas: number;
  supervisores: number;
  convenios: number;
};

const initialMetrics: CatalogMetrics = {
  cursos: 0,
  turmas: 0,
  empresas: 0,
  supervisores: 0,
  convenios: 0,
};

export const useCatalogMetrics = () => {
  const [metrics, setMetrics] = useState<CatalogMetrics>(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cursos, turmas, empresas, supervisores, convenios] = await Promise.all([
        listCursos(),
        listTurmas(),
        listEmpresas(),
        listSupervisoresExternos(),
        listConvenios(),
      ]);
      setMetrics({
        cursos: cursos.length,
        turmas: turmas.length,
        empresas: empresas.length,
        supervisores: supervisores.length,
        convenios: convenios.length,
      });
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      console.error("Falha ao carregar métricas administrativas:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Erro ao carregar métricas.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refresh: fetchMetrics,
  };
};

export default useCatalogMetrics;
