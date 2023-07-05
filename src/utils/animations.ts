import { css } from 'lit';

export const animationCSS = css`
  :host {
    --animate-duration: 0.2s;
    --animate-duration-slow: 1s;
    --animate-delay: 0.5s;
    --animate-repeat: 1;
  }
  .animate__animated {
    animation-duration: var(--animate-duration);
    animation-fill-mode: both;
  }
  @media print, (prefers-reduced-motion: reduce) {
    .animate__animated {
      animation-duration: 1ms !important;
      transition-duration: 1ms !important;
      animation-iteration-count: 1 !important;
    }
    .animate__animated[class*='Out'] {
      opacity: 0;
    }
  }
  @keyframes slideInUp {
    from {
      transform: translate3d(0, 30px, 0);
      opacity: 0;
      visibility: visible;
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  @keyframes slideInDown {
    from {
      transform: translate3d(0, -30px, 0);
      opacity: 0;
      visibility: visible;
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  @keyframes fadeOut {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }
  .animate__slideInUp {
    animation-name: slideInUp;
  }
  .animate__slideInDown {
    animation-name: slideInDown;
  }
  .animate__fadeOut {
    animation-duration: var(--animate-duration-slow);
    animation-name: fadeOut;
    animation-timing-function: ease-out;
  }
`;

export const animateCSS = (
  element: Element | NodeListOf<Element> | null | undefined,
  animation: string,
  prefix = 'animate__',
) =>
  // We create a Promise and return it
  new Promise(resolve => {
    const animationName = `${prefix}${animation}`;
    if (element instanceof NodeList) {
      element.forEach((el: Element) => {
        _handleEvents(el, animationName, prefix, resolve);
      });
      return;
    }
    _handleEvents(element, animationName, prefix, resolve);
  });
const _handleEvents = (
  element: Element | null | undefined,
  animationName: string,
  prefix: string,
  resolve: any,
) => {
  element?.classList.add(`${prefix}animated`, animationName);
  // When the animation ends, we clean the classes and resolve the Promise
  function handleAnimationEnd() {
    element?.classList.remove(`${prefix}animated`, animationName);
    resolve('Animation ended');
  }
  element?.addEventListener('animationend', handleAnimationEnd, { once: true });
};
