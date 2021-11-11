/*global kakao*/
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./Map.css";
import NavBar from "../components/NavBar";

const { kakao } = window;
export default function Map({guestApplyStatus, guestApplyStatusHandler}) {
  const [jobSeekerId, setJobSeekerId] = useState(0);
  const [Login, setLogin] = useState(false);
  const [applyLocation, setApplyLocation] = useState([]); // 지원시 해당 위치를 지도에 띄우도록 하기 위한 state

  const [startTimeFilter, setStartTimeFilter] = useState();
  const [endTimeFilter, setEndTimeFilter] = useState();
  const [minWageFilter, setMinWageFilter] = useState();
  const [maxWageFilter, setMaxWageFilter] = useState();

  const [mapLocation, setMapLocation] = useState([
    37.5665406708322, 126.97787259165268,
  ]); //[위도, 경도]
  const [mapLevel, setMapLevel] = useState(6);

  const [searchPlace, setSearchPlace] = useState(""); // 장소 검색 키워드
  const [searchLocation, setSearchLocation] = useState(""); // 장소 검색 결과 (useEffect 조건으로 사용 위해 searchPlace와 분리)

  const [filteredData, setFilteredData] = useState([]); // 현재 지도 위치에 따라 필터링 된 데이터 state
  const [isOpenList, setIsOpenList] = useState(false);

  // 필터에서 시작 시간 입력
  const startTimeFilterHandler = (event) => {
    setStartTimeFilter(event.target.value);
  };

  // 필터에서 끝 시간 입력
  const endTimeFilterHandler = (event) => {
    setEndTimeFilter(event.target.value);
  };

  // 필터에서 최소 월급 입력
  const minWageFilterHandler = (event) => {
    setMinWageFilter(event.target.value);
  };

  // 필터에서 최대 월급 입력
  const maxWageFilterHandler = (event) => {
    setMaxWageFilter(event.target.value);
  };

  // 검색할 장소를 입력하는 핸들러
  const searchPlaceHandler = (event) => {
    setSearchPlace(event.target.value);
  };

  // 검색 키워드 입력 후 검색을 시작하는 핸들러
  const placeSubmitHandler = (event) => {
    event.preventDefault();
    setSearchLocation(searchPlace);
    // setSearchPlace(""); 검색 기록을 남기지 않으려면 이 주석을 해제
    setApplyLocation([]);
    mapLocationBySearch(searchPlace); // 일단 초기화 시키고, 검색 장소로 이동 후 값 넣어주기
  };

  // 검색된 장소의 위치가 mapLocation State에 저장되도록 하는 핸들러
  const mapLocationBySearch = (location) => {
    // 카카오맵의 키워드 검색 API
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(location, placesSearchCB);

    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        setMapLocation([parseFloat(data[0].y), parseFloat(data[0].x)]);
      }
    }
  };

  // 목록 열고 닫은 핸들러
  const openListHandler = () => {
    setIsOpenList(!isOpenList);
  };

  // 목록 클릭 시 그 곳으로 지도 이동
  const clickPlaceOnList = (latitude, longitude) => {
    setApplyLocation([]);
    setSearchLocation("");
    setMapLocation([parseFloat(latitude), parseFloat(longitude)]);
  };

  // 숫자에 콤마를 붙이는 함수
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // 숫자에 콤마 제거 방법 : parseInt('12,345'.replace(/,/g, ""))

  // 시간에서 초를 제외하고 시, 분 만 표시하는 함수
  function simplifyTime(time) {
    //시-분-초 형태로 된 시간 데이터를 시-분으로 간단히 변경하기 위한 함수
    if (!time) return time;
    return time[0] + time[1] + time[2] + time[3] + time[4];
  }

  //로그인 정보 불러오는 이팩트
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/jobSeeker`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.user) {
          setJobSeekerId(res.data.user.id);
          setLogin(true);
        } else {
          setLogin(false);
        }
      });
  }, [Login]);

  // 지도를 표시하는 useEffect
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/job`, { withCredentials: true })
      .then((res) => {
        if (mapLevel <= 4) {
          return res.data.data.filter((job) => {
            return (
              parseFloat(job.latitude) >= mapLocation[0] - 0.01125 &&
              parseFloat(job.latitude) <= mapLocation[0] + 0.01125 &&
              parseFloat(job.longitude) >= mapLocation[1] - 0.01625 &&
              parseFloat(job.longitude) <= mapLocation[1] + 0.01625
            );
          });
        } else if (mapLevel === 5) {
          return res.data.data.filter((job) => {
            return (
              parseFloat(job.latitude) >= mapLocation[0] - 0.0225 &&
              parseFloat(job.latitude) <= mapLocation[0] + 0.0225 &&
              parseFloat(job.longitude) >= mapLocation[1] - 0.0325 &&
              parseFloat(job.longitude) <= mapLocation[1] + 0.0325
            );
          });
        } else if (mapLevel === 6) {
          return res.data.data.filter((job) => {
            return (
              parseFloat(job.latitude) >= mapLocation[0] - 0.045 &&
              parseFloat(job.latitude) <= mapLocation[0] + 0.045 &&
              parseFloat(job.longitude) >= mapLocation[1] - 0.065 &&
              parseFloat(job.longitude) <= mapLocation[1] + 0.065
            );
          });
        } else if (mapLevel >= 7) {
          return res.data.data.filter((job) => {
            return (
              parseFloat(job.latitude) >= mapLocation[0] - 0.09 &&
              parseFloat(job.latitude) <= mapLocation[0] + 0.09 &&
              parseFloat(job.longitude) >= mapLocation[1] - 0.13 &&
              parseFloat(job.longitude) <= mapLocation[1] + 0.13
            );
          });
        }
      })
      .then((res) => {
        // 시간 관련 필터기능 입력
        if (startTimeFilter && endTimeFilter) {
          return res.filter((job) => {
            return (
              job.startTime >= startTimeFilter && job.endTime <= endTimeFilter
            );
          });
        } else if (startTimeFilter) {
          return res.filter((job) => {
            return job.startTime >= startTimeFilter;
          });
        } else if (endTimeFilter) {
          return res.filter((job) => {
            return job.endTime <= endTimeFilter;
          });
        } else {
          return res;
        }
      })
      .then((res) => {
        // 월급 관련 필터기능 입력
        if (minWageFilter && maxWageFilter) {
          return res.filter((job) => {
            return (
              minWageFilter <= job.monthlyWage &&
              job.monthlyWage <= maxWageFilter
            );
          });
        } else if (minWageFilter) {
          return res.filter((job) => {
            return minWageFilter <= job.monthlyWage;
          });
        } else if (maxWageFilter) {
          return res.filter((job) => {
            return maxWageFilter >= job.monthlyWage;
          });
        } else {
          return res;
        }
      })
      .then((res)=>{
        if (jobSeekerId===0) {
          return res;
        } else {
          return res.filter((job)=>{
            return job.companyId !== 0
          })
        }
      })
      .then((data) => {
        setFilteredData(data);
        //-------------------- 지도 생성 (필수)

        //(필수)지도를 담을 영역의 DOM 레퍼런스
        const container = document.getElementById("map");

        //(필수)지도를 생성할 때 필요한 기본 옵션
        const options = {
          center: new kakao.maps.LatLng(37.5, 127.0),
          level: mapLevel, //지도의 레벨(확대, 축소 정도)
        };

        //(필수)지도 생성 및 객체 리턴
        const map = new kakao.maps.Map(container, options);

        // --------------- 아래 주석 해제 시 스카이뷰 기능 사용 가능
        // let mapTypeControl = new kakao.maps.MapTypeControl();
        // map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

        // --------------- 지도 확대 레벨을 조정하기 위한 스크롤 생성 및 확대 레벨을 state로 저장
        let zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // 지도 확대 레벨 변경 시 실행되는 함수
        kakao.maps.event.addListener(map, "zoom_changed", function () {
          // 지도의 현재 레벨을 얻어옵니다
          let level = map.getLevel();

          // 지도 확대 레벨을 state에 저장
          setMapLevel(level);
        });

        // --------------- 지도에서 보여줄 위치를 선택하기

        if (!(applyLocation.length === 0)) {
          // 지원 or 지원 취소한 일자리 위치가 state에 있는 경우

          // 지원 또는 지원취소 시 해당 일자리로 지도가 이동하기
          let locPosition = new kakao.maps.LatLng(
            applyLocation[0],
            applyLocation[1]
          );
          map.setCenter(locPosition);
        } else if (searchLocation) {
          // 장소 검색을 한 경우

          // 카카오맵의 키워드 검색 API
          const ps = new kakao.maps.services.Places();
          ps.keywordSearch(searchLocation, placesSearchCB);

          function placesSearchCB(data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
              let locPosition = new kakao.maps.LatLng(data[0].y, data[0].x);
              map.setCenter(locPosition);
            }
          }
        } else if (!(mapLocation.length === 0)) {
          // 현재 위치가 state에 있는 경우

          // 지도의 위치를 렌더링 바로 전 위치로 이동시키기 (랜더링 되어도 현재 위치가 변하지 않도록 하기 위함)
          let locPosition = new kakao.maps.LatLng(
            mapLocation[0],
            mapLocation[1]
          );
          map.setCenter(locPosition);
        }

        // else if (navigator.geolocation) {  //HTML5의 geolocation으로 사용할 수 있는지 확인합니다

        //   // 초기 지도화면 렌더링 시 사용자의 현재 GPS 위치가 제공되는 경우, 해당 위치를 지도에서 보여주기

        //   // GeoLocation을 이용해서 접속 위치를 얻어옵니다
        //   navigator.geolocation.getCurrentPosition(function (position) {
        //     let lat = position.coords.latitude, // 위도
        //       lon = position.coords.longitude; // 경도

        //       setMapLocation([lat, lon])

        //     let locPosition = new kakao.maps.LatLng(lat, lon); // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다

        //     // 지도 표시
        //     map.setCenter(locPosition);
        //   });
        // }

        // else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

        //   // 초기 지도화면 렌더링 시 현재 GPS 위치가 없는 경우, 서울 중심을 지도에서 보여주기
        //   let locPosition = new kakao.maps.LatLng(
        //     37.5665406708322,
        //     126.97787259165268
        //   );
        //   map.setCenter(locPosition);
        // }

        //------------------------ 마우스 이동 시 지도에서 해당 위치의 중심좌표 얻기

        // 마우스 드래그로 지도 이동이 완료되었을 때 마지막 파라미터로 넘어온 함수를 호출하도록 이벤트를 등록합니다
        kakao.maps.event.addListener(map, "dragend", function () {
          // 지도 중심좌표를 얻어옵니다
          let latlng = map.getCenter();
          setApplyLocation([]);
          setSearchLocation("");
          setMapLocation([latlng.Ma, latlng.La]);
        });

        //---------------------주소를 좌표로 변환 후 마커를 뛰우고 마커에 이벤트 등록하기

        // 주소-좌표 변환 객체를 생성합니다
        let geocoder = new kakao.maps.services.Geocoder();

        // 주소로 좌표를 검색합니다
        for (let i = 0; i < data.length; i++) {
          geocoder.addressSearch(data[i].location, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
              // 정상적으로 검색이 완료됐으면

              let coords = new kakao.maps.LatLng(result[0].y, result[0].x);

              // 지원 여부에 따라 마커 및 클릭 infowindow를 다르게 표시하기 위해, 지원자에 대한 axios 요청
              axios
                .get(`${process.env.REACT_APP_SERVER_URL}/applicant`, {
                  params: { jobId: data[i].id, jobSeekerId },
                })
                .then((applicant) => {
                  // 지원을 취소하는 핸들러 제작
                  function CancelApply() {
                    axios
                      .delete(
                        `${process.env.REACT_APP_SERVER_URL}/applicant`,
                        {
                          params: { jobId: data[i].id, jobSeekerId },
                        },
                        { withCredentials: true }
                      )
                      .then((res) => {
                        setApplyLocation([
                          parseFloat(result[0].y),
                          parseFloat(result[0].x),
                        ]);
                        setSearchLocation("");
                        setMapLocation([
                          parseFloat(result[0].y),
                          parseFloat(result[0].x),
                        ]);
                      })
                      .catch();
                  }

                  const ChangeGuestApplyStatus = () => {
                    guestApplyStatusHandler();
                  }

                  // 지원을 요청하는 핸들러 제작
                  function ApplyJob() {
                    axios
                      .post(`${process.env.REACT_APP_SERVER_URL}/applicant`, {
                        jobId: data[i].id,
                        jobSeekerId,
                      })
                      .then((res) => {
                        setApplyLocation([
                          parseFloat(result[0].y),
                          parseFloat(result[0].x),
                        ]);
                        setSearchLocation("");
                        setMapLocation([
                          parseFloat(result[0].y),
                          parseFloat(result[0].x),
                        ]);
                        return res;
                      })
                      .then((res)=>{
                        if(jobSeekerId===0) {
                          setTimeout(()=>{
                            console.log('res.data.id', res.data.id)
                            axios.delete(`${process.env.REACT_APP_SERVER_URL}/applicant/${res.data.id}`, {withCredentials: true})
                            .then((res)=>{
                              ChangeGuestApplyStatus();
                            })
                          }, 300000)
                        }
                      })
                      .catch();
                  }

                  // 마커에 이벤트를 등록하는 핸들러 제작
                  function MakeMarkerEvent(
                    marker,
                    buttonContent,
                    applyHandler
                  ) {
                    // 마커에 마우스오버 이벤트를 등록합니다
                    kakao.maps.event.addListener(
                      marker,
                      "mouseover",
                      function () {
                        // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
                        infowindowHover.open(map, marker);
                      }
                    );

                    // 마커에 마우스아웃 이벤트를 등록합니다
                    kakao.maps.event.addListener(
                      marker,
                      "mouseout",
                      function () {
                        // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                        infowindowHover.close();
                      }
                    );

                    // 마커에 Hover 이벤트 등록 : 인포윈도우에 정보 제공
                    let infowindowHover = new kakao.maps.InfoWindow({
                      content: `<div style="width:230px;text-align:center;padding:6px 0;">
                    <div>근무요일 : ${JSON.parse(data[i].day)}</div>
                    <div>하루 근무시간 : ${simplifyTime(
                      data[i].startTime
                    )}~${simplifyTime(data[i].endTime)}</div>
                    <div>월급여 : ${numberWithCommas(
                      data[i].monthlyWage
                    )}원</div>
                    <div>포지션 : ${data[i].position}</div>
                  </div>`,
                    });

                    // 마커에 click 이벤트 등록 : 인포윈도우에 정보 제공 및 일자리 지원 가능
                    let contentClick = document.createElement("div");
                    contentClick.style.cssText =
                      "width: 230px; text-align:center; padding:6px 0; 1px 0;";
                    let companyName = document.createElement("div");
                    companyName.textContent = `회사명 : ${data[i].companyName}`;
                    let day = document.createElement("div");
                    day.textContent = `근무요일 : ${JSON.parse(data[i].day)}`;
                    let time = document.createElement("div");
                    time.textContent = `근무시간 : ${simplifyTime(
                      data[i].startTime
                    )}~${simplifyTime(data[i].endTime)}(${data[i].time}시간)`;
                    let hourlyWage = document.createElement("div");
                    hourlyWage.textContent = `시급 : ${numberWithCommas(
                      data[i].hourlyWage
                    )}원`;
                    let monthlyWage = document.createElement("div");
                    monthlyWage.textContent = `예상 월급여 : ${numberWithCommas(
                      data[i].monthlyWage
                    )}원`;
                    let position = document.createElement("div");
                    position.textContent = `포지션 : ${data[i].position}`;

                    let btn = document.createElement("button");
                    btn.textContent = buttonContent;
                    btn.onclick = applyHandler;

                    contentClick.append(
                      companyName,
                      day,
                      time,
                      hourlyWage,
                      monthlyWage,
                      position,
                      btn
                    );

                    let infowindowClick = new kakao.maps.InfoWindow({
                      content: contentClick,
                      removable: true,
                    });
                    // 마커에 클릭이벤트를 등록합니다
                    kakao.maps.event.addListener(marker, "click", function () {
                      // 마커 위에 인포윈도우를 표시합니다
                      infowindowClick.open(map, marker);
                    });
                  }

                  if (applicant.data.data) {
                    // 이미 지원 한 일자리의 경우 마커 생성

                    if (applicant.data.data.status === "waiting") {
                      let imageSrc =
                        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

                      let imageSize = new kakao.maps.Size(24, 35);

                      let markerImage = new kakao.maps.MarkerImage(
                        imageSrc,
                        imageSize
                      );

                      // 결과값으로 받은 위치를 마커로 표시합니다
                      let marker = new kakao.maps.Marker({
                        map: map,
                        position: coords,
                        clickable: true, // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
                        image: markerImage, // 마커 이미지
                      });

                      MakeMarkerEvent(marker, "지원 취소하기", CancelApply);
                    } else if (applicant.data.data.status === "rejected") {
                      let imageSrc =
                        "https://cdn.pixabay.com/photo/2016/12/18/11/04/pointer-1915456_1280.png";

                      let imageSize = new kakao.maps.Size(24, 35);

                      let markerImage = new kakao.maps.MarkerImage(
                        imageSrc,
                        imageSize
                      );

                      // 결과값으로 받은 위치를 마커로 표시합니다
                      let marker = new kakao.maps.Marker({
                        map: map,
                        position: coords,
                        clickable: true, // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
                        image: markerImage, // 마커 이미지
                      });

                      MakeMarkerEvent(
                        marker,
                        "지원 거절됨(삭제하기)",
                        CancelApply
                      );
                    } else if (applicant.data.data.status === "accepted") {
                      let imageSrc =
                        "https://cdn.pixabay.com/photo/2014/04/02/10/45/location-304467_1280.png";

                      let imageSize = new kakao.maps.Size(24, 35);

                      let markerImage = new kakao.maps.MarkerImage(
                        imageSrc,
                        imageSize
                      );

                      // 결과값으로 받은 위치를 마커로 표시합니다
                      let marker = new kakao.maps.Marker({
                        map: map,
                        position: coords,
                        clickable: true, // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
                        image: markerImage, // 마커 이미지
                      });

                      if (jobSeekerId===0) {
                        MakeMarkerEvent(marker, "지원 승인됨(회원만 채팅가능)");
                      } else {
                      MakeMarkerEvent(marker, "지원 승인됨(채팅창 열기)");
                      }
                    }
                  } else {
                    // 지원하지 않은 일자리의 경우 마커 생성

                    // 결과값으로 받은 위치를 마커로 표시합니다
                    let marker = new kakao.maps.Marker({
                      map: map,
                      position: coords,
                      clickable: true, // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
                    });

                    MakeMarkerEvent(marker, "지원하기", ApplyJob);
                  }
                });
            }
          });
        }
      });
  }, [
    jobSeekerId,
    mapLocation,
    mapLevel,
    startTimeFilter,
    endTimeFilter,
    minWageFilter,
    maxWageFilter,
    guestApplyStatus
  ]);
  return (
    <div className="map-container">
      <NavBar />
      <div className="search-filter-container">
        {isOpenList ? (
          <>
            <form className="inputForm" onSubmit={placeSubmitHandler}>
              <div id="result-list">
                {filteredData.map((job, i) => (
                  <div key={i} style={{ marginTop: "20px" }}>
                    <span>{i + 1}</span>
                    <div>
                      <h5>{job.companyName}</h5>
                      <u></u>
                    </div>
                    <button
                      onClick={() => {
                        clickPlaceOnList(job.latitude, job.longitude);
                      }}
                    >
                      이동
                    </button>
                  </div>
                ))}
              </div>
            </form>
            <form className="search-wrapper" onSubmit={placeSubmitHandler}>
              <i className="fas fa-search"></i>
              <input
                className="search-input"
                placeholder="주변 동네를 검색하세요"
                onChange={searchPlaceHandler}
                value={searchPlace}
              />
              <button className="search-btn" type="submit">
                검색
              </button>
              <button className="search-btn" onClick={openListHandler}>
                목록
              </button>
            </form>
          </>
        ) : (
          <>
            <form className="search-wrapper" onSubmit={placeSubmitHandler}>
              <i className="fas fa-search"></i>
              <input
                className="search-input"
                placeholder="주변 동네를 검색하세요"
                onChange={searchPlaceHandler}
                value={searchPlace}
              />
              <button className="search-btn" type="submit">
                검색
              </button>
              <button className="search-btn" onClick={openListHandler}>
                목록
              </button>
            </form>
          </>
        )}
        <label className="filter-list">
          <select onChange={minWageFilterHandler}>
            <option value="">최소 월급</option>
            <option value="300000">300,000원</option>
            <option value="600000">600,000원</option>
            <option value="900000">900,000원</option>
            <option value="1200000">1,200,000원</option>
          </select>
        </label>
        <label className="filter-list">
          <select onChange={maxWageFilterHandler}>
            <option value="">최대 월급</option>
            <option value="300000">300,000원</option>
            <option value="600000">600,000원</option>
            <option value="900000">900,000원</option>
            <option value="1200000">1,200,000원</option>
            <option value="1500000">1,500,000원</option>
          </select>
        </label>
        <label className="filter-list">
          <input
            name="startTime"
            type="time"
            list="startTime"
            onChange={startTimeFilterHandler}
          />
        </label>
        <label className="filter-list">
          <input
            name="startTime"
            type="time"
            list="startTime"
            onChange={endTimeFilterHandler}
          />
        </label>
      </div>

      <div id="map"></div> 
    </div>
  );
}
