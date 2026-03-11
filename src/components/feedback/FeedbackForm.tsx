"use client";

import { useState } from "react";
import { CheckCircle, Send, Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@skillssafe.com";

type FeedbackType = "bug" | "false_positive" | "feature" | "security" | "other";

interface FormState {
  type: FeedbackType;
  title: string;
  description: string;
  skillUrl: string;
  contactEmail: string;
}

interface Messages {
  typeLabel: string;
  titleLabel: string;
  titlePlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  skillUrlLabel: string;
  skillUrlPlaceholder: string;
  emailOptLabel: string;
  emailOptPlaceholder: string;
  submit: string;
  submitNote: string;
  successTitle: string;
  successDesc: string;
  responseTime: string;
  emailAlt: string;
  types: Record<FeedbackType, string>;
  typeDesc: Record<FeedbackType, string>;
}

const TYPES: FeedbackType[] = [
  "bug",
  "false_positive",
  "feature",
  "security",
  "other",
];

function buildMailto(state: FormState): string {
  const subject = `[SkillsSafe ${state.type.toUpperCase()}] ${state.title}`;
  const bodyLines = [
    `Feedback Type: ${state.type}`,
    ``,
    `Description:`,
    state.description,
    ``,
    state.skillUrl ? `Skill URL / Scan ID: ${state.skillUrl}` : null,
    state.contactEmail ? `Reply to: ${state.contactEmail}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function FeedbackForm({ messages: m }: { messages: Messages }) {
  const [form, setForm] = useState<FormState>({
    type: "bug",
    title: "",
    description: "",
    skillUrl: "",
    contactEmail: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (form.title.trim().length < 5) next.title = "Min 5 characters";
    if (form.description.trim().length < 20) next.description = "Min 20 characters";
    if (form.contactEmail && !isValidEmail(form.contactEmail))
      next.contactEmail = "Invalid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    window.location.href = buildMailto(form);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <h2 className="text-xl font-bold text-white">{m.successTitle}</h2>
        <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">{m.successDesc}</p>
        <p className="mt-4 text-xs text-gray-600">{m.responseTime}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* Type selection */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-300">
          {m.typeLabel}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("type", type)}
              className={`rounded-xl border p-4 text-left transition-all ${
                form.type === type
                  ? "border-green-500/60 bg-green-500/10 ring-1 ring-green-500/30"
                  : "border-gray-700 bg-gray-900 hover:border-gray-600"
              }`}
            >
              <div className="text-sm font-medium text-white">{m.types[type]}</div>
              <div className="mt-1 text-xs text-gray-500">{m.typeDesc[type]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          {m.titleLabel} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={m.titlePlaceholder}
          maxLength={100}
          className={`w-full rounded-xl border bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 ${
            errors.title ? "border-red-500/60" : "border-gray-700"
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          {m.descLabel} <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={m.descPlaceholder}
          rows={5}
          maxLength={2000}
          className={`w-full resize-y rounded-xl border bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 ${
            errors.description ? "border-red-500/60" : "border-gray-700"
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-red-400">{errors.description}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-600">{form.description.length}/2000</p>
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-400">
            {m.skillUrlLabel}
          </label>
          <input
            type="text"
            value={form.skillUrl}
            onChange={(e) => set("skillUrl", e.target.value)}
            placeholder={m.skillUrlPlaceholder}
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-400">
            {m.emailOptLabel}
          </label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            placeholder={m.emailOptPlaceholder}
            className={`w-full rounded-xl border bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 ${
              errors.contactEmail ? "border-red-500/60" : "border-gray-700"
            }`}
          />
          {errors.contactEmail && (
            <p className="mt-1 text-xs text-red-400">{errors.contactEmail}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-gray-950 transition-colors hover:bg-green-400"
        >
          <Send className="h-4 w-4" />
          {m.submit}
        </button>
        <p className="text-xs text-gray-600">{m.submitNote}</p>
      </div>

      {/* Direct email fallback */}
      <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm">
        <Mail className="h-4 w-4 flex-shrink-0 text-gray-500" />
        <span className="text-gray-500">{m.emailAlt}</span>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-mono text-green-400 hover:text-green-300 transition-colors"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    </form>
  );
}
