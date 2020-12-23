import { css } from 'lit-element';

export default css`
  .container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    display: flex;
    color: var(--text-color);
    box-sizing: border-box;
    transition: color 0.05s ease-in-out, background-color 0.5s ease-in-out;
  }
  .p-1 {
    padding: 1rem;
  }
  @media (min-width: 768px) {
    .container {
      max-width: 720px;
    }
    .p-1 {
      padding: 0;
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
`;
