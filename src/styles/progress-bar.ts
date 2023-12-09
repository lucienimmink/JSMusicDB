import { css } from 'lit';

export default css`
  .progress {
    height: 6px;
    cursor: pointer;
    position: relative;
    background: var(--progress-background);
    overflow: hidden;
  }
  .progress-bar {
    background: var(--primary);
    height: 6px;
    position: absolute;
    pointer-events: none;
    width: 100%;
    transform: translateX(calc(-100% + var(--progress-perc, 0%)));
    transition: transform 0.1666666s linear;
  }
  .progress-bar.paused {
    animation: pulsate-animation 1s infinite;
  }
  .progress-buffered-bar {
    opacity: 0.3;
    transform: translateX(calc(-100% + var(--progress-perc, 0%)));
    transition: transform 0.1666666s linear;
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
