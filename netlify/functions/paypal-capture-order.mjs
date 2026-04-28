import {
  assertMethod,
  getPayPalAccessToken,
  getPayPalBaseUrl,
  json,
  readJson,
} from "./paypal-shared.mjs";

function isValidOrderId(value) {
  return typeof value === "string" && /^[A-Z0-9]{6,32}$/.test(value);
}

export default async function handler(request) {
  const methodResponse = assertMethod(request, "POST");

  if (methodResponse) {
    return methodResponse;
  }

  const body = await readJson(request);
  const orderId = body?.orderId;

  if (!isValidOrderId(orderId)) {
    return json({ message: "Missing or invalid PayPal order." }, 400);
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(
      `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return json(
        {
          message:
            payload.message ||
            payload.error_description ||
            "PayPal could not capture the payment.",
        },
        response.status || 502,
      );
    }

    const capture =
      payload.purchase_units?.[0]?.payments?.captures?.[0] ||
      payload.payment_source?.paypal ||
      {};

    return json({
      ok: payload.status === "COMPLETED",
      orderId: payload.id || orderId,
      status: payload.status,
      captureId: capture.id || "",
    });
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : "PayPal could not capture the payment.",
      },
      500,
    );
  }
}
