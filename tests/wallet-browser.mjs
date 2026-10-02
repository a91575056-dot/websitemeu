// Browser contract tests use simulated provider SDKs. They never authorize real payments.
import{chromium}from'playwright';import assert from'node:assert/strict';
import { paymentOptionsForClient } from '../netlify/functions/paypal-shared.mjs';
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:8888';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:new URL(base).hostname==='127.0.0.1'?undefined:{server:process.env.HTTPS_PROXY}});
async function scenario({eligible=true,domain=true,threeDS=false,reject3DS=false,kind='google',captureOK=true}){
 const page=await browser.newPage();const orders=[];let captures=0;
 await page.route('**/api/paypal/config',r=>r.fulfill({json:{enabled:true,clientId:'local-sdk-contract-only',currency:'USD',environment:'sandbox',paymentOptions:paymentOptionsForClient('USD')}}));
 await page.route('**/api/paypal/wallets',r=>r.fulfill({json:{available:true,applePayEligible:eligible,googlePayEligible:eligible,appleDomainVerified:domain}}));
 await page.route('**/api/paypal/create-order',r=>{orders.push(r.request().postDataJSON());return r.fulfill({json:{id:'TESTORDER123',status:'CREATED'}});});
 await page.route('**/api/paypal/capture-order',r=>{captures++;return r.fulfill({status:captureOK?200:409,json:{ok:captureOK,orderId:'TESTORDER123',message:'Capture not completed'}});});
 await page.route('**/sdk/js?**',r=>r.fulfill({contentType:'application/javascript',body:`window.paypal={Buttons:()=>({isEligible:()=>true,render:async el=>{el.innerHTML='<button>PayPal contract button</button>'},close:()=>{}})}` }));
 await page.addInitScript(({threeDS,reject3DS})=>{
  class NativeApple {static STATUS_SUCCESS=1;static STATUS_FAILURE=0;static canMakePayments(){return true;}constructor(){window.testApple=this;}begin(){this.onvalidatemerchant({validationURL:'https://apple.test/validation'});}completeMerchantValidation(){}completePaymentMethodSelection(){}completePayment(v){window.appleResult=v;}abort(){}}
  window.ApplePaySession=NativeApple;
  window.paypalWallets={version:'6.0.0',createInstance:async()=>({findEligibleMethods:async()=>({isEligible:()=>true,getDetails:()=>({config:{merchantCountry:'US'}})}),createApplePayOneTimePaymentSession:()=>({formatConfigForPaymentRequest:()=>({merchantCountry:'US',merchantCapabilities:['supports3DS'],supportedNetworks:['visa']}),validateMerchant:async()=>({merchantSession:{}}),confirmOrder:async()=>({approveApplePayPayment:{status:'APPROVED'}})}),createGooglePayOneTimePaymentSession:()=>({formatConfigForPaymentRequest:()=>({countryCode:'US',apiVersion:2,apiVersionMinor:0,allowedPaymentMethods:[],merchantInfo:{merchantId:'fixture-merchant'}}),confirmOrder:async()=>({status:threeDS?'PAYER_ACTION_REQUIRED':'APPROVED'}),initiatePayerAction:async()=>{if(reject3DS)throw new Error('3DS cancelled');return{liabilityShift:'YES'};}})})};
  window.google={payments:{api:{PaymentsClient:class{constructor(o){this.callbacks=o.paymentDataCallbacks;}async isReadyToPay(){return{result:true};}createButton(o){const b=document.createElement('button');b.textContent='Google Pay contract button';b.onclick=o.onClick;return b;}async loadPaymentData(data){window.googleTotal=data.transactionInfo.totalPrice;const result=await this.callbacks.onPaymentAuthorized({paymentMethodData:{}});window.googleResult=result;}}}}};
 },{threeDS,reject3DS});
 try{
  await page.goto(base);await page.getByLabel('First name',{exact:true}).fill('Test');await page.getByLabel('Last name',{exact:true}).fill('Client');await page.getByLabel('Email',{exact:true}).fill('test@example.invalid');await page.getByLabel('Phone',{exact:true}).fill('+1234567890');await page.locator('input[value="custom-project"]').check();await page.getByLabel('Custom amount (USD)').fill('1');
  await page.getByRole('button',{name:'PayPal contract button'}).waitFor();
  if(!eligible){assert.equal(await page.getByRole('button',{name:'Pay with Apple Pay'}).count(),0);assert.equal(await page.getByRole('button',{name:'Google Pay contract button'}).count(),0);return;}
  if(!domain)assert.equal(await page.getByRole('button',{name:'Pay with Apple Pay'}).count(),0);
  if(kind==='apple'){await page.getByRole('button',{name:'Pay with Apple Pay'}).click();await page.evaluate(()=>window.testApple.onpaymentauthorized({payment:{token:{},billingContact:{}}}));}
  else await page.getByRole('button',{name:'Google Pay contract button'}).click();
  if(reject3DS||!captureOK){await page.getByRole('status').filter({hasText:/could not be completed/}).waitFor();assert.equal(captures,reject3DS?0:1);assert.ok(!page.url().includes('payment-success'));}
  else{await page.waitForURL('**/payment-success?order=TESTORDER123');assert.equal(captures,1);}
  assert.equal(orders[0].amount,'1');assert.equal(orders[0].packageId,'custom-project');
 }finally{await page.close();}
}
try{await scenario({eligible:false});await scenario({domain:false});await scenario({kind:'apple'});await scenario({threeDS:true});await scenario({threeDS:true,reject3DS:true});await scenario({captureOK:false});console.log('PASS 6 simulated wallet browser scenarios: eligibility, domain gate, Apple authorization, Google authorization, 3DS success/cancel, capture failure and Custom 1 USD');}finally{await browser.close();}
