import { css } from 'lit';

export default css`
  .alert {
    --distance: 3vw;
    background: var(--background2);
    padding: 1em 2em;
    border-bottom: 1px solid var(--border-colour);
    text-align: center;
  }
  .alert a {
    color: var(--primary);
  }
`;
