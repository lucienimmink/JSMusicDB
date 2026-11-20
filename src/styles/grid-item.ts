import { css } from 'lit';

export default css`
  app-link {
    album-art {
      display: block;
      transition: transform 0.2s ease-in-out;
    }
    &:hover album-art {
      transform: scale(1.05);
    }
    &:active album-art {
      transform: scale(0.95);
    }
    .panel {
      overflow: hidden;
      transition: all 0.2s ease-in-out;
    }
    &:hover .panel {
      border-color: var(--primary);
    }
  }
`;
