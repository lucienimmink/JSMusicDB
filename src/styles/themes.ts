import { css } from 'lit';

export const light = css`
  :root {
    --primary: rgb(0, 110, 205);
    --darken: rgb(0, 98, 178);
    --lighten: rgb(20, 121, 204);
    --darken30: rgb(0, 70, 127);
    --lighten30: rgb(61, 139, 204);
    --progress: var(--lighten);
    --progress-background: var(--lighten30);
    --letter-background-hover: var(--darken);
    --letter-background-active: var(--darken30);
    --text-color: black;
    --letter-color: white;
    --background: rgb(249, 249, 249);
    --background-seethrough: rgba(249, 249, 249, 0.9);
    --background2: rgb(243, 243, 243);
    --background2-seethrough: rgba(243, 243, 243, 0.9);
    --background3: rgb(236, 236, 236);
    --background3-seethrough: rgba(236, 236, 236, 0.9);
    --background-floating-text: rgba(249, 249, 249, 0.25);
    --primary-hover: var(--darken);
  }
`;

export const dark = css`
  :root {
    --primary: rgb(0, 144, 255);
    --darken: rgb(0, 130, 229);
    --lighten: rgb(25, 155, 255);
    --darken30: rgb(0, 101, 178);
    --lighten30: rgb(76, 177, 255);
    --progress: var(--darken);
    --progress-background: var(--darken30);
    --letter-background-hover: var(--lighten);
    --letter-background-active: var(--lighten30);
    --text-light: rgba(0, 130, 225, 1);
    --text-dark: rgba(0, 130, 225, 1);
    --text-color: white;
    --letter-color: white;
    --background: rgb(30, 30, 30);
    --background-seethrough: rgba(30, 30, 30, 0.9);
    --background2: rgb(37, 37, 38);
    --background2-seethrough: rgba(37, 37, 38, 0.9);
    --background3: rgb(60, 60, 60);
    --background3-seethrough: rgba(60, 60, 60, 0.9);
    --background-floating-text: rgba(30, 30, 30, 0.25);
    --album-art-filter: invert(0.9);
    --primary-hover: var(--lighten);
  }
`;

export const system = css`
  @media (prefers-color-scheme: light) {
    ${light}
  }
  @media (prefers-color-scheme: dark) {
    ${dark}
  }
`;
