"use client";

import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";
import type { ApplePayOneTimePaymentSession, GooglePayOneTimePaymentSession, GooglePayPaymentMethodData } from "@paypal/paypal-js/sdk-v6";
import { useEffect, useRef, useState } from "react";

type OrderInput = { packageId: string; amount?: string; customer: { firstName: string; lastName: string; email: string; phone: string; projectDetails: string } };
type Props = { clientId: string; environment: "live" | "sandbox"; currency: string; amount: string; enabled: boolean; order: OrderInput };
type WalletStatus = { available: boolean; applePayEligible: boolean; googlePayEligible: boolean; appleDomainVerified: boolean };

async function api(action: string, body: OrderInput | { orderId: string }) {
 const response = await fetch(`/api/paypal/${action}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data = await response.json();
 if (!response.ok || (action === "capture-order" && !data.ok)) throw new Error(data.message || "Payment could not be completed.");
 return data;
}

export function WalletCheckout(props: Props) {
 const current = useRef(props); current.current = props;
 const googleContainer = useRef<HTMLDivElement>(null);
 const apple = useRef<{session:ApplePayOneTimePaymentSession; config:ApplePayJS.ApplePayPaymentRequest} | null>(null);
 const nativeApple = useRef<ApplePaySession | null>(null);
 const [appleReady,setAppleReady] = useState(false);
 const [googleReady,setGoogleReady] = useState(false);
 const [busy,setBusy] = useState(false);
 const [message,setMessage] = useState("");
 const paymentActive = useRef(false);
 const ready = props.enabled && !busy;

 function success(orderId: string) { window.location.assign(`/payment-success?order=${encodeURIComponent(orderId)}`); }

 useEffect(() => {
  let disposed = false;
  const container = googleContainer.current;
  async function init() {
   try {
    const availabilityResponse = await fetch("/api/paypal/wallets");
    if (!availabilityResponse.ok) return;
    const status:WalletStatus = await availabilityResponse.json();
    if (!status.available || (!status.applePayEligible && !status.googlePayEligible)) return;
    const sdk = await loadCoreSdkScript({environment:props.environment === "live" ? "production" : "sandbox",dataNamespace:"paypalWallets"});
    if (!sdk || disposed) return;
    const instance = await sdk.createInstance({clientId:props.clientId,components:["applepay-payments","googlepay-payments"] as const,pageType:"checkout"});
    const eligible = await instance.findEligibleMethods({currencyCode:props.currency,paymentFlow:"ONE_TIME_PAYMENT"});
    if (disposed) return;
    if (status.applePayEligible && status.appleDomainVerified && eligible.isEligible("applepay") && typeof ApplePaySession !== "undefined" && ApplePaySession.canMakePayments()) {
     const session = instance.createApplePayOneTimePaymentSession();
     const config = session.formatConfigForPaymentRequest(eligible.getDetails("applepay").config);
     if (config.merchantCountry) {
      apple.current = {session,config:{merchantCapabilities:config.merchantCapabilities,supportedNetworks:config.supportedNetworks,countryCode:config.merchantCountry,currencyCode:props.currency,requiredBillingContactFields:["postalAddress","name"],total:{label:"Dionis Web",amount:"1.00",type:"final"}}};
      setAppleReady(true);
     }
    }
    if (status.googlePayEligible && eligible.isEligible("googlepay")) {
     await new Promise<void>((resolve,reject) => {
      if (window.google?.payments?.api?.PaymentsClient) {resolve();return;}
      const script=document.createElement("script");script.src="https://pay.google.com/gp/p/js/pay.js";script.async=true;
      script.onload=()=>resolve();script.onerror=()=>reject(new Error("Google Pay unavailable"));document.head.appendChild(script);
     });
     if (disposed || !container) return;
     const session:GooglePayOneTimePaymentSession = instance.createGooglePayOneTimePaymentSession();
     const config = session.formatConfigForPaymentRequest(eligible.getDetails("googlepay").config);
     let snapshot:Props | null = null;
     const client = new google.payments.api.PaymentsClient({
      environment:props.environment === "live" ? "PRODUCTION" : "TEST",
      paymentDataCallbacks:{onPaymentAuthorized:async (paymentData) => {
       try {
        if (!snapshot) throw new Error("Please start a new payment.");
        const order = await api("create-order",snapshot.order);
        const confirmation = await session.confirmOrder({orderId:order.id,paymentMethodData:paymentData.paymentMethodData as unknown as GooglePayPaymentMethodData});
        if (confirmation.status === "PAYER_ACTION_REQUIRED") {
         // Close Google's sheet before opening 3DS; no capture until authentication resolves.
         setTimeout(() => { void (async () => {
          try {const authentication = await session.initiatePayerAction({orderId:order.id});if (authentication.liabilityShift === "NO" || authentication.liabilityShift === "UNKNOWN") throw new Error("Authentication did not succeed.");const paid=await api("capture-order",{orderId:order.id});success(paid.orderId);}
          catch {setMessage("Authentication was cancelled or the payment could not be completed.");}
          finally {paymentActive.current=false;setBusy(false);}
         })(); }, 0);
         return {transactionState:"SUCCESS"};
        }
        if (confirmation.status !== "APPROVED") throw new Error("Payment authorization was not approved.");
        const paid = await api("capture-order",{orderId:order.id});
        setTimeout(()=>success(paid.orderId),0);
        return {transactionState:"SUCCESS"};
       } catch {
        paymentActive.current=false;setBusy(false);setMessage("Payment could not be completed. Try again or use PayPal.");
        return {transactionState:"ERROR",error:{intent:"PAYMENT_AUTHORIZATION",reason:"PAYMENT_DATA_INVALID",message:"Payment could not be completed."}};
       }
      }},
     });
     const readiness = await client.isReadyToPay({apiVersion:config.apiVersion,apiVersionMinor:config.apiVersionMinor,allowedPaymentMethods:config.allowedPaymentMethods as unknown as google.payments.api.PaymentMethodSpecification[]});
     if (!readiness.result || disposed) return;
     const button = client.createButton({buttonType:"pay",buttonSizeMode:"fill",onClick:() => {
      if (!current.current.enabled || paymentActive.current) return;
      snapshot = structuredClone(current.current);paymentActive.current=true;setBusy(true);setMessage("");
      void client.loadPaymentData({apiVersion:config.apiVersion,apiVersionMinor:config.apiVersionMinor,allowedPaymentMethods:config.allowedPaymentMethods as unknown as google.payments.api.PaymentMethodSpecification[],merchantInfo:config.merchantInfo,callbackIntents:["PAYMENT_AUTHORIZATION"],transactionInfo:{countryCode:config.countryCode,currencyCode:snapshot.currency,totalPriceStatus:"FINAL",totalPrice:snapshot.amount,totalPriceLabel:"Total"}}).catch(()=>{paymentActive.current=false;setBusy(false);setMessage("Payment cancelled or unavailable. You can also use PayPal.");});
     }});
     container.replaceChildren(button);setGoogleReady(true);
    }
   } catch { /* Wallet failures leave the existing PayPal checkout available. */ }
  }
  void init();
  return () => {disposed=true;container?.replaceChildren();nativeApple.current?.abort();nativeApple.current=null;apple.current=null;};
 },[props.clientId,props.environment,props.currency]);

 function payWithApple() {
  if (!ready || !apple.current || paymentActive.current) return;
  const snapshot=structuredClone(current.current);const bridge=apple.current;
  const request={...bridge.config,total:{label:"Dionis Web",amount:snapshot.amount,type:"final" as const}};
  const session=new ApplePaySession(4,request);nativeApple.current=session;
  paymentActive.current=true;setBusy(true);setMessage("");
  session.onvalidatemerchant=async event=>{
   try {const validation=await bridge.session.validateMerchant({validationUrl:event.validationURL,displayName:"Dionis Web",domainName:window.location.hostname});session.completeMerchantValidation(validation.merchantSession);}
   catch {session.abort();paymentActive.current=false;setBusy(false);setMessage("Apple Pay could not verify this website. Please use PayPal.");}
  };
  session.onpaymentmethodselected=()=>session.completePaymentMethodSelection({newTotal:request.total});
  session.onpaymentauthorized=async event=>{
   try {
    const order=await api("create-order",snapshot.order);
    const confirmation=await bridge.session.confirmOrder({orderId:order.id,token:JSON.stringify(event.payment.token),billingContact:JSON.stringify(event.payment.billingContact || {})});
    if (confirmation.approveApplePayPayment.status !== "APPROVED") throw new Error("Payment was not approved.");
    const paid=await api("capture-order",{orderId:order.id});session.completePayment({status:ApplePaySession.STATUS_SUCCESS});success(paid.orderId);
   } catch {session.completePayment({status:ApplePaySession.STATUS_FAILURE});setMessage("Payment could not be completed. Try again or use PayPal.");}
   finally {paymentActive.current=false;setBusy(false);nativeApple.current=null;}
  };
  session.oncancel=()=>{paymentActive.current=false;setBusy(false);nativeApple.current=null;setMessage("Payment cancelled.");};
  session.begin();
 }

 return <div className="space-y-3">
  {appleReady ? <button type="button" aria-label="Pay with Apple Pay" disabled={!ready} onClick={payWithApple} className="h-12 w-full rounded-lg disabled:opacity-50" style={{WebkitAppearance:"-apple-pay-button",backgroundColor:"black",color:"white"}}>Pay with Apple Pay</button> : null}
  <div ref={googleContainer} hidden={!googleReady || !ready} className="min-h-12" />
  {busy ? <p role="status" className="text-sm text-slate-600">Confirming your payment…</p> : null}
  {message ? <p role="status" className="text-sm text-slate-600">{message}</p> : null}
 </div>;
}
