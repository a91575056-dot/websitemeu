"use client";

import Link from "next/link";
import { Loader2, MessageSquarePlus, RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { testimonials } from "@/data/site";

type PublicFeedback = {
  id: string;
  name: string;
  project: string;
  rating: number;
  message: string;
  website: string;
  createdAt: string;
  source?: string;
};

type FeedbackResponse = {
  feedback: PublicFeedback[];
  total: number;
  averageRating: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function FeedbackWall() {
  const [items, setItems] = useState<PublicFeedback[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const data = (await response.json()) as FeedbackResponse;

      if (!response.ok) {
        throw new Error("Feedback cannot be loaded right now.");
      }

      setItems(data.feedback || []);
      setAverageRating(data.averageRating || 0);
    } catch {
      setError("Feedback cannot be loaded right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const ratingLabel = useMemo(
    () => (averageRating ? averageRating.toFixed(1) : "0.0"),
    [averageRating],
  );
  const fallbackItems = useMemo(
    () =>
      testimonials.map((testimonial, index) => ({
        id: `site-testimonial-${index}`,
        name: testimonial.author,
        project: testimonial.role,
        rating: 5,
        message: testimonial.quote,
        website: "",
        createdAt: "",
        source: "Existing website testimonial",
      })),
    [],
  );
  const displayItems = items.length ? items : fallbackItems;
  const displayAverageRating = items.length ? ratingLabel : "5.0";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white/78 p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Feedback
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
            {displayItems.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/78 p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Average rating
          </p>
          <p className="mt-2 inline-flex items-center gap-2 font-display text-3xl font-semibold text-slate-950">
            {displayAverageRating}
            <Star className="size-6 fill-amber-400 text-amber-400" />
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/78 p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Domain
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-950">
            dionisweb.com
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/feedback" className="button-primary justify-center">
          <MessageSquarePlus className="size-4" />
          Leave feedback
        </Link>
        <button
          type="button"
          onClick={loadFeedback}
          disabled={isLoading}
          className="button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      {isLoading && !displayItems.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-lg border border-slate-200 bg-white/70"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !displayItems.length && !error ? (
        <div className="rounded-lg border border-slate-200 bg-white/78 p-8 text-center">
          <p className="font-display text-2xl font-semibold text-slate-950">
            No public feedback yet.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            The first feedback submitted through the form will appear here automatically.
          </p>
        </div>
      ) : null}

      {displayItems.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {displayItems.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white/82 p-5 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.55)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-slate-950">
                    {item.name}
                  </h2>
                  {item.project ? (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {item.project}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${index < item.rating ? "fill-current" : "text-slate-200"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-5 text-base leading-8 text-slate-700">
                &ldquo;{item.message}&rdquo;
              </p>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                {item.createdAt ? (
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                ) : (
                  <span>{item.source}</span>
                )}
                {item.website ? (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
                  >
                    Client website
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
