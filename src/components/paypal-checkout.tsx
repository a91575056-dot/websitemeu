"use client";

import Script from "next/script";
import { CreditCard, LockKeyhole, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type PaymentOption = {
  id: string;
  name: string;
  amount: string;
  label: string;
  currency: string;
  description: string;
};

type PayPalConfig = {
  enabled: boolean;
  clientId: string;
  currency: string;
  environment: "sandbox" | "live";
  paymentOptions: PaymentOption[];
};

type PayPalButtonData = {
  orderID?: string;
};

type PayPalButtonsOptions = {
  style: {
    layout: "vertical" | "horizontal";
    color: "gold" | "blue" | "silver" | "white" | "black";
    shape: "rect" | "pill";
    label: "paypal" | "checkout" | "buynow" | "pay";
  };
  createOrder: () => Promise<string>;
  onApprove: (data: PayPalButtonData) => Promise<void>;
  onCancel: () => void;
  onError: (error: unknown) => void;
};

type PayPalButtonsInstance = {
  render: (target: HTMLElement) => Promise<void>;
  close?: () => Promise<void> | void;
  isEligible?: () => boolean;
};

type PayPalNamespace = {
  Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

const fallbackOptions: PaymentOption[] = [
  {
    id: "starter-deposit",
    name: "Starter website deposit",
    amount: "40.00",
    label: "$40",
    currency: "USD",
    description: "Reserve a landing page or simple website project.",
  },
  {
    id: "standard-deposit",
    name: "Standard project deposit",
    amount: "100.00",
    label: "$100",
    currency: "USD",
    description: "Secure a business website or redesign project slot.",
  },
  {
    id: "priority-deposit",
    name: "Priority project deposit",
    amount: "200.00",
    label: "$200",
    currency: "USD",
    description: "Reserve priority work for a larger or faster project.",
  },
];

async function readApiJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Payment request failed.";

    throw new Error(message);
  }

  return payload as T;
}

export function PayPalCheckout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [options, setOptions] = useState<PaymentOption[]>(fallbackOptions);
  const [selectedId, setSelectedId] = useState(fallbackOptions[0].id);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<{
    tone: "idle" | "info" | "success" | "error";
    message: string;
  }>({
    tone: "idle",
    message: "",
  });

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedId) || options[0],
    [options, selectedId],
  );

  const sdkUrl = useMemo(() => {
    if (!config?.enabled) {
      return "";
    }

    const params = new URLSearchParams({
      "client-id": config.clientId,
      currency: config.currency,
      intent: "capture",
      components: "buttons",
    });

    return `https://www.paypal.com/sdk/js?${params.toString()}`;
  }, [config]);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const response = await fetch("/api/paypal/config", {
          headers: { Accept: "application/json" },
        });
        const payload = await readApiJson<PayPalConfig>(response);

        if (!mounted) {
          return;
        }

        const nextOptions = payload.paymentOptions?.length
          ? payload.paymentOptions
          : fallbackOptions;

        setConfig(payload);
        setOptions(nextOptions);
        setSelectedId((current) =>
          nextOptions.some((option) => option.id === current)
            ? current
            : nextOptions[0].id,
        );

        if (!payload.enabled) {
          setStatus({
            tone: "info",
            message:
              "PayPal checkout is ready in the site, but merchant credentials still need to be configured.",
          });
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        setStatus({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "PayPal checkout is not available right now.",
        });
      }
    }

    loadConfig();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!config?.enabled || !scriptReady || !window.paypal || !container) {
      return;
    }

    let cancelled = false;
    container.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      createOrder: async () => {
        setStatus({
          tone: "info",
          message: "Creating your secure PayPal checkout...",
        });

        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: selectedOption.id }),
        });
        const payload = await readApiJson<{ id: string }>(response);

        return payload.id;
      },
      onApprove: async (data) => {
        if (!data.orderID) {
          throw new Error("PayPal did not return an order ID.");
        }

        setStatus({
          tone: "info",
          message: "Confirming your payment with PayPal...",
        });

        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
        const payload = await readApiJson<{
          ok: boolean;
          orderId: string;
          status: string;
        }>(response);

        if (!payload.ok) {
          throw new Error(`PayPal returned status ${payload.status}.`);
        }

        if (!cancelled) {
          setStatus({
            tone: "success",
            message: "Payment confirmed. Redirecting...",
          });
          window.location.href = `/payment-success?order=${encodeURIComponent(
            payload.orderId,
          )}`;
        }
      },
      onCancel: () => {
        setStatus({
          tone: "info",
          message: "Payment was cancelled before completion.",
        });
      },
      onError: (error) => {
        console.error(error);
        setStatus({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "PayPal could not complete the payment.",
        });
      },
    });

    if (buttons.isEligible && !buttons.isEligible()) {
      queueMicrotask(() => {
        setStatus({
          tone: "error",
          message: "PayPal checkout is not eligible for this browser or account.",
        });
      });
      return;
    }

    buttons.render(container).catch((error: unknown) => {
      console.error(error);
      setStatus({
        tone: "error",
        message: "PayPal buttons could not be loaded.",
      });
    });

    return () => {
      cancelled = true;
      container.innerHTML = "";
      void buttons.close?.();
    };
  }, [config?.enabled, scriptReady, selectedOption.id]);

  return (
    <div className="panel p-6 sm:p-7">
      {sdkUrl ? (
        <Script
          id="paypal-checkout-sdk"
          src={sdkUrl}
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          onError={() =>
            setStatus({
              tone: "error",
              message: "PayPal script failed to load.",
            })
          }
        />
      ) : null}

      <div className="space-y-5">
        <div className="space-y-2">
          <span className="eyebrow">PayPal checkout</span>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-950">
            Pay a project deposit securely.
          </h3>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Choose the agreed deposit after we confirm your project scope on
            WhatsApp.
          </p>
        </div>

        <div className="grid gap-3">
          {options.map((option) => {
            const selected = option.id === selectedOption.id;

            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-4 rounded-[1.25rem] border px-4 py-4 ${
                  selected
                    ? "border-emerald-300 bg-emerald-50/70"
                    : "border-slate-200 bg-white/74"
                }`}
              >
                <input
                  type="radio"
                  name="payment-option"
                  value={option.id}
                  checked={selected}
                  onChange={() => setSelectedId(option.id)}
                  className="mt-1 accent-emerald-700"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg font-semibold text-slate-950">
                      {option.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                      {option.label}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-4 text-emerald-700" />
            Secure
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-emerald-700" />
            Card or PayPal
          </div>
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-emerald-700" />
            Deposit record
          </div>
        </div>

        <div
          ref={containerRef}
          className="min-h-12 overflow-hidden rounded-[0.75rem]"
        />

        {status.message ? (
          <p
            className={`rounded-[1rem] px-4 py-3 text-sm leading-6 ${
              status.tone === "error"
                ? "bg-rose-50 text-rose-700"
                : status.tone === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
