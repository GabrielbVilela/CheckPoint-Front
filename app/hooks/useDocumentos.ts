import { useCallback, useEffect, useState } from "react";

import { createDocumento, deleteDocumento, DocumentoDTO, DocumentoPayload, listDocumentos, updateDocumento } from "@/services/documentos";

export const useDocumentos = (contratoId?: number) => {
  const [documentos, setDocumentos] = useState<DocumentoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocumentos(contratoId ? { contrato_id: contratoId } : undefined);
      setDocumentos(data);
    } catch (err: any) {
      console.error("Erro ao carregar documentos:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível carregar os documentos.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [contratoId]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  const handleCreate = useCallback(
    async (payload: DocumentoPayload) => {
      setSubmitting(true);
      setError(null);
      try {
        await createDocumento(payload);
        await fetchDocumentos();
      } catch (err: any) {
        console.error("Erro ao criar documento:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível criar o documento.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDocumentos]
  );

  const handleUpdate = useCallback(
    async (id: number, payload: Partial<DocumentoPayload> & { status?: string }) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateDocumento(id, payload);
        await fetchDocumentos();
      } catch (err: any) {
        console.error("Erro ao atualizar documento:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível atualizar o documento.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDocumentos]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await deleteDocumento(id);
        await fetchDocumentos();
      } catch (err: any) {
        console.error("Erro ao remover documento:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível remover o documento.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDocumentos]
  );

  return {
    documentos,
    loading,
    submitting,
    error,
    refresh: fetchDocumentos,
    createDocumento: handleCreate,
    updateDocumento: handleUpdate,
    deleteDocumento: handleDelete,
  };
};

export default useDocumentos;
