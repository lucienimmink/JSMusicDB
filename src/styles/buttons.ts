import { css } from 'lit';

export default css`
  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    cursor: pointer;
    text-align: center;
    vertical-align: middle;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }
  .btn-min-width {
    min-width: 10rem;
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
  .btn-secondary {
    border: 2px solid var(--border-colour);
    background-color: var(--background2);
    color: var(--text-color);
  }
  .btn-secondary:hover,
  .btn-secondary:focus {
    border-color: var(--primary);
    outline: none;
  }
  .btn-secondary:active {
    border-color: var(--darken30);
    background-color: var(--darken);
    color: var(--letter-color);
  }
  .btn-transparent,
  .btn-link {
    color: var(--primary);
    padding: 0;
    border: 0;
    background-color: transparent;
  }
  .btn-link {
    text-decoration: none;
  }
  .btn-transparent:hover,
  .btn-transparent:focus {
    outline: none;
    border: 0;
    color: var(--darken30);
  }
  .btn-link:hover,
  .btn-link:focus {
    text-decoration: underline;
  }
  .btn-icon {
    width: 1.5rem;
  }
  .btn + .btn {
    margin-left: 1rem;
  }
  .btn .icon {
    display: inline-block;
    vertical-align: inherit;
  }
  .btn .icon svg {
    display: block;
    height: 1rem;
  }
  .btn.disabled,
  .btn[disabled] {
    pointer-events: none;
    opacity: 0.5;
    filter: blur(1px);
  }
`;
