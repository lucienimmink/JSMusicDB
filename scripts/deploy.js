/* eslint-disable no-undef */
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
    },
  );
  process.exit(0);
} catch (error) {
  process.exit(1);
}
