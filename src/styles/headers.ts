import { css } from 'lit';

export default css`
  .header {
    backdrop-filter: blur(2px);
    background: var(--background-seethrough);
    box-sizing: border-box;
    min-height: 60px;
    border-top: 0;
    border-bottom: 1px solid var(--primary);
    transition: all 0.5s ease-in-out;
    padding: 1.85rem 1rem 0;
    position: sticky;
    z-index: 1;
    margin-bottom: -1px;
    top: 49px;
    font-size: 1.25rem;
    font-weight: 400;
  }
  .virtual-scroll .header {
    top: 0;
    color: var(--primary);
    transition: none;
    cursor: pointer;
  }
  @media (min-width: 992px) {
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
