import { css } from 'lit';

export const light = css`
  :root {
    --primary: rgb(0, 65, 122);
    --progress: var(--lighten);
    --progress-background: var(--lighten30);
    --letter-background-hover: var(--darken);
    --letter-background-active: var(--darken30);
    --letter-color: oklch(from var(--primary) calc(l + 60) c h);

    --background: white;
    --text-color: oklch(from var(--background) calc(l - 99) c h);
    --background2: oklch(from var(--background) calc(l - 3) c h);
    --border-colour: oklch(from var(--background) calc(l - 15) c h);

    --primary-hover: var(--darken);
  }
`;

export const dark = css`
  :root {
    --primary: rgb(148, 209, 255);
    --progress: var(--darken);
    --progress-background: var(--darken30);
    --letter-background-hover: var(--lighten);
    --letter-background-active: var(--lighten30);
    --letter-color: oklch(from var(--primary) calc(l - 60) c h);

    --background: rgb(31, 31, 31);
    --text-color: oklch(from var(--background) calc(l + 99) c h);
    --background2: oklch(from var(--background) calc(l + 3) c h);
    --border-colour: oklch(from var(--background) calc(l + 15) c h);

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
