"use client";

import Script from "next/script";
import {
  CreditCard,
  FileText,
  LockKeyhole,
  Mail,
  Phone,
  ReceiptText,
} from "lucide-react";
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

type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectDetails: string;
};

type CustomerErrors = Partial<Record<keyof CustomerInfo, string>>;
type TouchedFields = Partial<Record<keyof CustomerInfo, boolean>>;

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
    id: "landing-page",
    name: "Landing Page",
    amount: "40.00",
    label: "$40",
    currency: "USD",
    description: "For a confirmed one-page website or launch page.",
  },
  {
    id: "business-website",
    name: "Business Website",
    amount: "100.00",
    label: "$100",
    currency: "USD",
    description: "For a confirmed service, local business, or brand website.",
  },
  {
    id: "custom-project",
    name: "Custom Project",
    amount: "200.00",
    label: "$200",
    currency: "USD",
    description: "For a confirmed larger build, redesign, or custom scope.",
  },
];

const initialCustomerInfo: CustomerInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  projectDetails: "",
};

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

function getCustomerErrors(customer: CustomerInfo): CustomerErrors {
  const errors: CustomerErrors = {};

  if (customer.firstName.trim().length < 2) {
    errors.firstName = "Enter at least 2 characters.";
  }

  if (customer.lastName.trim().length < 2) {
    errors.lastName = "Enter at least 2 characters.";
  }

  if (!customer.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!customer.phone.trim()) {
    errors.phone = "Phone is required.";
  } else if (/[a-z]/i.test(customer.phone)) {
    errors.phone = "Use numbers only, no letters.";
  } else if (customer.phone.replace(/\D/g, "").length < 6) {
    errors.phone = "Enter a valid international phone number.";
  }

  return errors;
}

function normalizePhoneInput(value: string) {
  return value
    .trimStart()
    .replace(/[^\d+().\-\s]/g, "")
    .replace(/(?!^)\+/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 40);
}

function getShortOptionName(name: string) {
  return name;
}

