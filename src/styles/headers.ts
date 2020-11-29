import { css } from 'lit-element';

export default css`
  .header {
    background: var(--background, rgba(248, 249, 250, 0.85));
    box-sizing: border-box;
    height: 60px;
    border-bottom: 1px solid var(--primary, #006ecd);
    transition: border-bottom-color 0.2s ease-in-out;
    padding: 1.5rem 1rem 0;
    position: sticky;
    z-index: 1;
    margin-bottom: -1px;
    top: 50px;
    font-size: 1.3rem;
    font-weight: 300;
  }
  .virtual-scroll .header {
    top: 0;
    color: var(--primary, #006ecd);
    cursor: pointer;
  }
  @media (min-width: 768px) {
    .header {
      top: 100px;
    }
    .virtual-scroll .header {
      top: 0;
    }
    .album-details .header {
      top: 247px;
    }
  }
`;
