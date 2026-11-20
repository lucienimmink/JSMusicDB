/* eslint-disable no-undef */
import * as dotenv from 'dotenv';
import { openAsBlob } from 'node:fs';
dotenv.config();

try {
  const blob = await openAsBlob('./dist.zip', { type: 'application/zip' });
  const response = await fetch(
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

  if (!response.ok) {
    throw new Error(
      `Netlify deployment failed: ${response.status} ${response.statusText}`,
    );
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
