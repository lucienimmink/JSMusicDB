import { css } from 'lit-element';

export default css`
  .progress {
    height: 6px;
    cursor: pointer;
    position: relative;
    background: var(--progress-background, #4dbbff);
  }
  .progress-bar {
    background: var(--primary, #006ecd);
    height: 6px;
    transition: width 0.1s linear;
    position: absolute;
    pointer-events: none;
  }
  .progress-buffered-bar {
    opacity: 0.3;
  }
`;
