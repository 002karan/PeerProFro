import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`

position: absolute;
  top: -7px; /* Move further up to be outside the blue box */
  right: -10px; /* Move further right to be outside the blue box */
  transform: scale(0.5); /* Keep it small */
  z-index: 1; /* Ensure it’s above the blue box */

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;

  }

  .loader .circle {
   width: 25px;
    height: 25px;
    border: solid 2px #ea4335; /* Red border */
    border-radius: 50%;
    background-color: #ea4335; /* Solid red fill */
  }




`;

export default Loader;