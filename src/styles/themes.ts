import { css } from 'lit';

export const light = css`
  :root {
    --progress: var(--lighten);
    --progress-background: var(--lighten30);
    --letter-background-hover: var(--darken);
    --letter-background-active: var(--darken30);
    --letter-color: oklch(from var(--primary) calc(l + 0.8) c h);

    --background: white;
    --text-color: oklch(from var(--background) calc(l - 0.99) c h);
    --background2: oklch(from var(--background) calc(l - 0.03) c h);
    --border-colour: oklch(from var(--background) calc(l - 0.15) c h);
    --background3: oklch(from var(--background) calc(l - 0.06) c h);

    --primary-hover: var(--darken);
  }
`;

export const dark = css`
  :root {
    --progress: var(--darken);
    --progress-background: var(--darken30);
    --letter-background-hover: var(--lighten);
    --letter-background-active: var(--lighten30);
    --letter-color: oklch(from var(--primary) calc(l - 0.8) c h);

    --background: rgb(31, 31, 31);
    --text-color: oklch(from var(--background) calc(l + 0.99) c h);
    --background2: oklch(from var(--background) calc(l + 0.03) c h);
    --border-colour: oklch(from var(--background) calc(l + 0.15) c h);
    --background3: oklch(from var(--background) calc(l + 0.06) c h);

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
