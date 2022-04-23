import { css } from 'lit';

export default css`
  .panel {
    width: 44vw;
    height: 44vw;
    cursor: pointer;
    background-size: contain;
    margin: 0 1vw 1vw 0;
    position: relative;
    border: 1px solid var(--background3, #f3f4f5);
    box-shadow: 0px 0px 1px var(--primary, #006ecd);
    box-sizing: border-box;
  }
  @media (min-width: 576px) {
    .panel {
      width: 19vw;
      height: 19vw;
    }
  }
  @media (min-width: 768px) {
    .panel {
      width: 15vw;
      height: 15vw;
    }
  }
  @media (min-width: 992px) {
    .panel {
      width: 11vw;
      height: 11vw;
      max-width: 300px;
      max-height: 300px;
    }
    .panel-home {
      max-width: 155px;
      max-height: 155px;
    }
  }
  .panel-background {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: 0.1s ease-out;
    background-size: cover;
    background-position: 50%;
  }
  .panel-info {
    position: absolute;
    padding: 5px;
    bottom: -1px;
    left: -1px;
    right: -1px;
    background: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, 0.75));
    margin: 0;
    line-height: 1.35;
    transition: 0.1s ease-out;
    overflow: hidden;
    text-align: center;
    text-shadow: 0 0 3px #000;
  }
  .panel-info > span {
    display: block;
    font-size: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
  }
`;
