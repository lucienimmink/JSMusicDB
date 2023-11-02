import { css } from 'lit';

export default css`
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
  }
`;
