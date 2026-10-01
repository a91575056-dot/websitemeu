// Run outside production setup only when creating/rotating the administrator.
// No credentials are embedded in this script or emitted to stdout.
import { randomBytes } from 'node:crypto';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { isAbsolute, dirname } from 'node:path';
import { passwordHash } from '../netlify/functions/lib/admin-core.mjs';
const output=process.argv[2];
if(!output || !isAbsolute(output) || existsSync(output)) throw new Error('Supply a new private output file path; existing files are never overwritten.');
const password=randomBytes(24).toString('base64url');
const account={username:'dionis',password,passwordHash:passwordHash(password)};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(account),{mode:0o600,flag:'wx'});
console.log('Account generated in the specified private file. Configure ADMIN_USERNAME and ADMIN_PASSWORD_HASH in Netlify function environment. Never commit this file.');
