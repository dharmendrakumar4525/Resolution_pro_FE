import React, { useState, createContext, useEffect, useContext } from "react";
import {
  AxiosGetWithParams,
  axiosInstance,
  AxiosPost
} from "../Axios/Axios";
// import { AuthContext } from "./authContext";

export const UserContext = createContext();
export const UserContextProvider = (props) => {
//   const { userAuthContextData } = useContext(AuthContext);
//   const [userAuthData, setUserAuthData] = userAuthContextData;
  
  const [userformData, setUserFormData] = useState({
    user_name: "",
    user_email: "",
    user_gender_id: 0,
    user_dob: new Date(),
    user_image: {
      file: "Choose File",
      url: null
    },
    org_id: 0,
    location_id: 0
  });

  const [userDataList, setUserDataList] = useState([]);


  async function getUser(userSubmittedData, handleApiRes, handleApiError) {
    await AxiosPost("getUser", userSubmittedData,
      (apiRes) => {
        handleApiRes(apiRes)
      }, (apiError) => {
        handleApiError(apiError)
      })
  };


  async function addUser(userSubmittedData, handleApiRes, handleApiError) {
    await AxiosPost("addUser", userSubmittedData,
      (apiRes) => {
        handleApiRes(apiRes)
      }, (apiError) => {
        handleApiError(apiError)
      })
  };

  async function updateUser(userSubmittedData, handleApiRes, handleApiError) {
    await AxiosPost("updateUser", userSubmittedData,
      (apiRes) => {
        handleApiRes(apiRes)
      }, (apiError) => {
        handleApiError(apiError)
      })
  };

  async function deleteUser(userSubmittedData, handleApiRes, handleApiError) {
    await AxiosPost("deleteUser", userSubmittedData,
      (apiRes) => {
        handleApiRes(apiRes)
      }, (apiError) => {
        handleApiError(apiError)
      })
  };
  


  return <UserContext.Provider value={{
    getUser,
    addUser,
    updateUser,
    deleteUser,
   
    setUserFormData,
   
    setUserDataList
  }}>{props.children}</UserContext.Provider>;
};
