import { css } from 'lit-element';

export default css`
  .btn {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  .btn-small {
    font-size: 0.9rem;
    padding: 0.2rem 0.5rem;
  }
  .btn-primary {
    border: 2px solid var(--primary);
    background-color: var(--primary);
    color: var(--letter-color);
  }
  .btn-primary:hover,
  .btn-primary:focus {
    border-color: var(--darken30);
    outline: none;
  }
  .btn-primary:active {
    border-color: var(--darken30);
    background-color: var(--darken);
  }
  @media (min-width: 576px) {
    .btn {
      font-size: 1.1rem;
    }
    .btn-small {
      font-size: 1rem;
    }
  }
`
