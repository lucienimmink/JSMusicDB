import { css } from 'lit';

export default css`
  .header {
    background: var(--background-seethrough);
    box-sizing: border-box;
    min-height: 60px;
    border-top: 0;
    border-bottom: 1px solid var(--border-colour);
    transition:
      background-color 0.2s ease-in-out,
      border-color 0.2s ease-in-out;
    padding: 1.85rem 1rem 0;
    position: sticky;
    z-index: 1;
    margin-bottom: -1px;
    top: 49px;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .virtual-scroll .header {
    top: 0;
    color: var(--text-color);
    font-weight: 600;
    transition: none;
    height: auto !important;
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
