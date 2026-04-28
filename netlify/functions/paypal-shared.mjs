import { randomUUID } from "node:crypto";

export const paymentOptions = [
  {
    id: "starter-deposit",
    name: "Starter website deposit",
    amount: "40.00",
    label: "$40",
    description: "Reserve a landing page or simple website project.",
  },
  {
    id: "standard-deposit",
    name: "Standard project deposit",
    amount: "100.00",
    label: "$100",
    description: "Secure a business website or redesign project slot.",
  },
  {
    id: "priority-deposit",
    name: "Priority project deposit",
    amount: "200.00",
    label: "$200",
    description: "Reserve priority work for a larger or faster project.",
  },
];

export const jsonHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

export function getPaymentOption(id) {
  return paymentOptions.find((option) => option.id === id);
}

export function getCurrency() {
  const currency = process.env.PAYPAL_CURRENCY || "USD";

  return /^[A-Z]{3}$/.test(currency) ? currency : "USD";
}

export function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getSiteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "https://dionisweb.com"
  ).replace(/\/$/, "");
}

export function getPayPalCredentials() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  };
}

export function assertMethod(request, method) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  if (request.method !== method) {
    return json({ message: "Method not allowed." }, 405);
  }

  return null;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Unable to authenticate with PayPal.");
  }

  return payload.access_token;
}

export function createRequestId() {
  return randomUUID();
}

export function paymentOptionsForClient(currency = getCurrency()) {
  return paymentOptions.map(({ id, name, amount, label, description }) => ({
    id,
    name,
    amount,
    label: currency === "USD" ? label : `${amount} ${currency}`,
    currency,
    description,
  }));
}
