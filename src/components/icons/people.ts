import { symbolIcon } from './symbol';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none" stroke="#65646a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(32 32) scale(0.5)"><circle cx="48" cy="43" r="15" /><circle cx="88" cy="47" r="12" /><path d="M16 105a32 32 0 0 1 64 0m-1-24a25 25 0 0 1 41 19" /></g></svg>`;

export const peopleIcon = symbolIcon(
  `<circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0m0-5.5a5 5 0 0 1 6 4.5" />`,
);
export const peopleSVG = svg;
