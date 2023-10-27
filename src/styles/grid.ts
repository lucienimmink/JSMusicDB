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
  app-link album-art {
    display: block;
    transition: transform 0.2s ease-in-out;
  }
  app-link:hover album-art {
    transform: scale(1.05);
  }
  app-link:active album-art {
    transform: scale(0.95);
  }
  app-link .panel {
    overflow: hidden;
    transition: all 0.2s ease-in-out;
  }
  app-link:hover .panel {
    border-color: var(--primary);
    border-radius: 0.5rem;
  }
  @media (min-width: 768px) {
    :host {
      --distance: 1vw;
      margin-left: var(--distance);
      width: calc(100% - 2 * var(--distance));
    }
  }
`;
