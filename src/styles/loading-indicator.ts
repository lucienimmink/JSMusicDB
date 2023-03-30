import { css } from 'lit';

export const loadingIndicator = css`
  :host {
    width: 180px;
  }
  .progress-bar {
    height: 6px;
    display: block;
    transition: width 0.1s linear;
    position: relative;
    background: transparent;
    width: 320px;
  }
  .progress-circle {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation: progress-bar-animation 3s infinite;
    background-color: var(--primary, #006ecd);
  }
  .progress-circle:nth-child(2) {
    animation-delay: 200ms;
  }
  .progress-circle:nth-child(3) {
    animation-delay: 400ms;
  }
  .progress-circle:nth-child(4) {
    animation-delay: 600ms;
  }
  .progress-circle:nth-child(5) {
    animation-delay: 800ms;
  }
  @keyframes progress-bar-animation {
    0% {
      transform: translate(0, 0);
      animation-timing-function: ease-in;
      opacity: 0;
    }
    30% {
      transform: translate(60px, 0);
      animation-timing-function: linear;
      opacity: 1;
    }
    70% {
      transform: translate(120px, 0);
      animation-timing-function: ease-out;
      opacity: 1;
    }
    100% {
      transform: translate(180px, 0);
      opacity: 0;
    }
  }
`;

export const progressSpinner = css`
  .lds-roller {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
    transform: scale(0.6);
  }
  .lds-roller div {
    animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    transform-origin: 40px 40px;
  }
  .lds-roller div:after {
    content: ' ';
    display: block;
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--primary);
    margin: -4px 0 0 -4px;
  }
  .lds-roller div:nth-child(1) {
    animation-delay: -0.036s;
  }
  .lds-roller div:nth-child(1):after {
    top: 63px;
    left: 63px;
  }
  .lds-roller div:nth-child(2) {
    animation-delay: -0.072s;
  }
  .lds-roller div:nth-child(2):after {
    top: 68px;
    left: 56px;
  }
  .lds-roller div:nth-child(3) {
    animation-delay: -0.108s;
  }
  .lds-roller div:nth-child(3):after {
    top: 71px;
    left: 48px;
  }
  .lds-roller div:nth-child(4) {
    animation-delay: -0.144s;
  }
  .lds-roller div:nth-child(4):after {
    top: 72px;
    left: 40px;
  }
  .lds-roller div:nth-child(5) {
    animation-delay: -0.18s;
  }
  .lds-roller div:nth-child(5):after {
    top: 71px;
    left: 32px;
  }
  .lds-roller div:nth-child(6) {
    animation-delay: -0.216s;
  }
  .lds-roller div:nth-child(6):after {
    top: 68px;
    left: 24px;
  }
  .lds-roller div:nth-child(7) {
    animation-delay: -0.252s;
  }
  .lds-roller div:nth-child(7):after {
    top: 63px;
    left: 17px;
  }
  .lds-roller div:nth-child(8) {
    animation-delay: -0.288s;
  }
  .lds-roller div:nth-child(8):after {
    top: 56px;
    left: 12px;
  }
  .text {
    position: relative;
    top: -55px;
    left: 29px;
    width: 24px;
    text-align: center;
  }
  @keyframes lds-roller {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
export const progressBar = css`
  .progress {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 20px;
    font-size: 0.75rem;
    margin-top: env(titlebar-area-height, 30px);
    width: calc(100vw - env(titlebar-area-width, 0));
  }
  .text {
    width: 50px;
    margin-left: 10px;
    text-align: center;
  }
  .progress-bar {
    height: 6px;
    display: block;
    position: relative;
    background: transparent;
    width: 100%;
    flex-grow: 1;
    background: var(--background);
    position: relative;
  }
  .progress-bar div {
    position: absolute;
    height: 6px;
    left: 0;
    background: var(--primary);
    transition: width 0.1s linear;
  }
`;
