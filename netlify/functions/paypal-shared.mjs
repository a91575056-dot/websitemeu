import { randomUUID } from "node:crypto";

import { getStore } from "@netlify/blobs";

const PAYMENT_STORE_NAME = "dionis-payments";
const PENDING_PREFIX = "pending/";
const COMPLETED_PREFIX = "completed/";
const MAX_DETAIL_LENGTH = 600;

export const paymentOptions = [
  {
    id: "landing-page",
    name: "Landing Page",
    amount: "40.00",
    label: "$40",
    description: "For a confirmed one-page website or launch page.",
  },
  {
    id: "business-website",
    name: "Business Website",
    amount: "100.00",
    label: "$100",
    description: "For a confirmed service, local business, or brand website.",
  },
  {
    id: "custom-project",
    name: "Custom Project",
    amount: "200.00",
    label: "$200",
    description: "For a confirmed larger build, redesign, or custom scope.",
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

export function cleanText(value, maxLength = 120) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function cleanEmail(value) {
  return cleanText(value, 160).toLowerCase();
}

export function cleanPhone(value) {
  return cleanText(value, 40).replace(/[^\d+().\-\s]/g, "");
}

export function validateCustomerInfo(value) {
  const rawPhone = typeof value?.phone === "string" ? value.phone : "";
  const customer = {
    firstName: cleanText(value?.firstName, 80),
    lastName: cleanText(value?.lastName, 80),
    email: cleanEmail(value?.email),
    phone: cleanPhone(value?.phone),
    projectDetails: cleanText(value?.projectDetails, MAX_DETAIL_LENGTH),
  };
  const errors = [];

  if (customer.firstName.length < 2) {
    errors.push("First name is required.");
  }

  if (customer.lastName.length < 2) {
    errors.push("Last name is required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.push("A valid email is required.");
  }

  if (/[a-z]/i.test(rawPhone)) {
    errors.push("Phone number cannot include letters.");
  }

  if (customer.phone.replace(/\D/g, "").length < 6) {
    errors.push("A valid phone number is required.");
  }

  return {
    ok: errors.length === 0,
    customer,
    errors,
  };
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

export async function savePendingPayment(orderId, payment) {
  const store = getStore(PAYMENT_STORE_NAME);

  await store.setJSON(`${PENDING_PREFIX}${orderId}.json`, payment, {
    metadata: {
      orderId,
      email: payment.customer.email,
      packageId: payment.packageId,
      createdAt: payment.createdAt,
    },
  });
}

export async function getPendingPayment(orderId) {
  const store = getStore(PAYMENT_STORE_NAME);

  try {
    return await store.get(`${PENDING_PREFIX}${orderId}.json`, {
      type: "json",
    });
  } catch {
    return null;
  }
}

export async function saveCompletedPayment(orderId, payment) {
  const store = getStore(PAYMENT_STORE_NAME);
  const completedAt = new Date().toISOString();

  await store.setJSON(
    `${COMPLETED_PREFIX}${completedAt}-${orderId}.json`,
    {
      ...payment,
      orderId,
      completedAt,
    },
    {
      metadata: {
        orderId,
        email: payment.customer?.email || "",
        packageId: payment.packageId || "",
        completedAt,
      },
    },
  );
}

function escapeHtml(value) {
  return cleanText(value, 1000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildConfirmationEmail({ payment, orderId, captureId }) {
  const customerName = `${payment.customer.firstName} ${payment.customer.lastName}`;
  const amount = `${payment.amount} ${payment.currency}`;
  const projectDetails = payment.customer.projectDetails || "Not provided";

  const text = [
    `Hi ${customerName},`,
    "",
    `Your ${payment.optionName} order was confirmed.`,
    `Amount: ${amount}`,
    `PayPal order: ${orderId}`,
    captureId ? `Capture ID: ${captureId}` : "",
    "",
    "Project details:",
    projectDetails,
    "",
    "Thank you,",
    "Dionis Web",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2>Your Dionis Web payment is confirmed</h2>
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>Your <strong>${escapeHtml(payment.optionName)}</strong> order was confirmed.</p>
      <p><strong>Amount:</strong> ${escapeHtml(amount)}</p>
      <p><strong>PayPal order:</strong> ${escapeHtml(orderId)}</p>
      ${captureId ? `<p><strong>Capture ID:</strong> ${escapeHtml(captureId)}</p>` : ""}
      <p><strong>Project details:</strong><br>${escapeHtml(projectDetails)}</p>
      <p>Thank you,<br>Dionis Web</p>
    </div>
  `;

  return {
    subject: "Your Dionis Web payment is confirmed",
    text,
    html,
  };
}

function buildOwnerEmail({ payment, orderId, captureId }) {
  const customerName = `${payment.customer.firstName} ${payment.customer.lastName}`;
  const amount = `${payment.amount} ${payment.currency}`;
  const lines = [
    "New PayPal payment received.",
    "",
    `Package: ${payment.optionName}`,
    `Amount: ${amount}`,
    `Customer: ${customerName}`,
    `Email: ${payment.customer.email}`,
    `Phone: ${payment.customer.phone}`,
    `PayPal order: ${orderId}`,
    captureId ? `Capture ID: ${captureId}` : "",
    "",
    "Project details:",
    payment.customer.projectDetails || "Not provided",
  ].filter(Boolean);

  return {
    subject: `New PayPal payment: ${amount}`,
    text: lines.join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>New PayPal payment received</h2>
        <p><strong>Package:</strong> ${escapeHtml(payment.optionName)}</p>
        <p><strong>Amount:</strong> ${escapeHtml(amount)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payment.customer.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(payment.customer.phone)}</p>
        <p><strong>PayPal order:</strong> ${escapeHtml(orderId)}</p>
        ${captureId ? `<p><strong>Capture ID:</strong> ${escapeHtml(captureId)}</p>` : ""}
        <p><strong>Project details:</strong><br>${escapeHtml(
          payment.customer.projectDetails || "Not provided",
        )}</p>
      </div>
    `,
  };
}

async function sendResendEmail({ to, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY is not configured." };
  }

  const from = process.env.PAYMENT_FROM_EMAIL || "Dionis Web <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      sent: false,
      reason: payload.message || "Email provider rejected the message.",
    };
  }

  return { sent: true, id: payload.id || "" };
}

export async function sendPaymentEmails({ payment, orderId, captureId }) {
  const notifyEmail =
    process.env.PAYMENT_NOTIFY_EMAIL || "dioniswebstudio@gmail.com";
  const buyerEmail = buildConfirmationEmail({ payment, orderId, captureId });
  const ownerEmail = buildOwnerEmail({ payment, orderId, captureId });
  const results = {};

  results.buyer = await sendResendEmail({
    to: payment.customer.email,
    ...buyerEmail,
  });
  results.owner = await sendResendEmail({
    to: notifyEmail,
    ...ownerEmail,
  });

  return results;
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
