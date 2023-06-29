import { css } from 'lit';

export default css`
  a {
    display: flex;
    align-items: center;
    align-content: center;
    height: 100%;
    color: var(--primary, default);
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }
  a:hover {
    color: var(--primary-hover, var(--primary, default));
  }
  a:not([href]) {
    color: var(--text-color, default);
  }
  span {
    width: 100%;
    display: block;
  }
  .inline {
    display: inline;
  }
  .inline span {
    display: inline;
  }
  .flex {
    display: flex;
    width: 100%;
  }
  .flex span {
    display: flex;
  }
  .letter {
    color: var(--letter-color, default);
  }
  .letter:hover {
    color: var(--letter-color, default);
  }
  .text {
    color: var(--text-color, default);
  }
  .text:hover {
    color: var(--text-color, default);
  }
  .menu {
    padding: 15px;
    color: var(--text-color, default);
  }
  :host {
    overflow: hidden;
  }
  /* :hover ::slotted(.panel),
  :focus ::slotted(.panel) {
    transform: scale(1.02);
  }
  :active ::slotted(.panel) {
    transform: scale(0.98);
  } */
  @media (min-width: 576px) {
    .menu {
      padding: 25px;
    }
  }
`;