export function PayPalCheckout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<CustomerInfo>(initialCustomerInfo);
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [options, setOptions] = useState<PaymentOption[]>(fallbackOptions);
  const [selectedId, setSelectedId] = useState(fallbackOptions[0].id);
  const [customer, setCustomer] = useState<CustomerInfo>(initialCustomerInfo);
  const [touched, setTouched] = useState<TouchedFields>({});
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
  const customerErrors = useMemo(() => getCustomerErrors(customer), [customer]);
  const customerInfoValid = Object.keys(customerErrors).length === 0;
  const missingFieldsLabel = useMemo(() => {
    const labels: Record<keyof CustomerInfo, string> = {
      firstName: "first name",
      lastName: "last name",
      email: "email",
      phone: "phone",
      projectDetails: "project note",
    };

    return Object.keys(customerErrors)
      .map((key) => labels[key as keyof CustomerInfo])
      .join(", ");
  }, [customerErrors]);

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
    customerRef.current = customer;
  }, [customer]);

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

    if (!customerInfoValid) {
      if (container) {
        container.innerHTML = "";
      }

      return;
    }

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
          body: JSON.stringify({
            packageId: selectedOption.id,
            customer: customerRef.current,
          }),
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
          customerSaved: boolean;
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
  }, [config?.enabled, customerInfoValid, scriptReady, selectedOption.id]);

  function updateCustomer<K extends keyof CustomerInfo>(
    key: K,
    value: CustomerInfo[K],
  ) {
    setCustomer((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function markTouched(key: keyof CustomerInfo) {
    setTouched((current) => ({
      ...current,
      [key]: true,
    }));
  }

  function showError(key: keyof CustomerInfo) {
    return Boolean(touched[key] && customerErrors[key]);
  }

  function handlePhoneKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    ) {
      return;
    }

    if (!/[\d+().\-\s]/.test(event.key)) {
      event.preventDefault();
    }
  }

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

      <div className="space-y-6">
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <span className="eyebrow">PayPal checkout</span>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-950">
            Pay the agreed package securely.
          </h3>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Add the contact details for the order, confirm the package, then
            complete payment with PayPal.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
              01
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-950">
                Client details
              </p>
              <p className="text-sm text-slate-500">
                Saved with the PayPal order for follow-up.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              First name
              <input
                value={customer.firstName}
                onChange={(event) =>
                  updateCustomer("firstName", event.target.value)
                }
                onBlur={() => markTouched("firstName")}
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                className="input-field"
                aria-invalid={showError("firstName")}
                aria-describedby={
                  showError("firstName") ? "paypal-first-name-error" : undefined
                }
                required
              />
              {showError("firstName") ? (
                <p id="paypal-first-name-error" className="text-xs text-rose-600">
                  {customerErrors.firstName}
                </p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Last name
              <input
                value={customer.lastName}
                onChange={(event) =>
                  updateCustomer("lastName", event.target.value)
                }
                onBlur={() => markTouched("lastName")}
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                className="input-field"
                aria-invalid={showError("lastName")}
                aria-describedby={
                  showError("lastName") ? "paypal-last-name-error" : undefined
                }
                required
              />
              {showError("lastName") ? (
                <p id="paypal-last-name-error" className="text-xs text-rose-600">
                  {customerErrors.lastName}
                </p>
              ) : null}
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email
              <span className="relative block">
                <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={customer.email}
                  onChange={(event) =>
                    updateCustomer("email", event.target.value)
                  }
                  onBlur={() => markTouched("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field input-field-with-icon"
                  aria-invalid={showError("email")}
                  aria-describedby={
                    showError("email") ? "paypal-email-error" : undefined
                  }
                  required
                />
              </span>
              {showError("email") ? (
                <p id="paypal-email-error" className="text-xs text-rose-600">
                  {customerErrors.email}
                </p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Phone
              <span className="relative block">
                <Phone className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={customer.phone}
                  onChange={(event) =>
                    updateCustomer("phone", normalizePhoneInput(event.target.value))
                  }
                  onBlur={() => markTouched("phone")}
                  onKeyDown={handlePhoneKeyDown}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[0-9+().\-\s]*"
                  placeholder="+1 555 123 4567"
                  className="input-field input-field-with-icon"
                  aria-invalid={showError("phone")}
                  aria-describedby={
                    showError("phone") ? "paypal-phone-error" : undefined
                  }
                  required
                />
              </span>
              {showError("phone") ? (
                <p id="paypal-phone-error" className="text-xs text-rose-600">
                  {customerErrors.phone}
                </p>
              ) : null}
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
            Project note
            <span className="relative block">
              <FileText className="pointer-events-none absolute top-4 left-4 size-4 text-slate-400" />
              <textarea
                value={customer.projectDetails}
                onChange={(event) =>
                  updateCustomer("projectDetails", event.target.value)
                }
                onBlur={() => markTouched("projectDetails")}
                rows={3}
                maxLength={600}
                placeholder="Short note about the project or WhatsApp conversation."
                className="input-field input-field-with-icon min-h-24 resize-y"
              />
            </span>
          </label>
        </div>

        <div className="space-y-4 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
              02
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-950">
                Package
              </p>
              <p className="text-sm text-slate-500">
                Select the same option we confirmed before checkout.
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
          {options.map((option) => {
            const selected = option.id === selectedOption.id;

            return (
              <label
                key={option.id}
                className={`flex min-h-36 cursor-pointer flex-col justify-between rounded-[1.2rem] border px-4 py-4 ${
                  selected
                    ? "border-emerald-300 bg-emerald-50/70"
                    : "border-slate-200 bg-white/74"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="font-display block text-base font-semibold text-slate-950">
                      {getShortOptionName(option.name)}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      {option.description}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="payment-option"
                    value={option.id}
                    checked={selected}
                    onChange={() => setSelectedId(option.id)}
                    className="mt-1 shrink-0 accent-emerald-700"
                  />
                </span>
                <span className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950">
                  {option.label}
                </span>
              </label>
            );
          })}
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
              03
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-950">
                Pay securely
              </p>
              <p className="text-sm text-slate-500">
                PayPal handles the payment, card details, and receipt.
              </p>
            </div>
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
              Order record
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="min-h-12 overflow-hidden rounded-[0.75rem]"
        />

        {!customerInfoValid ? (
          <p className="rounded-[1rem] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            Complete {missingFieldsLabel || "the required fields"} to unlock
            PayPal checkout.
          </p>
        ) : null}

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
