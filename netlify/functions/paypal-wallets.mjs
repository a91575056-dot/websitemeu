import { assertMethod, getCurrency, getPayPalAccessToken, getPayPalBaseUrl, json } from './paypal-shared.mjs';
let cache;
export function createWalletHandler(deps = {}) {
 const token = deps.token || getPayPalAccessToken;
 const fetcher = deps.fetch || ((...args) => fetch(...args));
 return async function handler(request) {
  const method = assertMethod(request, 'GET'); if (method) return method;
  const environment = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  const currency = getCurrency();
  const domainVerified = process.env.PAYPAL_APPLE_PAY_DOMAIN_VERIFIED === 'true';
  const key = `${environment}:${currency}:${domainVerified}:${process.env.PAYPAL_CLIENT_ID}`;
  if (!deps.fetch && cache?.key === key && cache.expires > Date.now()) return json(cache.result);
  try {
   const accessToken = await token();
   const response = await fetcher(`${getPayPalBaseUrl()}/v2/payments/find-eligible-methods`, {
    method:'POST', headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},
    body:JSON.stringify({purchase_units:[{amount:{currency_code:currency,value:'1.00'}}]}),
   });
   const payload = await response.json();
   if (!response.ok || !payload.eligible_methods) return json({available:false,appleDomainVerified:domainVerified,providerStatus:response.status,providerCode:/^[A-Z_]{1,80}$/.test(payload.name || '') ? payload.name : 'UNEXPECTED_RESPONSE',providerIssues:payload.details?.map(d=>d.issue).filter(code=>/^[A-Z_]{1,80}$/.test(code)),message:'Wallet availability could not be verified.'},502);
   const methods = payload.eligible_methods;
   const result = {available:true,environment,currency,applePayEligible:Object.hasOwn(methods,'apple_pay'),googlePayEligible:Object.hasOwn(methods,'google_pay'),appleDomainVerified:domainVerified};
   if (!deps.fetch) cache = {key,result,expires:Date.now()+60000};
   return json(result);
  } catch { return json({available:false,appleDomainVerified:domainVerified,message:'Wallet availability could not be verified.'},503); }
 };
}
export default createWalletHandler();
