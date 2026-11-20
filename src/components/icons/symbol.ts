import { html } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

export const symbolIcon = (content: string) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    style="fill: none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    ${unsafeSVG(content)}
  </svg>`;
