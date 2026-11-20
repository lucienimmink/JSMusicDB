import { symbolIcon } from './symbol';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none" stroke="#65646a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(32 32) scale(0.5)"><circle cx="64" cy="64" r="47" /><circle cx="64" cy="64" r="25" /><circle cx="64" cy="64" r="5" /><path d="M37 33a38 38 0 0 1 46-8M91 96a38 38 0 0 1-18 10" /></g></svg>`;

export const cdIcon = symbolIcon(
  `<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r=".75" /><path d="M7 6a7 7 0 0 1 9-1" />`,
);
export const cdSVG = svg;
