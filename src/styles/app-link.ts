import { css } from 'lit-element';

export default css`
  a {
    display: flex;
    align-items: center;
    align-content: center;
    height: 100%;
    color: var(--primary, default);
    text-decoration: none;
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
  .text {
    color: var(--text-color, default);
  }
  .menu {
    padding: 15px;
    color: var(--text-color, default);
  }
  @media (min-width: 576px) {
    .menu {
      padding: 25px;
    }
  }
`;
