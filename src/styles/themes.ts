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
    --text-color: rgb(59, 59, 59);
    --letter-color: white;
    --background: rgb(255, 255, 255);
    --background-seethrough: rgba(255, 255, 255, 0.9);
    --background2: rgb(243, 243, 243);
    --background2-seethrough: rgba(243, 243, 243, 0.9);
    --background-floating-text: rgba(243, 243, 243, 0.25);
    --background-album-art: rgb(225, 225, 225);
    --border-colour: rgb(188, 188, 188);
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
    --text-color: rgb(204, 204, 204);
    --letter-color: white;
    --background: rgb(31, 31, 31);
    --background-seethrough: rgba(31, 31, 31, 0.9);
    --background2: rgb(24, 24, 24);
    --background2-seethrough: rgba(24, 24, 24, 0.9);
    --background-floating-text: rgba(24, 24, 24, 0.25);
    --background-album-art: rgb(74, 74, 74);
    --border-colour: rgb(42, 42, 42);
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
