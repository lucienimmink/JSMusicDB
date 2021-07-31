/* eslint-disable no-undef */
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';
import dotenv from 'dotenv';
dotenv.config();

const replace = fromRollup(rollupReplace);
const processEnvKeys = Object.keys(process.env);
const replaced = {};
processEnvKeys.forEach(key => {
  replaced[`process.env.${key}`] = JSON.stringify(process.env[key]);
});

export default {
  plugins: [replace(replaced)],
};
