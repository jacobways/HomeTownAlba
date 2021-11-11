import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import DeleteCareerModal from "../components/MyPageModal/Modal_DeleteCareer";
import CancelApplyModal from "../components/MyPageModal/Modal_CancelApply";
import WithdrawJobSeekerModal from "../components/MyPageModal/Modal_WithdrawJobseeker";

// 구직자 마이페이지
export default function JobSeekerMyPage() {
  const history = useHistory();

  // JobSeeker 테이블의 id이자, Career 테이블의 jobSeekerId
  const [jobSeekerId, setJobSeekerId] = useState(0);

  // JobSeeker 테이블의 나머지 정보
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState("");
  // 이미지 수정을 위한 변수 선언
  const BASE_URL = `${process.env.REACT_APP_SERVER_URL}`;
  const [Content, setContent] = useState("");
  const [FilePath, setFilePath] = useState("");
  // 이미지 수정을 위한 변수 선언

  const [password, setPassword] = useState("");
  const [question, setQuestion] = useState("");

  const [jobSeekerInfoUpdating, setJobSeekerInfoUpdating] = useState(false); // 회원 정보를 수정중인지 아닌지 상태로 관리 (조건부 렌더링용)

  const [passwordUpdating, setPasswordUpdating] = useState(false); // 비밀 번호를 수정중인지 아닌지 상태로 관리 (조건부 렌더링용)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(""); // 비밀번호 입력 실패시 메세지

  const [careerList, setCareerList] = useState([]); // career 정보 모두 불러와 배열로 저장

  // career 항목 나머지 개별 정보
  const [careerId, setCareerId] = useState("");
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState("");
  const [position, setPosition] = useState("");

  // 커리어 수정 버튼을 클릭 시, 업데이트 중인 상태를 저장 (키는 idx, 값은 true - 수정중)

  const [careerUpdating, setCareerUpdating] = useState({});

  const [applyList, setApplyList] = useState([]); // jobSeeker가 지원한 job 목록 보여주기

  const [resultList, setResultList] = useState([]);  // 지원 결과가 나온 job 목록 보여주기
  const [statusList, setStatusList] = useState([]);  // 지원 결과의 상태 보여주기

  const [eventStatus, setEventStatus] = useState(false); // useEffect로 변경사항이 화면에 바로 렌더링되게 도와주는 state

  // jobSeeker 정보 수정용
  const nameHandler = (event) => {
    setName(event.target.value);
  };

  const ageHandler = (event) => {
    setAge(event.target.value);
  };

  const genderHandler = (event) => {
    setGender(event.target.value);
  };

  const imageHandler = (event) => {
    setContent(event.target.files[0]);
  };

  // 회원정보를 수정하기 위한 버튼의 핸들러 (클릭 시 회원정보 수정 가능)
  const jobSeekerHandler = () => {
    setJobSeekerInfoUpdating(!jobSeekerInfoUpdating);
  };

  // jobSeeker 업데이트 하기

  const UpdateJobSeeker = () => {
    const formData = new FormData();
    formData.append("image", Content);
    console.log(formData);

    if (formData) {
      axios
        .post(`${process.env.REACT_APP_SERVER_URL}/upload`, formData, {
          header: { "content-type": "multipart/form-data" },
        })
        .then((res) => {
          console.log(res.data);
          setFilePath(`${BASE_URL}/img/${res.data.fileName}`);
          // multsers3용 src가 새로 생김 -> setFilePath(res.data.v = v.location) , baseUrl을 지워줘야함 , 이미지 쪽 backurl 지우고 이렇게 바꿔줄것
          // res.data.v => 이미지 리사이징 적용 res.data.v.src.replace(/\/thumb\//, '/original/')
          // img src도 replace("thumb",original)

          if (FilePath) {
            axios
              .patch(
                `${process.env.REACT_APP_SERVER_URL}/jobseeker`,
                {
                  id: jobSeekerId,
                  image: FilePath,
                },
                { withCredentials: true }
              )
              .then((res) => {
                console.log(res.data);
                console.log(FilePath);
                setEventStatus(!eventStatus);
              });
          }

          setJobSeekerInfoUpdating(!jobSeekerInfoUpdating);
        })
        .catch((error) => {
          console.error(error);
        });
      // 1차로 이미지 업로드 -> 최종 회원가입 눌렀을때 시간 소요 줄이기 위함
    }
    // 분기처리 안된 이유 : 비동기(axios 2개가 동시에 실행이 되어, 콜백처리 및 분기처리 진행)

    axios
      .patch(
        `${process.env.REACT_APP_SERVER_URL}/jobseeker`,
        {
          id: jobSeekerId,
          name,
          age,
          gender,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setEventStatus(!eventStatus);
      });
    setJobSeekerInfoUpdating(!jobSeekerInfoUpdating);
  };

  // 비밀번호를 수정하기 위한 버튼의 핸들러 (클릭 시 회원정보 수정 가능)
  const OpenPasswordUpdate = () => {
    setPasswordUpdating(!passwordUpdating);
  };

  const passwordHandler = (event) => {
    setPassword(event.target.value);
  };

  const questionHandler = (event) => {
    setQuestion(event.target.value);
  };

  // password 업데이트 하기
  const UpdatePassword = () => {
    axios
      .patch(
        `${process.env.REACT_APP_SERVER_URL}/jobseeker/password`,
        {
          password,
          question,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setPasswordUpdating(!passwordUpdating);
        setPassword("");
        setQuestion("");
        setPasswordErrorMessage("");
      })
      .catch((err) => {
        setPasswordErrorMessage("질문의 답이 올바르지 않습니다");
      });
  };

  const CancelUpdatePassword = () => {
    // 비밀번호 업데이트 취소
    setPasswordUpdating(!passwordUpdating);
    setPassword("");
    setQuestion("");
    setPasswordErrorMessage("");
  };

  // jobSeeker 회원 정보 탈퇴 기능 넣기

  const WithdrawJobseeker = () => {
    axios.delete(`${process.env.REACT_APP_SERVER_URL}/jobseeker`, { withCredentials: true }); // jobSeeker 정보 삭제
    axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/career`,
      { params: { jobSeekerId } },
      { withCredentials: true }
    ); // career 정보 삭제
    axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/applicant`,
      { params: { jobSeekerId } },
      { withCredentials: true }
    ); // applicant 정보 삭제
    history.push("/map");
  };

  // 경력 정보 생성 및 수정 핸들러
  const companyHandler = (event) => {
    setCompany(event.target.value);
  };

  const periodHandler = (event) => {
    setPeriod(event.target.value);
  };

  const positionHandler = (event) => {
    setPosition(event.target.value);
  };

  // 경력 사항을 등록 하는 핸들러
  const createCareer = () => {
    axios
      .post(
        `${process.env.REACT_APP_SERVER_URL}/career`,
        {
          jobSeekerId,
          company,
          period,
          position,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setEventStatus(!eventStatus);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 경력 사항 '수정'을 위한 핸들러 (클릭 시 경력 정보 수정 가능)
  const careerHandler = (idx, id) => {
    // 클릭시 update 상태가 true로 바뀌며, 조건부 렌더링 진행
    setCareerUpdating({ ...careerUpdating, [idx]: true });

    // 수정하려는 커리어 해당 항목이 state에 담기기 (id 기반 axios 요청이 있어야 할 듯?)
    axios
      .get(
        `${process.env.REACT_APP_SERVER_URL}/career`,
        { params: { id } },
        { withCredentials: true }
      )
      .then((res) => {
        let careerInfo = res.data.data; // 객체로 불러옴
        setCareerId(careerInfo.id);
        setCompany(careerInfo.company);
        setPeriod(careerInfo.period);
        setPosition(careerInfo.position);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // update할 내용이 입력된 후에 shubmit 용 핸들러
  const updateCareer = (idx, id) => {
    // 클릭시 해당 idx의 updating이 false 또는 삭제됨

    setCareerUpdating({ ...careerUpdating, [idx]: false });
    axios
      .patch(
        `${process.env.REACT_APP_SERVER_URL}/career`,
        {
          id,
          jobSeekerId,
          company,
          period,
          position,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setEventStatus(!eventStatus);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteCareer = (id) => {
    axios
      .delete(`${process.env.REACT_APP_SERVER_URL}/career/${id}`, { withCredentials: true })
      .then((res) => {
        setEventStatus(!eventStatus);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 지원 목록에서 지원을 취소하는 핸들러
  const CancelApply = (jobId) => {
    axios
      .delete(
        `${process.env.REACT_APP_SERVER_URL}/applicant`,
        { params: { jobId, jobSeekerId: jobSeekerId } },
        { withCredentials: true }
      )
      .then((res) => {
        setEventStatus(!eventStatus);
      });
  };

  useEffect(() => {
    // JobSeeker 정보 받기 (동혁님 전달 코드)
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}`, { withCredentials: true })
      .then((res) => {
        let jobSeekerInfo = res.data.user;
        setJobSeekerId(jobSeekerInfo.id);

        setName(jobSeekerInfo.name);
        setAge(jobSeekerInfo.age);
        setGender(jobSeekerInfo.gender);
        setImage(jobSeekerInfo.image);

        console.log(res.data.user);
      })
      .catch((err) => {
        console.log(err);
      });

    // Career 정보 받기
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/career/${jobSeekerId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setCareerList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // applicant 테이블 통해 지원한 jobList 받기
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/applicant/job/${jobSeekerId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setApplyList(res.data.data);
      });

    axios.get(`${process.env.REACT_APP_SERVER_URL}/applicant/job`, 
      {params: {jobSeekerId}}, 
      {withCredentials: true}
    )
    .then((res) => {
      console.log('res----', res)
      setResultList(res.data.data);
      setStatusList(res.data.applyStatus)
    });

  }, [eventStatus, jobSeekerId]);

  return (
    <div>
      <h1>구직자 마이페이지</h1>

      <br></br>
      <h2>회원 정보</h2>

      {!jobSeekerInfoUpdating ? (
        <table>
          <tr>
            <th scope="row">이름</th>
            <td>{name}</td>
          </tr>
          <tr>
            <th scope="row">나이</th>
            <td>{age}</td>
          </tr>
          <tr>
            <th scope="row">성별</th>
            <td>{gender}</td>
          </tr>
          <tr>
            <th scope="row">사진</th>
            <td>
              <img src={image} alt="profile" />
            </td>
          </tr>
          <tr>
            <button onClick={jobSeekerHandler}>회원 정보 수정</button>
          </tr>
        </table>
      ) : (
        <table>
          <tr>
            <th scope="row">이름</th>
            <input
              name="name"
              type="text"
              onChange={nameHandler}
              value={name}
            />
          </tr>
          <tr>
            <th scope="row">나이</th>
            <input name="age" type="text" onChange={ageHandler} value={age} />
          </tr>
          <tr>
            <th scope="row">성별</th>
            <input
              name="gender"
              type="text"
              onChange={genderHandler}
              value={gender}
            />
          </tr>
          <tr>
            <th scope="row">사진</th>
            <input name="image" type="file" onChange={imageHandler} />
          </tr>
          <button onClick={UpdateJobSeeker}>수정 완료</button>
        </table>
      )}
      <br></br>
      {!passwordUpdating ? (
        <button onClick={OpenPasswordUpdate}>비밀번호 변경</button>
      ) : (
        <>
          <label>질문: 출신 초등학교는?</label>
          <input name="question" type="text" onChange={questionHandler} />
          <label>수정할 비밀번호</label>
          <input name="password" type="password" onChange={passwordHandler} />
          <span>{passwordErrorMessage}</span>
          <button onClick={UpdatePassword}>완료</button>
          <button onClick={CancelUpdatePassword}>취소</button>
        </>
      )}

      <br></br>
      <WithdrawJobSeekerModal WithdrawJobseeker={WithdrawJobseeker} />
      <br></br>
      <br></br>
      <h2>경력 사항</h2>

      {careerList.length === 0 ? (
        <div>등록된 경력 사항이 없습니다.</div>
      ) : (
        <table>
          <tr>
            <th>근무 회사명</th>
            <th>포지션</th>
            <th>기간(월)</th>
            <th></th>
            <th></th>
          </tr>
          {careerList.map((career, idx) => {
            return (
              <>
                {!careerUpdating[idx] ? (
                  <tr key={career.id}>
                    <td>{career.company}</td>
                    <td>{career.position}</td>
                    <td>{career.period}</td>
                    <button
                      onClick={() => {
                        careerHandler(idx, career.id);
                      }}
                    >
                      수정
                    </button>
                    <DeleteCareerModal
                      deleteCareer={deleteCareer}
                      id={career.id}
                    />
                  </tr>
                ) : (
                  <tr key={career.id}>
                    <td>
                      <input
                        name="company"
                        type="text"
                        onChange={companyHandler}
                        value={company}
                      />
                    </td>
                    <td>
                      <input
                        name="position"
                        type="text"
                        onChange={positionHandler}
                        value={position}
                      />
                    </td>
                    <td>
                      <input
                        name="period"
                        type="text"
                        onChange={periodHandler}
                        value={period}
                      />
                    </td>
                    <button
                      onClick={() => {
                        updateCareer(idx, career.id);
                      }}
                    >
                      수정 완료
                    </button>
                  </tr>
                )}
              </>
            );
          })}
        </table>
      )}
      <h3>경력 사항 등록</h3>

      <form>
        <label>근무 회사명 : </label>
        <input name="company" type="text" onChange={companyHandler} />
        <label>포지션 : </label>
        <input name="position" type="text" onChange={positionHandler} />
        <label>근무 기간(월) : </label>
        <input
          name="period"
          type="text"
          onChange={periodHandler}
          placeholder="입력예시 : 3"
        />
        <input type="submit" value="등록" onClick={createCareer} />
      </form>

      <br></br>
      <h3>지원 현황</h3>
      {applyList.length === 0 ? (
        <div>지원 내역이 없습니다</div>
      ) : (
        <table>
          <tr>
            <th>회사명</th>
            <th>주소</th>
            <th>근무요일</th>
            <th>근무시간</th>
            <th>시급</th>
            <th>예상 월급여</th>
            <th>포지션</th>
            <th></th>
          </tr>
          {applyList.map((job) => {
            return (
              <tr key={job.id}>
                <td>{job.companyName}</td>
                <td>{job.location}</td>
                <td>{job.day}</td>
                <td>
                  {job.startTime}~{job.endTime} ({job.time}시간)
                </td>
                <td>{job.hourlyWage}</td>
                <td>{job.monthlyWage}</td>
                <td>{job.position}</td>
                <CancelApplyModal CancelApply={CancelApply} jobId={job.id} />
              </tr>
            );
          })}
        </table>
      )}
      <br></br>
      <h3>지원 결과</h3>
      {resultList.length === 0 ? (
        <div>지원 결과가 없습니다</div>
      ) : (
        <table>
          <tr>
            <th>회사명</th>
            <th>주소</th>
            <th>근무요일</th>
            <th>근무시간</th>
            <th>시급</th>
            <th>예상 월급여</th>
            <th>포지션</th>
            <th>결과</th>
            <th></th>
          </tr>
          {resultList.map((job, number) => {
            if(statusList[number]) {
              if(statusList[number].status==='rejected') {
                return (
                  <tr key={job.id}>
                    <td>{job.companyName}</td>
                    <td>{job.location}</td>
                    <td>{job.day}</td>
                    <td>{job.startTime}~{job.endTime} ({job.time}시간)</td>
                    <td>{job.hourlyWage}</td>
                    <td>{job.monthlyWage}</td>
                    <td>{job.position}</td>
                    <td>지원 거절</td>
                    <CancelApplyModal CancelApply={CancelApply} jobId={job.id} />
                  </tr>
                );
              } else if(statusList[number].status==='accepted') {
                return (
                  <tr key={job.id}>
                    <td>{job.companyName}</td>
                    <td>{job.location}</td>
                    <td>{job.day}</td>
                    <td>{job.startTime}~{job.endTime} ({job.time}시간)</td>
                    <td>{job.hourlyWage}</td>
                    <td>{job.monthlyWage}</td>
                    <td>{job.position}</td>
                    <td>지원 승인</td>
                    <CancelApplyModal CancelApply={CancelApply} jobId={job.id} />
                    <button>채팅창 열기</button>
                  </tr>
                );            
              }
            }
          })}
        </table>
      )}
    </div>
  );
}
