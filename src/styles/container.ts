import { css } from 'lit-element';

export default css`
  .container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    display: flex;
    color: var(--text-color);
    transition: all 0.2s ease-in-out;
  }
  @media (min-width: 768px) {
    .container {
      max-width: 720px;
    }
  }
  @media (min-width: 992px) {
    .container {
      max-width: 960px;
    }
  }
  @media (min-width: 1200px) {
    .container {
      max-width: 1140px;
    }
  }
`
