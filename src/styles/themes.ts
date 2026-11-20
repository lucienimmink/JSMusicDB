import { css } from 'lit';

export const light = css`
  :root {
    color-scheme: light;

    --progress: var(--lighten);
    --progress-background: var(--lighten30);
    --letter-background-hover: var(--darken);
    --letter-background-active: var(--darken30);

    --background: #faf9f8;
    --background2: #f1f0ef;
    --border-colour: #d5d3d1;
    --background3: #e8e7e6;

    --primary-hover: var(--darken);
  }
`;

export const dark = css`
  :root {
    color-scheme: dark;

    --progress: var(--darken);
    --progress-background: var(--darken30);
    --letter-background-hover: var(--lighten);
    --letter-background-active: var(--lighten30);

    --background: #242424;
    --background2: #303030;
    --border-colour: #484848;
    --background3: #3a3a3a;

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
