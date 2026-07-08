import { useEffect, useState } from "react";
import {
  listAuthorizedUsers,
  upsertAuthorizedUser,
  type AuthorizedUser,
} from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ProShell } from "@/pages/LeadsPage";

const DEFAULT_USER: AuthorizedUser = {
  email: "",
  nome: "",
  role: "hunter",
  status: "ativo",
  observacao: "",
};

export function AdminUsersPage() {
  const [items, setItems] = useState<AuthorizedUser[]>([]);
  const [form, setForm] = useState<AuthorizedUser>(DEFAULT_USER);

  useEffect(() => {
    listAuthorizedUsers().then(setItems);
  }, []);

  async function save() {
    await upsertAuthorizedUser(form);
    setForm(DEFAULT_USER);
    setItems(await listAuthorizedUsers());
  }

  return (
    <ProShell title="Usuarios autorizados">
      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Supabase nao configurado. Esta tela fica operacional quando VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY forem preenchidos.
        </div>
      )}

      <section className="mb-5 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-ink">Liberar ou bloquear e-mail</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm md:col-span-2"
            placeholder="email@empresa.com"
          />
          <input
            value={form.nome ?? ""}
            onChange={(event) => setForm({ ...form, nome: event.target.value })}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Nome"
          />
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value as AuthorizedUser["role"] })}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="owner">owner</option>
            <option value="admin">admin</option>
            <option value="especialista">especialista</option>
            <option value="hunter">hunter</option>
            <option value="viewer">viewer</option>
          </select>
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as AuthorizedUser["status"] })}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="ativo">ativo</option>
            <option value="bloqueado">bloqueado</option>
          </select>
        </div>
        <button type="button" onClick={save} className="mt-4 rounded-md bg-petroleum-700 px-4 py-2 text-sm font-semibold text-white">
          Salvar usuario
        </button>
      </section>

      <div className="grid gap-3">
        {items.map((user) => (
          <div key={user.email} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-ink">{user.email}</p>
                <p className="text-sm text-neutral-500">{user.nome || "Sem nome"}</p>
              </div>
              <p className="text-sm text-neutral-600">
                {user.role} - {user.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ProShell>
  );
}
