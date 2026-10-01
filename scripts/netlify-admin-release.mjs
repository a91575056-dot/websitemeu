// Stage one immutable draft, test it, then restore that exact verified deploy.
// Run only after inspecting current GitHub/Netlify linkage and production source.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const site='c42e886a-dd3a-4dcb-9958-286d5417efb7';
const siteName='enchanting-cajeta-137e06';
const cli=process.env.NETLIFY_CLI_PATH||'/workspace/.cloud-tools/netlify/node_modules/.bin/netlify';
const accountFile=process.env.ADMIN_TEST_ACCOUNT_FILE;
const manifest=process.env.ADMIN_RELEASE_MANIFEST||'/workspace/.cloud-tools/admin-release.json';
const env={...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||'/workspace/.cloud-tools/config',NETLIFY_TELEMETRY_DISABLED:'1'};
function invoke(args) {
 const result=spawnSync(cli,args,{env,encoding:'utf8',maxBuffer:16*1024*1024});
 // CLI output can include environment values; never echo it while configuring credentials.
 if(result.status!==0) throw new Error(`Netlify command ${args[0]} failed (exit ${result.status}); verify account permissions and authentication. Output withheld to protect secrets.`);
 return result.stdout;
}
function api(operation, params) { return JSON.parse(invoke(['api',operation,'--data',JSON.stringify(params)])); }
function configureAccount() {
 const metadata=api('getSite',{site_id:site});
 if(metadata.id!==site || metadata.name!==siteName || !metadata.account_slug)throw new Error('Unexpected Netlify account/site metadata.');
 const params={account_id:metadata.account_slug,site_id:site};
 const existing=api('getEnvVars',params);
 const records=[{key:'ADMIN_USERNAME',values:[{context:'all',value:account.username}],is_secret:false},{key:'ADMIN_PASSWORD_HASH',values:['production','deploy-preview','branch-deploy'].map(context=>({context,value:account.passwordHash})),is_secret:true}];
 for(const record of records) {
  if(existing.some(item=>item.key===record.key))api('updateEnvVar',{...params,key:record.key,body:record});
  else api('createEnvVars',{...params,body:[record]});
 }
}
function git(args) { const r=spawnSync('git',args,{encoding:'utf8'});if(r.status) throw new Error('Git validation failed.');return r.stdout.trim(); }
if(!accountFile) throw new Error('Set ADMIN_TEST_ACCOUNT_FILE to the private account file outside Git.');
const account=JSON.parse(readFileSync(accountFile));
const digest=createHash('sha256').update(account.passwordHash).digest('hex');
const mode=process.argv[2];
if(mode==='preview') {
 if(existsSync(manifest)) throw new Error('Release manifest exists; preserve it and choose a new path for a new release.');
 if(git(['status','--porcelain'])) throw new Error('Commit the reviewed source before staging a release.');
 configureAccount();
 const raw=invoke(['deploy','--site',siteName,'--dir','out','--functions','netlify/functions','--skip-functions-cache','--context','production','--json','--message',`Admin română preview ${git(['rev-parse','HEAD'])}`]);
 const start=raw.indexOf('{');if(start<0)throw new Error('No deploy JSON returned.');const d=JSON.parse(raw.slice(start));
 if(d.site_id!==site || !d.deploy_id || !d.deploy_url) throw new Error('Unexpected deployment identity.');
 writeFileSync(manifest,JSON.stringify({site,deployId:d.deploy_id,url:d.deploy_url,commit:git(['rev-parse','HEAD']),accountDigest:digest,verified:false},null,2),{mode:0o600,flag:'wx'});
 console.log(JSON.stringify({deployId:d.deploy_id,url:d.deploy_url}));
} else if(mode==='verify') {
 const release=JSON.parse(readFileSync(manifest));if(release.site!==site || release.accountDigest!==digest)throw new Error('Release/account mismatch.');
 const r=spawnSync(process.execPath,['tests/admin-browser.mjs'],{env:{...env,ADMIN_TEST_URL:release.url},stdio:'inherit'});if(r.status!==0)throw new Error('Preview browser checks failed; production blocked.');
 // Read-only public and function checks are also required before marking the preview verified.
 const smoke=spawnSync(process.execPath,['tests/public-smoke.mjs'],{env:{...env,SITE_TEST_URL:release.url},stdio:'inherit'});if(smoke.status!==0)throw new Error('Public smoke checks failed; production blocked.');
 release.verified=true;release.verifiedAt=new Date().toISOString();writeFileSync(manifest,JSON.stringify(release,null,2),{mode:0o600});console.log('Preview verified.');
} else if(mode==='publish') {
 const release=JSON.parse(readFileSync(manifest));
 if(!release.verified || release.site!==site || release.accountDigest!==digest || release.commit!==git(['rev-parse','HEAD']) || git(['status','--porcelain']))throw new Error('A verified matching preview and clean source are required.');
 // Restore promotes the already-tested immutable deploy; it does not rebuild different code.
 invoke(['api','restoreSiteDeploy','--data',JSON.stringify({site_id:site,deploy_id:release.deployId})]);
 console.log(`Promoted verified deploy ${release.deployId}. Verify production before claiming success.`);
} else throw new Error('Use preview, verify or publish.');
