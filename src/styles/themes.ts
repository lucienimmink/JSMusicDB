import { css } from 'lit-element';

export const light = css`
  :root {
    --primary: #006ecd;
    --darken: #0067b9;
    --lighten: #0088f4;
    --darken30: #002281;
    --lighten30: #4dbbff;
    --progress: var(--lighten);
    --progress-background: var(--lighten30);
    --text-color: #000;
    --letter-color: #fff;
    --background: #f8f9fa;
    --background-seethrough: rgba(249, 249, 250, 0.9);
    --background2: #f2f4f7;
    --background2-seethrough: rgba(242, 244, 247, 0.9);
    --background3: #e9ecef;
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: var(--progress-background, #f3f4f5);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--progress, #006ecd);
  }
`;

export const dark = css`
  :root {
    --primary: rgba(0, 130, 225, 1);
    --darken: rgba(0, 146, 253, 1);
    --lighten: rgba(0, 113, 196, 1);
    --darken30: #002281;
    --lighten30: #4dbbff;
    --progress: var(--darken);
    --progress-background: var(--darken30);
    --text-light: rgba(0, 130, 225, 1);
    --text-dark: rgba(0, 130, 225, 1);
    --text-color: #fff;
    --letter-color: #000;
    --background: #1e1e1e;
    --background-seethrough: rgba(30, 30, 30, 0.9);
    --background2: #252526;
    --background2-seethrough: rgba(37, 37, 38, 0.9);
    --background3: #3c3c3c;
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: var(--progress-background, #f3f4f5);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--progress, #006ecd);
  }
`;
