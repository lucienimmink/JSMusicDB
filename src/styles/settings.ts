import { css } from 'lit';

export default css`
  .btn-small {
    margin-left: 1rem;
  }
  p {
    margin: 0.5rem 1rem 0.7rem;
    display: flex;
    align-items: center;
  }
  p.radio-group {
    flex-direction: column;
    align-items: flex-start;
  }
  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 0.5rem;
  }
  input[type='checkbox'],
  input[type='radio'] {
    width: 1.5rem;
    height: 1.5rem;
    accent-color: var(--primary);
    margin: 0 0.75rem 0 0;
  }
  input[type='url'] {
    accent-color: var(--primary);
    background: var(--background2);
    border: 0;
    color: var(--text-color);
    padding: 1em 2em;
    font-size: 1em;
    width: 100%;
    transition: all 0.5s ease-in-out;
  }
  select {
    background: var(--background2);
    padding: 0.3rem 0.5rem;
    color: var(--text-color);
    margin-inline-start: 0.5em;
  }
  select:focus {
    outline: 2px solid var(--primary);
  }
`;
