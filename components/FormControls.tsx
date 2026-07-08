import { useEffect, useState } from "react";

const inputClass =
  "mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500";

export function parseBrazilianMoney(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function formatBrazilianMoney(value: number) {
  return Number.isFinite(value)
    ? value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "R$ 0,00";
}

export function formatBrazilianDecimal(value: number, fractionDigits = 2) {
  return Number.isFinite(value)
    ? value.toLocaleString("pt-BR", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
    : "";
}

export function MoneyInput({
  label,
  value,
  onChange,
  placeholder = "R$ 0,00",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(value > 0 ? formatBrazilianMoney(value) : "");

  useEffect(() => {
    setDisplay(value > 0 ? formatBrazilianMoney(value) : "");
  }, [value]);

  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder}
        onChange={(event) => {
          setDisplay(event.target.value);
          onChange(parseBrazilianMoney(event.target.value));
        }}
        onBlur={() => setDisplay(value > 0 ? formatBrazilianMoney(value) : "")}
        className={inputClass}
      />
    </label>
  );
}

export function EditableSelect({
  label,
  value,
  options,
  onChange,
  onAddOption,
  addLabel = "+ Adicionar item personalizado",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onAddOption?: (value: string) => void;
  addLabel?: string;
}) {
  const [customValue, setCustomValue] = useState("");

  return (
    <div>
      <label className="block text-xs font-semibold uppercase text-neutral-500">
        {label}
        <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {onAddOption && (
        <div className="mt-2 flex gap-2">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder={addLabel}
            className="min-h-9 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink outline-none focus:border-petroleum-500"
          />
          <button
            type="button"
            onClick={() => {
              const next = customValue.trim();
              if (!next) return;
              onAddOption(next);
              onChange(next);
              setCustomValue("");
            }}
            className="rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700"
          >
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

export function EditableChecklist({
  label,
  options,
  values,
  onChange,
  onAddOption,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  onAddOption?: (value: string) => void;
}) {
  const [customValue, setCustomValue] = useState("");

  function toggle(option: string, checked: boolean) {
    onChange(checked ? Array.from(new Set([...values, option])) : values.filter((value) => value !== option));
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"
          >
            <span>{option}</span>
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={(event) => toggle(option, event.target.checked)}
              className="h-4 w-4 accent-petroleum-700"
            />
          </label>
        ))}
      </div>
      {onAddOption && (
        <div className="mt-3 flex gap-2">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder="+ Adicionar item personalizado"
            className="min-h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink outline-none focus:border-petroleum-500"
          />
          <button
            type="button"
            onClick={() => {
              const next = customValue.trim();
              if (!next) return;
              onAddOption(next);
              onChange(Array.from(new Set([...values, next])));
              setCustomValue("");
            }}
            className="rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700"
          >
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

export function EditableMultiSelect({
  label,
  options,
  values,
  onChange,
  onAddOption,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  onAddOption?: (value: string) => void;
}) {
  const [customValue, setCustomValue] = useState("");

  function toggle(option: string) {
    onChange(values.includes(option) ? values.filter((value) => value !== option) : [...values, option]);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`min-h-9 rounded-md border px-3 text-sm font-semibold ${
                active
                  ? "border-petroleum-700 bg-petroleum-700 text-white"
                  : "border-neutral-300 bg-white text-neutral-700"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {onAddOption && (
        <div className="mt-3 flex gap-2">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder="+ Adicionar item personalizado"
            className="min-h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink outline-none focus:border-petroleum-500"
          />
          <button
            type="button"
            onClick={() => {
              const next = customValue.trim();
              if (!next) return;
              onAddOption(next);
              onChange(Array.from(new Set([...values, next])));
              setCustomValue("");
            }}
            className="rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700"
          >
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}
