/* eslint-disable no-undef */
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';
import dotenv from 'dotenv';
dotenv.config();

const replace = fromRollup(rollupReplace);

export default {
  plugins: [
    replace({
      'process.env.LASTFM_APIKEY': JSON.stringify(process.env.LASTFM_APIKEY),
      'process.env.LASTFM_SECRET': JSON.stringify(process.env.LASTFM_SECRET),
      'process.env.FANART_APIKEY': JSON.stringify(process.env.FANART_APIKEY),
    }),
  ],
};
