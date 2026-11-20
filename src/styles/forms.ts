import { css } from 'lit';

export default css`
  select,
  input[type='text'],
  input[type='password'],
  input[type='search'],
  input[type='url'],
  input[type='email'],
  input[type='number'],
  input[type='tel'],
  textarea {
    accent-color: var(--primary);
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-color);
    background-color: var(--background2);
    background-clip: padding-box;
    border: 1px solid var(--border-colour);
    border-radius: var(--radius-small);
    transition:
      color 0.2s ease-in-out,
      background-color 0.2s ease-in-out,
      border-color 0.2s ease-in-out,
      outline-color 0.2s ease-in-out;
    &::placeholder {
      color: var(--text-color);
      opacity: 0.5;
    }
    &:focus-visible {
      border-color: var(--primary);
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  }
  input[type='checkbox'],
  input[type='radio'] {
    width: 1.125rem;
    height: 1.125rem;
    accent-color: var(--primary);
    margin: 0 0.625rem 0 0;
    cursor: pointer;
  }
  input[type='range'] {
    accent-color: var(--primary);
    margin-inline: 1em;
    cursor: pointer;
    transition: accent-color 0.2s ease-in-out;

    + output {
      accent-color: var(--primary);
      background: var(--background2);
      border: 1px solid var(--background3);
      border-radius: var(--radius-small);
      color: var(--text-color);
      padding: 0.1em 0.5em;
      font-size: 1em;
      transition: all 0.1s linear;
      margin-inline-end: 1em;
      text-align: center;
    }
  }
  select:focus-visible,
  input[type='checkbox']:focus-visible,
  input[type='radio']:focus-visible,
  input[type='range']:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;
