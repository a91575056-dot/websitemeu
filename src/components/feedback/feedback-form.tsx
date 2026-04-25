"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Send, Star } from "lucide-react";
import { useMemo, useState } from "react";

type SubmitState =
  | { status: "idle"; message: "" }
  | { status: "loading"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialState: SubmitState = { status: "idle", message: "" };

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [clientWebsite, setClientWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [approvedForPublic, setApprovedForPublic] = useState(true);
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>(initialState);

  const charactersLeft = useMemo(() => 900 - message.length, [message]);
  const isLoading = submitState.status === "loading";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "loading", message: "" });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          project,
          clientWebsite,
          message,
          rating,
          approvedForPublic,
          website,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save your feedback.");
      }

      setName("");
      setProject("");
      setClientWebsite("");
      setMessage("");
      setRating(5);
      setApprovedForPublic(true);
      setWebsite("");
      setSubmitState({
        status: "success",
        message: "Thank you! Your feedback is now public.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not save your feedback.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6 p-5 sm:p-7 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-slate-700">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            placeholder="Your name"
            required
            minLength={2}
            maxLength={80}
            className="input-field"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold text-slate-700">
          Project / business
          <input
            value={project}
            onChange={(event) => setProject(event.target.value)}
            type="text"
            placeholder="Ex: landing page, salon, restaurant"
            maxLength={100}
            className="input-field"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-semibold text-slate-700">
        Website or brand link
        <input
          value={clientWebsite}
          onChange={(event) => setClientWebsite(event.target.value)}
          type="url"
          placeholder="https://example.com"
          maxLength={180}
          className="input-field"
        />
      </label>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Rating</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = rating >= value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`inline-flex size-12 items-center justify-center rounded-lg border ${
                  selected
                    ? "border-amber-300 bg-amber-50 text-amber-500"
                    : "border-slate-200 bg-white/75 text-slate-300"
                }`}
                aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                aria-checked={rating === value}
                role="radio"
              >
                <Star className={selected ? "size-5 fill-current" : "size-5"} />
              </button>
            );
          })}
        </div>
      </div>

      <label className="space-y-2 text-sm font-semibold text-slate-700">
        Feedback
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, 900))}
          rows={7}
          placeholder="Write about the collaboration, communication, and final result."
          required
          minLength={12}
          maxLength={900}
          className="input-field min-h-44 resize-y"
        />
        <span className="block text-xs font-medium text-slate-500">
          {charactersLeft} characters remaining
        </span>
      </label>

      <input
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-600">
        <input
          checked={approvedForPublic}
          onChange={(event) => setApprovedForPublic(event.target.checked)}
          type="checkbox"
          required
          className="mt-1 size-4 accent-teal-700"
        />
        I agree that this feedback can be displayed publicly on dionisweb.com.
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isLoading}
          className="button-primary justify-center disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Submit feedback
        </button>
        <Link href="/feedbacks" className="button-secondary justify-center">
          View feedback
        </Link>
      </div>

      {submitState.status === "success" ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <span>{submitState.message}</span>
        </div>
      ) : null}

      {submitState.status === "error" ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {submitState.message}
        </div>
      ) : null}
    </form>
  );
}
