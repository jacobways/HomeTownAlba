import axios from "axios";
import React, { useState, useEffect } from "react";

import styled from "styled-components";

export const ModalBackdrop = styled.div`
  z-index: 999;
  top: 1;
  left: 1;
  bottom: 1;
  right: 1;
  background-color: rgba(0, 0, 0, 0.4);
  display: -webkit-flex;
  place-items: center;
`;

function DeleteCareerModal({ id, deleteCareer }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModalHandler = () => {
    setIsOpen(!isOpen);
  };

  const CloseModalHandler = () => {
    setIsOpen(!isOpen);
  };

  const CloseAndDeleteHandler = () => {
    setIsOpen(!isOpen);
    deleteCareer(id);
  };

  return (
    <>
      <button className="login-btn" onClick={openModalHandler}>
        {isOpen === false ? "삭제" : "삭제중"}
      </button>
      {isOpen === true ? (
        <ModalBackdrop>
          <span>삭제하시겠습니까?</span>
          <button id="left" className="login-btn" onClick={CloseModalHandler}>
            아니요
          </button>
          <button className="login-btn" onClick={CloseAndDeleteHandler}>
            삭제하기
          </button>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

export default DeleteCareerModal;
