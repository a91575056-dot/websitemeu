import { randomUUID } from "node:crypto";

import { getStore } from "@netlify/blobs";

const STORE_NAME = "dionis-feedback";
const KEY_PREFIX = "entries/";
const MAX_MESSAGE_LENGTH = 900;

const jsonHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanUrl(value) {
  const text = cleanText(value, 180);

  if (!text) {
    return "";
  }

  try {
    const url = new URL(text.startsWith("http") ? text : `https://${text}`);
    return url.toString();
  } catch {
    return "";
  }
}

async function listFeedback() {
  const store = getStore(STORE_NAME);
  const { blobs } = await store.list({ prefix: KEY_PREFIX });
  const entries = await Promise.all(
    blobs.map(async ({ key }) => {
      try {
        return await store.get(key, { type: "json" });
      } catch {
        return null;
      }
    }),
  );

  return entries
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function createFeedback(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ message: "Please submit the form again." }, 400);
  }

  if (cleanText(body.website, 120)) {
    return json({ ok: true });
  }

  const name = cleanText(body.name, 80);
  const project = cleanText(body.project, 100);
  const message = cleanText(body.message, MAX_MESSAGE_LENGTH);
  const rating = Number(body.rating);
  const approvedForPublic = body.approvedForPublic === true;

  if (name.length < 2) {
    return json({ message: "Name must be at least 2 characters." }, 400);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ message: "Choose a rating between 1 and 5 stars." }, 400);
  }

  if (message.length < 12) {
    return json({ message: "Feedback must be at least 12 characters." }, 400);
  }

  if (!approvedForPublic) {
    return json({ message: "Please confirm that the feedback can be displayed publicly." }, 400);
  }

  const createdAt = new Date().toISOString();
  const feedback = {
    id: randomUUID(),
    name,
    project,
    rating,
    message,
    website: cleanUrl(body.clientWebsite),
    createdAt,
  };

  const store = getStore(STORE_NAME);
  await store.setJSON(`${KEY_PREFIX}${createdAt}-${feedback.id}.json`, feedback, {
    metadata: {
      createdAt,
      rating,
    },
  });

  return json({ ok: true, feedback });
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  if (request.method === "GET") {
    const feedback = await listFeedback();

    return json({
      feedback,
      total: feedback.length,
      averageRating: feedback.length
        ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
        : 0,
    });
  }

  if (request.method === "POST") {
    return createFeedback(request);
  }

  return json({ message: "Method not allowed." }, 405);
}
