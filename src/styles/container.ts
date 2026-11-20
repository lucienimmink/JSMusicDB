import { css } from 'lit';

export default css`
  ::-moz-selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  ::selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  .container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    display: flex;
    color: var(--text-color);
    box-sizing: border-box;
    transition:
      color 0.05s ease-in-out,
      background-color 0.5s ease-in-out;

    @media (min-width: 768px) {
      max-width: 748px;
    }
    @media (min-width: 992px) {
      max-width: 890px;
    }
    @media (min-width: 1200px) {
      max-width: 1140px;
    }
    @media (min-width: 1600px) {
      max-width: 65vw;
    }
  }
  .container-block {
    display: block;
  }
  .p-1 {
    padding: 1rem;
    @media (min-width: 768px) {
      padding: 0;
    }
  }
`;
