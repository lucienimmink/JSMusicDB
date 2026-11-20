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

    &:hover {
      color: var(--primary-hover, var(--primary, default));
    }
    &:not([href]) {
      color: var(--text-color, default);
    }
  }
  span {
    width: 100%;
    display: block;
  }
  .inline {
    display: inline;
    span {
      display: inline;
    }
  }
  .flex {
    display: flex;
    width: 100%;
    span {
      display: flex;
    }
  }
  .menu.flex {
    box-sizing: border-box;
    span {
      justify-content: var(--menu-content-justify, flex-start);
    }
  }
  .letter {
    color: var(--letter-color, default);

    &:hover {
      color: var(--letter-color, default);
    }
  }
  .text {
    color: var(--text-color, default);

    &:hover {
      color: var(--text-color, default);
    }
  }
  .menu {
    padding: 15px;
    color: var(--text-color, default);
    @media (min-width: 576px) {
      padding: 21px 0;
    }
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
`;
