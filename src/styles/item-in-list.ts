import { css } from 'lit';

export default css`
  app-link {
    display: flex;
    padding: 0 1rem;
    height: 100%;
    transition: background-color 0.2s ease-in-out;
  }
  app-link:hover {
    border-top-color: var(--border-colour);
    background: var(--background2);
  }
  album-art {
    width: 50px;
    height: 50px;
    margin-right: 0.75rem;
    flex-grow: 0;
    flex-shrink: 0;
    border: 1px solid var(--background2);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0px 0px 1px var(--primary);
  }
  .details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: calc(100vw - 2rem - 50px - 0.75rem);
  }
  .details .artist,
  .details .album {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
