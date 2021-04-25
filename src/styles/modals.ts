import { css } from 'lit-element';

export default css`
  .modal-wrapper {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  .modal-backdrop {
    position: absolute;
    backdrop-filter: blur(2px);
    background: var(--background2-seethrough);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  .modal {
    box-sizing: border-box;
    width: 90vw;
    background: var(--background);
    border: 1px solid var(--darken);
    margin: 5vh auto 0;
    position: relative;
    z-index: 1001;
  }
  .modal-header {
    padding: 0.25rem 1rem;
  }
  .modal-header h2 {
    height: auto;
    padding: 0;
  }
  .modal-header button {
    position: absolute;
    right: 1rem;
    top: 10px;
    z-index: 1;
  }
  .modal-body {
    padding: 0.25rem 1rem;
  }
  .modal-footer {
    padding: 0.25rem 1rem 0.5rem;
  }
  @media (min-width: 768px) {
    .modal {
      max-width: 500px;
    }
  }
`;
