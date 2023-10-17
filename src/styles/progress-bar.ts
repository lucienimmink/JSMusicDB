import { css } from 'lit';

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
    transition: width 0.3s linear;
    position: absolute;
    pointer-events: none;
  }
  .progress-bar.paused {
    animation: pulsate-animation 1s infinite;
  }
  .progress-buffered-bar {
    opacity: 0.3;
  }
  .progress .text {
    font-variant-numeric: tabular-nums;
    font-family: system-ui;
  }
  @keyframes pulsate-animation {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
`;
