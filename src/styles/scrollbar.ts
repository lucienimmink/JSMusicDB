import { css } from 'lit';

export default css`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: var(--progress-background);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--progress);
  }
`;
