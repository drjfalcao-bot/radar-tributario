import {
  calculateDiagnostic,
  getDebtBreakdown,
  type DiagnosticInput,
  type DiagnosticResult,
} from "@/lib/RiskCalculator";
import { normalizeCrmData, type LeadCrmData } from "@/lib/crm";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type DiagnosticStatus =
  | "lead_parcial"
  | "diagnostico_basico"
  | "aguardando_documentos"
  | "em_analise_especialista"
  | "parecer_emitido"
  | "proposta_enviada"
  | "perdido";

export type ParecerSectionStatus = "pendente" | "validado" | "nao_aplicavel";

export type ParecerSection = {
  id: string;
  titulo: string;
  texto: string;
  status: ParecerSectionStatus;
};

export type LeadDocumentStatus = "pendente" | "validado" | "nao_aplicavel";

export type LeadDocument = {
  id?: string;
  diagnosticoId: string;
  nome: string;
  tipo: string;
  status: LeadDocumentStatus;
  observacao?: string | null;
  storagePath?: string | null;
};

export type SavedDiagnostic = {
  id: string;
  createdAt: string;
  updatedAt: string;
  origem: string;
  status: DiagnosticStatus;
  input: DiagnosticInput;
  result: DiagnosticResult;
  anotacoesInternas?: string | null;
  parecer?: ParecerSection[] | null;
  crm?: LeadCrmData | null;
};

export type AuthorizedUser = {
  id?: string;
  email: string;
  nome?: string | null;
  role: "owner" | "admin" | "especialista" | "hunter" | "viewer";
  status: "ativo" | "bloqueado";
  observacao?: string | null;
};

const LOCAL_KEY = "radar_tributario_diagnosticos";
const LOCAL_DOCS_KEY = "radar_tributario_documentos";

