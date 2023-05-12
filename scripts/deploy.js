/* eslint-disable no-undef */
// curl -H "Content-Type: application/zip" -H "Authorization: Bearer zFkWLDLJ3AI4Wizd2nn-4Uuonm16iilMIZSkq_gLxtU" --data-binary "@dist.zip" https://api.netlify.com/api/v1/sites/65dee498-23a1-43a7-8686-f350ae7b4b9a/deploys
import * as dotenv from 'dotenv';
import fetch, { fileFromSync } from 'node-fetch';
dotenv.config();

const blob = fileFromSync('./dist.zip', 'application/zip');

try {
  await fetch(
    `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`,
    {
      method: 'POST',
      body: blob,
      headers: {
        'Content-Type': 'application/zip',
        Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
      },
    }
  );
  process.exit(0);
} catch (error) {
  process.exit(1);
}
