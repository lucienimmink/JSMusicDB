import { css } from 'lit-element';

export default css`
  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    cursor: pointer;
    text-align: center;
    vertical-align: middle;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
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
`;