function safeUuid(): string {
  if ("crypto" in window && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocal(): SavedDiagnostic[] {
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedDiagnostic[];
  } catch {
    return [];
  }
}

function writeLocal(items: SavedDiagnostic[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function normalizeSavedDiagnostic(item: SavedDiagnostic): SavedDiagnostic {
  return {
    ...item,
    crm: normalizeCrmData(item.input, item.crm),
  };
}

function readLocalDocs(): Record<string, LeadDocument[]> {
  const raw = window.localStorage.getItem(LOCAL_DOCS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, LeadDocument[]>;
  } catch {
    return {};
  }
}

function writeLocalDocs(items: Record<string, LeadDocument[]>) {
  window.localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(items));
}

function inputToRow(id: string, input: DiagnosticInput, result: DiagnosticResult) {
  const debt = getDebtBreakdown(input);

  return {
    id,
    origem: "hunter_call",
    status: "lead_parcial",
    nome_empresa: input.nomeEmpresa,
    contato: input.contato,
    cnpj: input.cnpj,
    regime_tributario: input.regimeTributario,
    setor: input.setor,
    faturamento_mensal: input.faturamentoMensal,
    percentual_b2b: input.percentualB2B,
    margem_percentual: input.margemPercentual,
    compras_creditaveis_percentual: input.comprasCreditaveisPercentual,
    possui_cliente_pj_relevante: input.possuiClientePjRelevante,
    sistema_fiscal_preparado: input.sistemaFiscalPreparado,
    possui_divida_fiscal: input.possuiDividaFiscal,
    valor_divida_estimado: debt.total,
    possui_credito_icms: input.possuiCreditoIcms,
    valor_credito_icms_estimado: input.valorCreditoIcmsEstimado,
    objetivo_cliente: input.objetivoCliente,
    score_risco: result.score,
    nivel_risco: result.nivel,
    exposicao_min: result.exposicaoMin,
    exposicao_max: result.exposicaoMax,
    preco_inacao_min: result.precoInacaoMin,
    preco_inacao_max: result.precoInacaoMax,
    pressao_b2b: result.pressaoB2B,
    oportunidades: result.oportunidades,
    ameacas: result.ameacas,
    documentos: result.documentos,
    premissas: result.premissas,
    resultado: result,
  };
}

function rowToInput(row: Record<string, any>): DiagnosticInput {
  const storedResult = (row.resultado as Partial<DiagnosticResult> | null) ?? {};
  const detailedDebt = storedResult.dividasDetalhadas;
  const profile = storedResult.perfilEmpresa;

  return {
    nomeEmpresa: row.nome_empresa ?? "",
    contato: row.contato ?? "",
    cnpj: row.cnpj ?? "",
    regimeTributario: row.regime_tributario ?? "nao_sei",
    setor: row.setor ?? "nao_sei",
    porteEmpresa: profile?.porteEmpresa ?? "nao_sei",
    numeroFuncionarios: Number(profile?.numeroFuncionarios ?? 0),
    faturamentoMensal: Number(row.faturamento_mensal ?? 0),
    percentualB2B: Number(row.percentual_b2b ?? 0),
    margemPercentual: Number(row.margem_percentual ?? 1),
    comprasCreditaveisPercentual: Number(row.compras_creditaveis_percentual ?? 0),
    possuiClientePjRelevante: row.possui_cliente_pj_relevante ?? "nao_sei",
    sistemaFiscalPreparado: row.sistema_fiscal_preparado ?? "nao_sei",
    possuiDividaFiscal: row.possui_divida_fiscal ?? "nao_sei",
    valorDividaEstimado: Number(row.valor_divida_estimado ?? 0),
    valorDividaUniao: Number(detailedDebt?.uniao ?? row.valor_divida_estimado ?? 0),
    valorDividaEstado: Number(detailedDebt?.estado ?? 0),
    valorDividaMunicipio: Number(detailedDebt?.municipio ?? 0),
    valorDividaOutros: Number(detailedDebt?.outros ?? 0),
    possuiCreditoIcms: row.possui_credito_icms ?? "nao_sei",
    valorCreditoIcmsEstimado: Number(row.valor_credito_icms_estimado ?? 0),
    objetivoCliente: row.objetivo_cliente ?? "nao_sei",
  };
}

function rowToSaved(row: Record<string, any>): SavedDiagnostic {
  const input = rowToInput(row);
  const calculated = calculateDiagnostic(input);
  const storedResult = (row.resultado as Partial<DiagnosticResult> | null) ?? {};
  const storedCrm = (row.crm_data ?? (row.resultado as Record<string, unknown> | null)?.crm) as
    | Partial<LeadCrmData>
    | undefined;
  const result: DiagnosticResult = {
    ...calculated,
    ...storedResult,
    score: row.score_risco ?? calculated.score,
    nivel: row.nivel_risco ?? calculated.nivel,
    exposicaoMin: Number(row.exposicao_min ?? calculated.exposicaoMin),
    exposicaoMax: Number(row.exposicao_max ?? calculated.exposicaoMax),
    precoInacaoMin: Number(row.preco_inacao_min ?? calculated.precoInacaoMin),
    precoInacaoMax: Number(row.preco_inacao_max ?? calculated.precoInacaoMax),
    pressaoB2B: row.pressao_b2b ?? calculated.pressaoB2B,
    oportunidades: row.oportunidades ?? calculated.oportunidades,
    ameacas: row.ameacas ?? calculated.ameacas,
    documentos: row.documentos ?? calculated.documentos,
  };

  return {
    id: row.id,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    origem: row.origem ?? "hunter_call",
    status: row.status ?? "lead_parcial",
    input,
    result,
    anotacoesInternas: row.anotacoes_internas ?? null,
    parecer: row.parecer ?? null,
    crm: normalizeCrmData(input, storedCrm),
  };
}

export async function saveDiagnostic(
  input: DiagnosticInput,
  result: DiagnosticResult,
): Promise<SavedDiagnostic> {
  const id = safeUuid();
  const now = new Date().toISOString();
  const localRecord: SavedDiagnostic = {
    id,
    createdAt: now,
    updatedAt: now,
    origem: "hunter_call",
    status: "lead_parcial",
    input,
    result,
    crm: normalizeCrmData(input),
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("diagnosticos").insert(inputToRow(id, input, result));
    if (error) throw error;
    return localRecord;
  }

  const items = readLocal();
  writeLocal([localRecord, ...items]);
  return localRecord;
}

export async function loadDiagnostic(id: string, privateView = false): Promise<SavedDiagnostic | null> {
  if (isSupabaseConfigured && supabase) {
    const source = privateView ? "diagnosticos" : "diagnosticos_publico";
    const { data, error } = await supabase.from(source).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? rowToSaved(data) : null;
  }

  const item = readLocal().find((record) => record.id === id);
  return item ? normalizeSavedDiagnostic(item) : null;
}

export async function listDiagnostics(): Promise<SavedDiagnostic[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToSaved);
  }

  return readLocal().map(normalizeSavedDiagnostic);
}

