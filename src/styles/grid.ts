import { css } from 'lit';

export default css`
  :host {
    --distance: 3vw;
    display: block;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    align-items: stretch;
    display: flex;
    padding: var(--distance) 0;
    gap: var(--distance);
  }
  @media (min-width: 768px) {
    :host {
      --distance: 1vw;
      margin-left: var(--distance);
      width: calc(100% - 2 * var(--distance));
    }
  }
`;
