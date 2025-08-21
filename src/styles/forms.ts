import { css } from 'lit';

export default css`
  select,
  input[type=text],
  input[type=password],
  input[type=search],
  input[type=url],
  textarea {
    accent-color: var(--primary);
    width: 100%;
    box-sizing: border-box;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-color);
    background-color: var(--background2-seethrough);
    background-clip: padding-box;
    border: 1px solid var(--primary);
    border-radius: 0;
    transition: all 0.5s ease-in-out;
    &::placeholder {
      color: var(--text-color);
      opacity: 0.5;
    }
    &:focus {
      outline: 2px solid var(--primary);
    }
  }
  input[type='checkbox'],
  input[type='radio'] {
    width: 1.5rem;
    height: 1.5rem;
    accent-color: var(--primary);
    margin: 0 0.75rem 0 0;
  }
  input[type='range'] {
    accent-color: var(--primary);
    margin-inline: 1em;
    transition: all 0.5s ease-in-out;

    + output {
      accent-color: var(--primary);
      background: var(--background2);
      border: 1px solid var(--background3);
      color: var(--text-color);
      padding: 0.1em 0.5em;
      font-size: 1em;
      transition: all 0.1s linear;
      margin-inline-end: 1em;
      text-align: center;
    }
`;
