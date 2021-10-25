import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutJobSeeker } from "../_actions/user_action";
import axios from "axios";

function NavBar(props) {
  const [Login, setLogin] = useState(false);
  useEffect(() => {
    axios
      .get("http://localhost:5000/jobSeeker", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        if (res.data.loginSuccess) {
          setLogin(res.data.loginSuccess);
        } else {
          setLogin(false);
        }
      });
  }, [Login]);
  const jobSeeker = useSelector((state) => {
    console.log("useSelector", state.jobSeeker.loginSuccess);
    // 로그인한 유저의 Id
    return state.jobSeeker.loginSuccess;
  });
  // 유저의 토큰을 얻어낼수있음
  // 로그인을 하지 않으면 jobSeeker가 없음
  // console.log(jobSeeker.data);
  const dispatch = useDispatch();

  const LogoutHandler = () => {
    setLogin(false);

    dispatch(logoutJobSeeker()).then((res) => {
      return res;
    });
  };

  // console.log(jobSeeker.loginSuccess);
  // 밑에코드는 새로고침되면 해결됨
  // if (Login) {
  //   return (
  //     <div>
  //       <button onClick={LogoutHandler}>로그아웃</button>
  //     </div>
  //   );
  // } else {
  //   return (
  //     <div>
  //       <Link to="/login">로그인</Link>
  //       <Link to="/register">회원가입</Link>
  //     </div>
  //   );
  // }
  if (jobSeeker === undefined) {
    return (
      <div>
        <Link to="/login">로그인</Link>
        <Link to="/register">회원가입</Link>
      </div>
    );
  }
  if ((jobSeeker && jobSeeker.loginSuccess) || Login) {
    return (
      <div>
        <button onClick={LogoutHandler}>로그아웃</button>
      </div>
    );
  } else {
    return (
      <div>
        <Link to="/login">로그인</Link>
        <Link to="/register">회원가입</Link>
        {/* 구글 로그아웃 구현 : 노드버드 카카오 참고해서*/}
      </div>
    );
  }
}

export default NavBar;