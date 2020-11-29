import { css } from 'lit-element';

export default css`
  .container {
    display: block;
  }
  .header {
    top: 50px;
  }
  .login {
    background: var(--background, #f8f9fa);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
  }
  .alert {
    border: 1px solid red;
    background: rgba(255, 0, 0, 0.2);
    padding: 0.5rem 1rem;
    margin: 50px 1rem -50px;
  }
  form {
    margin-top: 50px;
  }
  .row {
    display: flex;
    flex-direction: column;
    align-items: left;
    padding: 0.5rem 0;
    margin: 0 1rem;
  }
  .row.buttons {
    flex-direction: row;
    align-items: center;
  }
  label {
    font-size: 0.8rem;
  }
  input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  .btn {
    display: inline-block;
    font-weight: 300;
    color: #212529;
    text-align: center;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-color: transparent;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  .btn-primary {
    border-color: var(--primary, #006ecd);
    background-color: var(--primary, #006ecd);
    color: var(--letter-color, #fff);
  }
  .btn-primary:hover {
    border-color: var(--primary, #006ecd);
    background-color: var(--primary, #006ecd);
    color: var(--letter-color, #fff);
  }
  .btn-primary:active {
    border-color: var(--primary, #0053a2);
    background-color: var(--primary, #0053a2);
    color: var(--letter-color, #fff);
  }
  .btn + .btn {
    margin-left: 1rem;
  }
  @media (min-width: 768px) {
    .container {
      max-width: 500px;
    }
  }
`;
