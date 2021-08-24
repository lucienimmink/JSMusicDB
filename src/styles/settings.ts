import { css } from 'lit-element';

export default css`
  .btn-small {
    margin-left: 1rem;
  }
  .container {
    display: block;
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
`;
