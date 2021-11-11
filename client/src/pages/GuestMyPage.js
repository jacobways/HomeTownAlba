import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import axios from 'axios'
import DeleteCareerModal from "../components/MyPageModal/Modal_DeleteCareer";
import CancelApplyModal from "../components/MyPageModal/Modal_CancelApply";
import DeleteJobModal from "../components/MyPageModal/Modal_DeleteJob";
import RejectApplyModal from "../components/MyPageModal/Modal_RejectApply";
import AcceptApplyModal from "../components/MyPageModal/Modal_AcceptApply"
import ApplicantInfoModal from "../components/MyPageModal/Modal_ApplicantInfo";
import DaumPostcode from "react-daum-postcode";
const { kakao } = window;

function GuestMyPage({guestApplyStatus}) {

  const [GuestStatus, setGuestStatus] = useState("jobseeker");
  
  // 구직자 사업자 중 선택
  const JobSeekrHandler = (e) => {
    setGuestStatus("jobseeker");
  };
  const CompanyHandler = (e) => {
    setGuestStatus("company");
  };

  const [jobSeekerId, setJobSeekerId] = useState(0);
  const [companyId, setCompanyId] = useState(0);
  const [companyName, setCompanyName] = useState('우리동네알바');


  // 구직자 마이페이지용 ----------- 
  const [careerList, setCareerList] = useState([]); // career 정보 모두 불러와 배열로 저장

  // career 항목 나머지 개별 정보
  const [careerId, setCareerId] = useState("");
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState("");
  const [careerPosition, setCareerPosition] = useState("");

  // 커리어 수정 버튼을 클릭 시, 업데이트 중인 상태를 저장 (키는 idx, 값은 true - 수정중)
  const [careerUpdating, setCareerUpdating] = useState({});

  const [applyList, setApplyList] = useState([]); // jobSeeker가 지원한 job 목록 보여주기

  const [resultList, setResultList] = useState([]);  // 지원 결과가 나온 job 목록 보여주기
  const [statusList, setStatusList] = useState([]);  // 지원 결과의 상태 보여주기

  const [eventStatus, setEventStatus] = useState(false); // useEffect로 변경사항이 화면에 바로 렌더링되게 도와주는 state
  const [eventSetTimeout, setEventSetTimeout] = useState(false);

  // 경력 정보 생성 및 수정 핸들러
  const companyHandler = (event) => {
    setCompany(event.target.value);
  };

  const periodHandler = (event) => {
    setPeriod(event.target.value);
  };

  const careerPositionHandler = (event) => {
    setCareerPosition(event.target.value);
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
          position: careerPosition,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setEventStatus(!eventStatus)
        setTimeout(()=>{
          console.log('res.data.id', res.data.id)
          axios.delete(`${process.env.REACT_APP_SERVER_URL}/career/${res.data.id}`, {withCredentials: true})
          .then((res)=>{
            setEventSetTimeout(!eventSetTimeout);
          })
        }, 300000)
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
        setCareerPosition(careerInfo.position);
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
          position: careerPosition,
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



  // 사업자 마이페이지용 ----------- 
  // job 정보
  const [jobLocation, setJobLocation] = useState("");  // DB에 등록될 일자리 주소
  const [isOpenJobPost, setIsOpenJobPost] = useState(false);
  const [jobZipCode, setJobZipCode] = useState(""); // 우편번호
  const [latitude, setLatitude] = useState(0)    // 일자리의 위치의 위도
  const [longitude, setLongitude] = useState(0)  // 일자리 위치의 경도

  const [day, setDay] = useState([]);
  const [mon, setMon] = useState([]);
  const [tue, setTue] = useState([]);
  const [wed, setWed] = useState([]);
  const [thu, setThu] = useState([]);
  const [fri, setFri] = useState([]);
  const [sat, setSat] = useState([]);
  const [sun, setSun] = useState([]);
  const [monChecked, setMonChecked] = useState(false);
  const [tueChecked, setTueChecked] = useState(false);
  const [wedChecked, setWedChecked] = useState(false);
  const [thuChecked, setThuChecked] = useState(false);
  const [friChecked, setFriChecked] = useState(false);
  const [satChecked, setSatChecked] = useState(false);
  const [sunChecked, setSunChecked] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [position, setPosition] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");

  // jobList, applicantList, showing 상태 등 상태로 관리
  const [jobList, setJobList] = useState("");
  const [applicantList, setApplicantList] = useState({}); // 객체이며 key 는 idx 값
  const [showingApplicantList, setShowingApplicantList] = useState({});
  const [applyStatusList, setApplyStatusList] = useState({});


  // Job 위치 수정창 오픈
  const OpenJobPost = () => {
    setIsOpenJobPost(!isOpenJobPost);
  };

  const CancelJobPost = () => {
    setIsOpenJobPost(false);
  }

  // 카카오 지도 API 활용하여 Job 주소 선택 후 닫기
  const CompleteJobPost = (data) => {
    let fullAddr = data.address;
    let extraAddr = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddr += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddr +=
          extraAddr !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddr += extraAddr !== "" ? ` (${extraAddr})` : "";
    }

    setJobZipCode(data.zonecode);
    setJobLocation(fullAddr);
    setIsOpenJobPost(false);
    ChangeLocationToCoordinate(fullAddr)
  };

  const postCodeStyle = {
    display: "block",
    position: "relative",
    top: "0%",
    width: "400px",
    height: "400px",
    padding: "7px",
  };

  // 카카오 API를 통해 주소를 위도와 경도로 좌표로 저장하기
  const ChangeLocationToCoordinate = (location) => {

    // 주소-좌표 변환 객체를 생성합니다
    let geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(location, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
          setLatitude(result[0].y)
          setLongitude(result[0].x)
        }
      })
  }

  // check된 요일을 day state에 모아주기
  const dayHandler = () => {
    setDay([...mon, ...tue, ...wed, ...thu, ...fri, ...sat, ...sun]);
  };

  const monHandler = () => {
    if (!monChecked) {
      setMon(["월"]);
    } else {
      setMon([]);
    }
    setMonChecked(!monChecked);
  };

  const tueHandler = () => {
    if (!tueChecked) {
      setTue(["화"]);
    } else {
      setTue([]);
    }
    setTueChecked(!tueChecked);
  };

  const wedHandler = () => {
    if (!wedChecked) {
      setWed(["수"]);
    } else {
      setWed([]);
    }
    setWedChecked(!wedChecked);
  };

  const thuHandler = () => {
    if (!thuChecked) {
      setThu(["목"]);
    } else {
      setThu([]);
    }
    setThuChecked(!thuChecked);
  };

  const friHandler = () => {
    if (!friChecked) {
      setFri(["금"]);
    } else {
      setFri([]);
    }
    setFriChecked(!friChecked);
  };

  const satHandler = () => {
    if (!satChecked) {
      setSat(["토"]);
    } else {
      setSat([]);
    }
    setSatChecked(!satChecked);
  };

  const sunHandler = () => {
    if (!sunChecked) {
      setSun(["일"]);
    } else {
      setSun([]);
    }
    setSunChecked(!sunChecked);
  };

  const startTimeHandler = (event) => {
    setStartTime(event.target.value);
  };

  const endTimeHandler = (event) => {
    setEndTime(event.target.value);
  };

  const positionHandler = (event) => {
    setPosition(event.target.value);
  };

  const hourlyWageHandler = (event) => {
    setHourlyWage(event.target.value);
  };

  // state에 저장한 정보를 바탕으로 일자리 생성하기
  const createJob = () => {
    axios
      .post(
        `${process.env.REACT_APP_SERVER_URL}/job`,
        {
          companyId,
          companyName,
          location: jobLocation,
          latitude,
          longitude,
          day,
          startTime,
          endTime,
          position,
          hourlyWage,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setEventStatus(!eventStatus)
        setTimeout(()=>{
          axios.delete(`${process.env.REACT_APP_SERVER_URL}/job/${res.data.id}`, {withCredentials: true})
          .then((res)=>{
            setEventSetTimeout(!eventSetTimeout);
          })
        }, 300000)
      })
  };

  // 일자리 삭제하기
  const DeleteJob = (jobId) => {

    // 해당 Job을 삭제하기
    axios
    .delete(`${process.env.REACT_APP_SERVER_URL}/job/${jobId}`, { withCredentials: true })
    .then((res) => {
      setEventStatus(!eventStatus);
    })
    .catch((err) => {
      console.log(err);
    })
  };

  // 각 일자리별 지원자를 applicantList state에 저장
  // applicantList는 객체 형태로 key는 idx(jobList 상태의 요소인 job을 map으로 불러올 때 사용되는 index)
  // 값은 res를 통해 불러온 jobSeeker 정보
  // 지원자가 없는 Job은 해당 key(인덱스)와 값이 applicantList 객체에 저장되지 않음
  // applicantList의 형태 예시 : {0: [jobSeeker1, jobSeeker2, JobSeeker3], 1: [JobSeeker1], 3: [Jobseeker4]}
  const openApplicantList = (idx, jobId) => {
    setShowingApplicantList({ ...showingApplicantList, [idx]: true });
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/applicant/jobseeker/nonmember/${jobId}`, {
        withCredentials: true,
      })
      .then((res) => {
        // bracket notation으로는 값이 저장되지 않아 구조분해할당 사용
        if (res.data.data.length !== 0) {
          setApplicantList({ ...applicantList, [idx]: res.data.data });
          setApplyStatusList({...applyStatusList, [idx]: res.data.applyStatus})
        } else {
          setApplicantList({ ...applicantList, [idx]: null });
          setApplyStatusList({ ...applyStatusList, [idx]: null });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // applicantList 닫는 핸들러
  const closeApplicantList = (idx) => {
    setShowingApplicantList({ ...showingApplicantList, [idx]: false });
  };

  // 자원자에 대해 지원 거절
  const RejectApply = (idx, jobId, jobSeekerId) => {
    axios
    .patch(
      `${process.env.REACT_APP_SERVER_URL}/applicant`,
      { jobId, jobSeekerId },
      { withCredentials: true }
    )
    .then((res) => {
      openApplicantList(idx, jobId);
    })
    .catch((err) => {
      console.log(err);
    });
  };

  // 지원자에 대해 지원 승인
  const AcceptApply = (idx, jobId, jobSeekerId) => {
    axios.patch(`${process.env.REACT_APP_SERVER_URL}/applicant/status`,
    { jobId, jobSeekerId },
    { withCredentials: true })
    .then((res) => {
      openApplicantList(idx, jobId);
    })
    .catch((err) => {
      console.log(err);
    });
  }


  useEffect(() => {

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
      setResultList(res.data.data);
      setStatusList(res.data.applyStatus)
    });

    // job 정보 받기
    axios
    .get(`${process.env.REACT_APP_SERVER_URL}/job/${companyId}`, { withCredentials: true })
    .then((res) => {
      setJobList(res.data.data);
    })
    .catch((err) => {
      console.log(err);
    });

  }, [eventStatus, jobSeekerId, eventSetTimeout, guestApplyStatus]);

  // 체크박스로 체크한 요일을 day에 담기 위한 기능
  useEffect(() => {
    dayHandler();
  }, [mon, tue, wed, thu, fri, sat, sun]);


 if (GuestStatus === "jobseeker") {
    return (
      <>
        <NavBar />
        <div className="main">
          <div>
            <div className="mypage">
              <ul className="tag">
                <li className="on">
                  {/* 아래 문구 수정 */}
                  <a onClick={JobSeekrHandler}>구직자 마이페이지 (비회원용)</a>
                </li>
                <li>
                  {/* 아래 문구 수정 */}
                  <a onClick={CompanyHandler}>사업자 마이페이지 (비회원용)</a>
                </li>
              </ul>
              {/* 아래 문구 수정 */}
              <h1 className="header">비회원 상태로 기능을 체험할 수 있으며, 등록하시는 데이터는 5분 내 자동으로 삭제됩니다.</h1>
              <br />
              <div className="messageBox">
                <ul>
                  <li>
                    회원정보는 개인정보처리방침에 따라 안전하게 보호되며,
                    회원님의 동의 없이 공개 또는 제 3자에게 제공되지 않습니다.
                  </li>
                  <li>
                    이름, 생년월일, 성별 정보는 본인확인을 통해 수정하실 수
                    있습니다.
                  </li>
                </ul>
              </div>
              <br></br>
              <div className="line">
                <h2>회원 정보</h2>

                {/* <img className='profile' src='http://k.kakaocdn.net/dn/b73ZT6/btrjxAQccVG/CmkUAATTS22WaEhz6Wdq1K/img_640x640.jpg'/> */}
                <tbody>
                  <tr>
                    <th>아이디</th>
                    <td>
                      <div>HomeTownAlba</div>
                    </td>
                  </tr>
                  <tr>
                    <th>이름</th>
                    <th>김아무개</th>
                  </tr>
                  <tr>
                    <th>생년월일/성별</th>
                    <th>2021년 11월 4일 / 남자</th>
                  </tr>
                  <tr>
                    <th>핸드폰 번호</th>
                    <th>010-1234-5678</th>
                  </tr>
                  <tr>
                    <th>이메일</th>
                    <th>hometownalba@hometownalba.com</th>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <th>우리시 동네구 알바동</th>
                  </tr>
                  <tr>
                    <th>본인의 초등학교는</th>
                    <th>매탄초등학교</th>
                  </tr>

                  <br />
                </tbody>

                <br />
              </div>
              <br></br>
              <br></br>

              {/* 아래와 같이 경력사항 표시, 수정, 삭제하는 코드 추가 */}
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
                                onChange={careerPositionHandler}
                                value={careerPosition}
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

              {/* 아래에서는 경력사항 등록할 수 있도록 태크에 핸들러 추가 */}
            <h3>경력 사항 등록</h3>
              <table>
                <tr>
                  <th>근무 회사명</th>
                  <th>포지션</th>
                  <th>기간(월)</th>
                  <th></th>
                  <th></th>
                </tr>
              </table>
              {/* 위의 형식대로 테이블 양식에 맞출지, 아래 처럼 일렬로 표현할지 결정 필요 */}
              {/* <form> */}
                <label>근무 회사명 : </label>
                <input name="company" type="text" onChange={companyHandler} />
                <label>포지션 : </label>
                <input name="position" type="text" onChange={careerPositionHandler} />
                <label>근무 기간(월) : </label>
                <input
                  name="period"
                  type="text"
                  onChange={periodHandler}
                  placeholder="입력예시 : 3"
                />
                <input type="submit" value="등록" onClick={createCareer} />
              {/* </form> */}

              {/* 아래와 같이 지원현황 및 지원결과 확인 코드 추가 */}
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


             {/* 아래 수정완료 버튼과 회원탈퇴 버튼은 지워도 될 것 같아요 */}
              <br />
              <div className="bottomButton">
                <button id="left" className="bubbly-button">
                  수정 완료
                </button>
                <button className="bubbly-button">회원탈퇴</button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  } else {
    return (
      <>
        <NavBar />
        <div className="main">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="mypage">
              <ul className="tag">
                <li>
                  {/* 아래 문구 수정 */}
                  <a onClick={JobSeekrHandler}>구직자 마이페이지 (비회원용)</a>
                </li>
                <li className="on">
                  {/* 아래 문구 수정 */}
                  <a onClick={CompanyHandler}>사업자 마이페이지 (비회원용)</a>
                </li>
              </ul>
              {/* 아래 문구 수정 */}
              <h1>비회원 상태로 기능을 체험할 수 있으며, 등록하시는 데이터는 5분 내 자동으로 삭제됩니다.</h1>
              <div className="messageBox">
                <ul>
                  <li>
                    회원정보는 개인정보처리방침에 따라 안전하게 보호되며,
                    회원님의 동의 없이 공개 또는 제 3자에게 제공되지 않습니다.
                  </li>
                  <li>
                    이름, 생년월일, 성별 정보는 본인확인을 통해 수정하실 수
                    있습니다.
                  </li>
                </ul>
              </div>
              <br></br>
              <div className="line">
                <h2>사업자 정보</h2>
                <tbody>
                  <tr>
                    <th>회사명</th>
                    <th>(주)우리동네알바</th>
                  </tr>
                  <tr>
                    <th>사업자 위치</th>
                    <th>우리시 동네동 알바구</th>
                  </tr>
                  <tr>
                    <th>사업자 번호</th>
                    <th>111-222-3333</th>
                  </tr>
                  <tr>
                    <th>자사 대표 상품</th>
                    <th>HomeTownAlba</th>
                  </tr>
                </tbody>

                <h1 className="companyJob">일자리 등록</h1>

                 {/* tbody 내에서 input 태그에 이벤트 핸들러 할당 & 주소 부분은 다음 API 사용하도록 코드 수정 */}
                <tbody>
                  {/* 제목 부분은 필요 없어서 삭제 */}

                  <tr>
                    <th>주소</th>
                    <td>
                      <input name="location" 
                      onClick={OpenJobPost}
                      placeholder="클릭하셔서 주소를 검색해주세요"
                      value={jobLocation}
                      ></input>
                      {isOpenJobPost ? (
                      <>
                      <DaumPostcode
                        onClick={OpenJobPost}
                        style={postCodeStyle}
                        autoClose
                        onComplete={CompleteJobPost}
                      />
                      </>
                      ) : null}
                    </td>
                  </tr>
                  <tr>
                    <th>근무요일</th>
                    <td>
                      <input name="day" id="mon" type="checkbox" onClick={monHandler}></input>월
                      <input name="day" id="tue" type="checkbox" onClick={tueHandler}></input>화
                      <input name="day" id="wed" type="checkbox" onClick={wedHandler}></input>수
                      <input name="day" id="thu" type="checkbox" onClick={thuHandler}></input>목
                      <input name="day" id="fri" type="checkbox" onClick={friHandler}></input>금
                      <input name="day" id="sat" type="checkbox" onClick={satHandler}></input>토
                      <input name="day" id="sun" type="checkbox" onClick={sunHandler}></input>일
                    </td>
                  </tr>
                  <tr>
                    <th>근무시간</th>
                    <td>
                      {" "}
                      <input
                        name="startTime"
                        type="time"
                        placeholder="시작 시간"
                        onChange={startTimeHandler}
                      />
                      <input 
                        name="endTime" 
                        type="time" 
                        placeholder="끝 시간"
                        onChange={endTimeHandler}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>포지션</th>
                    <td>
                      <input name="position" type="text" onChange={positionHandler}/>
                    </td>
                  </tr>
                  <tr>
                    <th>시급(₩)</th>
                    <td>
                      {" "}
                      <input name="hourlyWage" type="text" onChange={hourlyWageHandler}/>
                    </td>
                  </tr>
                  {!jobLocation ||
                  day.length === 0 ||
                  !startTime ||
                  !endTime ||
                  !position ||
                  !hourlyWage ? (
                    <>
                      <br></br>
                      <button className="bubbly-button">제출</button>
                      <br></br>
                      <span>모든 항목을 입력해주세요</span>
                    </>
                  ) : (
                    <button className="bubbly-button" onClick={createJob}>제출</button>
                  )}
                </tbody>



                {/* <form>
            <label>
              제목 :
              <input name="title" type="text" />
            </label>
            <br></br>
            <label>
              주소 :
              <textarea name="location" rows="3" cols="20" />
            </label>
            <br></br>
            <label>
              근무 요일 :
              <input name="day" id="mon" type="checkbox" />
              월
              <input name="day" id="tue" type="checkbox" />
              화
              <input name="day" id="wed" type="checkbox" />
              <label for="wed">수</label>
              <input name="day" id="thu" type="checkbox" />
              <label for="thu">목</label>
              <input name="day" id="fri" type="checkbox" />
              <label for="fri">금</label>
              <input name="day" id="sat" type="checkbox" />
              <label for="sat">토</label>
              <input name="day" id="sun" type="checkbox" />
              <label for="sun">일</label>
            </label>
            <br></br>
            <label>
              {" "}
              근무 시간 :
              <input name="startTime" type="time" placeholder="시작 시간" />
              <input name="endTime" type="time" placeholder="끝 시간" />
            </label>
            <br></br>
            <label>
              {" "}
              포지션 :
              <input name="position" type="text" />
            </label>
            <br></br>
            <label>
              {" "}
              시급(₩) :
              <input name="hourlyWage" type="text" />
            </label> */}




                {/* </form> */}

                <br></br>

                <h1>등록 일자리 목록</h1>

                {/* 아래처럼 등록된 일자리 및 지원자를 확인하는 코드 추가 */}
                {jobList.length === 0 ? (
                  <h3>일자리 정보를 등록해주세요</h3>
                ) : (
                  <>
                    {jobList.map((job, idx) => {
                      return (
                        <div key={idx}>
                          <h4>
                            주소 : {job.location}
                            포지션 : {job.position}
                            시급 : {job.hourlyWage}
                            요일 : {JSON.parse(job.day)}
                            시간 : {job.startTime}~{job.endTime}
                            <DeleteJobModal DeleteJob={DeleteJob} id={job.id} />
                          </h4>

                          {!showingApplicantList[idx] ? (
                            <button
                              onClick={() => {
                                openApplicantList(idx, job.id);
                              }}
                            >
                              지원자 보기
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  closeApplicantList(idx);
                                }}
                              >
                                지원자 숨기기
                              </button>
                              {!applicantList[idx] ? (
                                <h5>아직 지원자가 없습니다</h5>
                              ) : (
                                <table>
                                  <tr>
                                    <th>이름</th>
                                    <th>나이</th>
                                    <th>성별</th>
                                    <th></th>
                                    <th></th>
                                  </tr>
                                  {applicantList[idx].map((jobSeeker, number) => {
                                    if(applyStatusList[idx]) {
                                      if(applyStatusList[idx][number].status==="waiting") {
                                        return (
                                          <tr key={jobSeeker.id}>
                                            <td>{jobSeeker.name}</td>
                                            <td>{jobSeeker.age}</td>
                                            <td>{jobSeeker.gender}</td>
                                            <ApplicantInfoModal jobSeeker={jobSeeker} />
                                            <RejectApplyModal
                                              RejectApply={RejectApply}
                                              idx={idx}
                                              jobId={job.id}
                                              jobSeekerId={jobSeeker.id}
                                            />
                                            <AcceptApplyModal
                                              AcceptApply={AcceptApply}
                                              idx={idx}
                                              jobId={job.id}
                                              jobSeekerId={jobSeeker.id}
                                            />
                                          </tr>
                                        );
                                      } else if (applyStatusList[idx][number].status==="accepted") {
                                        return (
                                          <tr key={jobSeeker.id}>
                                            <td>{jobSeeker.name}</td>
                                            <td>{jobSeeker.age}</td>
                                            <td>{jobSeeker.gender}</td>
                                            <ApplicantInfoModal jobSeeker={jobSeeker} />
                                            <RejectApplyModal
                                              RejectApply={RejectApply}
                                              idx={idx}
                                              jobId={job.id}
                                              jobSeekerId={jobSeeker.id}
                                            />
                                            <button>채팅창 열기</button>
                                          </tr>
                                        );
                                      }
                                    }
                                  })}
                                </table>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                
                <br></br>







                {/* 아래 수정완료 버튼과 회원탈퇴 버튼은 지워도 될 것 같아요 */}
                <div className="bottomButton">
                  <button id="left" className="bubbly-button">
                    수정 완료
                  </button>
                  <button className="bubbly-button">회원탈퇴</button>
                  <br />
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}

export default GuestMyPage;
