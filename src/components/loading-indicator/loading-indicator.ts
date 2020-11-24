import { LitElement, customElement, html, css } from "lit-element";

@customElement('loading-indicator')
export class Loading extends LitElement {
  static get styles() {
    return css`
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
    `
  }
  render() {
    return html`
    <div class="progress-bar">
      <div class="progress-circle"></div>
      <div class="progress-circle"></div>
      <div class="progress-circle"></div>
      <div class="progress-circle"></div>
      <div class="progress-circle"></div>
    </div>
    `
  }
}
