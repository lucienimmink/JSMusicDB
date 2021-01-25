import { css } from 'lit-element';

export default css`
  .header {
    background: var(--background-seethrough, rgba(248, 249, 250, 0.85));
    box-sizing: border-box;
    height: 60px;
    border-bottom: 1px solid var(--primary, #006ecd);
    transition: all 0.5s ease-in-out;
    padding: 1.5rem 1rem 0;
    position: sticky;
    z-index: 1;
    margin-bottom: -1px;
    top: 50px;
    font-size: 1.2rem;
    font-weight: 300;
  }
  .virtual-scroll .header {
    top: 0;
    color: var(--primary, #006ecd);
    transition: none;
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
      top: 209px;
    }
  }
`;
