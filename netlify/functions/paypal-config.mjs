import {
  assertMethod,
  getCurrency,
  getPayPalCredentials,
  json,
  paymentOptionsForClient,
} from "./paypal-shared.mjs";

export default async function handler(request) {
  const methodResponse = assertMethod(request, "GET");

  if (methodResponse) {
    return methodResponse;
  }

  const { clientId } = getPayPalCredentials();
  const currency = getCurrency();

  return json({
    enabled: Boolean(clientId),
    clientId,
    currency,
    environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox",
    paymentOptions: paymentOptionsForClient(currency),
  });
}