export async function updateDiagnosticMeta(
  id: string,
  updates: Partial<Pick<SavedDiagnostic, "status" | "anotacoesInternas" | "parecer">>,
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const payload: Record<string, unknown> = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.anotacoesInternas !== undefined) payload.anotacoes_internas = updates.anotacoesInternas;
    if (updates.parecer !== undefined) payload.parecer = updates.parecer;

    const { error } = await supabase
      .from("diagnosticos")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    return;
  }

  const items = readLocal();
  writeLocal(
    items.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item,
    ),
  );
}

export async function updateLeadCrm(
  record: SavedDiagnostic,
  crm: LeadCrmData,
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("diagnosticos")
      .update({ crm_data: crm })
      .eq("id", record.id);
    if (error) throw error;
    return;
  }

  const items = readLocal();
  writeLocal(
    items.map((item) =>
      item.id === record.id
        ? { ...item, crm, updatedAt: new Date().toISOString() }
        : item,
    ),
  );
}

export async function getCurrentAuthorizedUser(): Promise<AuthorizedUser | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const email = session?.user.email;
  if (!email) return null;

  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data as AuthorizedUser | null;
}

export async function listAuthorizedUsers(): Promise<AuthorizedUser[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AuthorizedUser[];
}

export async function upsertAuthorizedUser(user: AuthorizedUser): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from("usuarios_autorizados").upsert(user, {
    onConflict: "email",
  });
  if (error) throw error;
}

export async function listLeadDocuments(
  diagnosticoId: string,
  defaultNames: string[],
): Promise<LeadDocument[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("documentos_lead")
      .select("*")
      .eq("diagnostico_id", diagnosticoId)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const saved = (data ?? []).map((row: Record<string, any>) => ({
      id: row.id,
      diagnosticoId,
      nome: row.nome,
      tipo: row.tipo,
      status: row.status,
      observacao: row.observacao,
      storagePath: row.storage_path,
    })) as LeadDocument[];

    const missing = defaultNames
      .filter((name) => !saved.some((doc) => doc.nome === name))
      .map((name) => ({
        diagnosticoId,
        nome: name,
        tipo: "fiscal",
        status: "pendente" as const,
        observacao: "",
      }));

    return [...saved, ...missing];
  }

  const byLead = readLocalDocs();
  const saved = byLead[diagnosticoId] ?? [];
  const missing = defaultNames
    .filter((name) => !saved.some((doc) => doc.nome === name))
    .map((name) => ({
      diagnosticoId,
      nome: name,
      tipo: "fiscal",
      status: "pendente" as const,
      observacao: "",
    }));
  return [...saved, ...missing];
}

export async function saveLeadDocument(document: LeadDocument): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("documentos_lead").upsert(
      {
        diagnostico_id: document.diagnosticoId,
        nome: document.nome,
        tipo: document.tipo,
        status: document.status,
        observacao: document.observacao,
        storage_path: document.storagePath,
      },
      { onConflict: "diagnostico_id,nome" },
    );
    if (error) throw error;
    return;
  }

  const byLead = readLocalDocs();
  const items = byLead[document.diagnosticoId] ?? [];
  byLead[document.diagnosticoId] = items.some((item) => item.nome === document.nome)
    ? items.map((item) => (item.nome === document.nome ? document : item))
    : [...items, document];
  writeLocalDocs(byLead);
}
