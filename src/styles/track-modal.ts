import { css } from 'lit';

export default css`
  ::-moz-selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  ::selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  dialog {
    border: 1px solid var(--primary);
    background: var(--background);
    color: var(--text-color);
    padding: 0;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    border-radius: 0.5rem;
    max-width: 95vw;

    @media (min-width: 768px) {
      min-width: 50vw;
      max-width: 80vw;
    }
    @media (min-width: 1024px) {
      max-width: 60vw;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 400;
      border-bottom: 1px solid var(--primary);
      padding: 0.75rem 1rem;
      margin: 0.5rem 0;

      button {
        position: absolute;
        right: 1rem;
        top: 0.75rem;
      }
    }
    table {
      margin: 0 1rem 1rem;
      width: calc(100% - 2rem);
      td {
        width: 50%;
        padding-bottom: 1rem;
        vertical-align: top;
        &.muted {
          padding-bottom: 0;
        }
      }
    }
    footer {
      background: var(--background2);
      border-top: 1px solid var(--primary);
      padding: 1rem;
    }
  }
  dialog[open] {
    opacity: 1;
  }
  @starting-style {
    dialog[open] {
      opacity: 0;
    }
  }
  dialog::backdrop {
    backdrop-filter: blur(0px) grayscale(0);
    transition: all 0.2s ease-in-out;
  }
  dialog[open]::backdrop {
    backdrop-filter: blur(5px) grayscale(1);
  }
  @starting-style {
    dialog[open]::backdrop {
      backdrop-filter: blur(0px) grayscale(0);
    }
  }
`;
