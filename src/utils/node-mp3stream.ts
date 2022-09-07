import { del, get, set } from 'idb-keyval';
import { fetchWithTimeout } from './fetch';
const MINIMALSTREAMVERSION = '4.0.0';
const JWT = 'jwt';
const SERVER = 'server';

export const IS_RELOADING = 'is-reloading';
export const DONE_RELOADING = 'done-reloading';
export const POLL_INTERVALL = 5000;
export const RESET_SERVER = 'reset-server';

export const canLogin = async (server: string) => {
  const serverVersion = await _versionCheck(server);
  return _semver(serverVersion.version, MINIMALSTREAMVERSION);
};

export const getPublicKey = async (server: string) => {
  const response = await fetchWithTimeout(`${server}/public-key`);
  return response.json();
};

export const getVersion = async (server: string) => {
  const serverVersion = await _versionCheck(server);
  return serverVersion?.version;
};

export const getRSSFeed = async (
  server: string,
  jwt: string,
  remote: string
) => {
  // temp ts hack for cachebusting
  const ts = new Date().getTime();
  const response = await fetchWithTimeout(
    `${server}/proxy?jwt=${jwt}&remote=${remote}&ts=${ts}`
  );
  return response.text();
};

export const authenticate = async (server: string, payload: ArrayBuffer) => {
  const response = await fetchWithTimeout(`${server}/authenticate`, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      encryptedPayload: _arrayBufferToBase64(payload),
    }),
  });
  try {
    return await response.json();
  } catch (e: any) {
    return false;
  }
};

export const getRescan = async (server: string, jwt: string) => {
  const ts = new Date().getTime();
  const response = await fetchWithTimeout(
    `${server}/rescan?jwt=${jwt}&ts=${ts}`
  );
  return response.text();
};

export const getProgress = async (server: string, jwt: string) => {
  const ts = new Date().getTime();
  const response = await fetchWithTimeout(
    `${server}/progress?jwt=${jwt}&ts=${ts}`
  );
  if (response.status === 200) {
    return response.json();
  }
  return {
    status: 'error',
    progres: 0,
  };
};

export const getJwt = async () => {
  return get(JWT);
};

export const setJwt = async (jwt: string) => {
  return set(JWT, jwt);
};
export const getServer = async () => {
  return get(SERVER);
};
export const setServer = async (server: string) => {
  return set(SERVER, server);
};
export const resetServer = async () => {
  await del(SERVER);
  return del(JWT);
};

const _versionCheck = async (server: string) => {
  const response = await fetchWithTimeout(`${server}/version`);
  return response.json();
};
const _arrayBufferToBase64 = (buffer: ArrayBuffer) =>
  btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );

const _semver = (v1: string, v2: string) => {
  const v1s = v1.split('.');
  const v2s = v2.split('.');
  if (Number(v1s[0]) > Number(v2s[0])) return true; // major
  if (Number(v1s[0]) === Number(v2s[0]) && Number(v1s[1]) > Number(v2s[1]))
    return true; // minor
  if (
    Number(v1s[0]) === Number(v2s[0]) &&
    Number(v1s[1]) === Number(v2s[1]) &&
    Number(v1s[2]) >= Number(v2s[2])
  )
    return true; // minor
  return false;
};
