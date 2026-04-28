import {
  assertMethod,
  createRequestId,
  getCurrency,
  getPayPalAccessToken,
  getPayPalBaseUrl,
  getPaymentOption,
  getSiteUrl,
  json,
  readJson,
} from "./paypal-shared.mjs";

export default async function handler(request) {
  const methodResponse = assertMethod(request, "POST");

  if (methodResponse) {
    return methodResponse;
  }

  const body = await readJson(request);
  const option = getPaymentOption(body?.packageId);

  if (!option) {
    return json({ message: "Choose a valid payment option." }, 400);
  }

  try {
    const currency = getCurrency();
    const siteUrl = getSiteUrl();
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": createRequestId(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: option.id,
            custom_id: option.id,
            description: option.description,
            amount: {
              currency_code: currency,
              value: option.amount,
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: option.amount,
                },
              },
            },
            items: [
              {
                name: option.name,
                description: option.description,
                quantity: "1",
                category: "DIGITAL_GOODS",
                unit_amount: {
                  currency_code: currency,
                  value: option.amount,
                },
              },
            ],
          },
        ],
        application_context: {
          brand_name: process.env.PAYPAL_BRAND_NAME || "Dionis Web",
          landing_page: "LOGIN",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${siteUrl}/payment-success`,
          cancel_url: `${siteUrl}/payment-cancel`,
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.id) {
      return json(
        {
          message:
            payload.message ||
            payload.error_description ||
            "PayPal could not create the order.",
        },
        response.status || 502,
      );
    }

    return json({
      id: payload.id,
      status: payload.status,
      packageId: option.id,
    });
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : "PayPal could not create the order.",
      },
      500,
    );
  }
}
