import axios from "axios";
import apis from "./apis"; //json file containing apis data

// const url = "http://localhost:3000/v1";

const url = "https://uzjxpasrmq.us-east-1.awsapprunner.com/v1";

console.log("Token From storage 1:", sessionStorage.getItem("token"))

// latest code

const axiosInstance = axios.create({
  baseURL: url
});

const setAuthToken = ()=>{
  axios.defaults.headers.common = {
    Authorization: sessionStorage.getItem(
      "token"),
  };
  axiosInstance.defaults.headers.common = {
    Authorization: sessionStorage.getItem(
      "token"),
  };
}


function AxiosPost(key, body, handleSuccess, handleError, config = {}) {
  setAuthToken();
 
  let req = { ...body }
  
  axios
    .post(url + apis.endPoints[key], req, config)
    .then(res => {
      if (handleSuccess) handleSuccess(res);
    })
    .catch(err => {
      if (handleError) handleError(err);
    });
}

function AxiosPatch(key, body, handleSuccess, handleError, config = {}) {
  setAuthToken();
  console.log("Token From storage :", sessionStorage.getItem("token"));
  let fk_id_org = parseInt(sessionStorage.getItem("orgId"))
  axios
    .patch(url + apis.endPoints[key], { fk_id_org, ...body }, config)
    .then(res => {
      if (handleSuccess) handleSuccess(res);
    })
    .catch(err => {
      if (handleError) handleError(err);
    });
}

function AxiosPut(key, body, handleSuccess, handleError, config = {}) {
  setAuthToken();
  console.log("Token From storage :", sessionStorage.getItem("token"))
  let fk_id_org = parseInt(sessionStorage.getItem("orgId"))
  axios
    .put(url + apis.endPoints[key], { fk_id_org, ...body }, config)
    .then(res => {
      if (handleSuccess) handleSuccess(res);
    })
    .catch(err => {
      if (handleError) handleError(err);
    });
}

function AxiosGet(key, handleSuccess, handleError, config = {}) {
  setAuthToken();
  console.log("Token From storage :", sessionStorage.getItem("token"))
  axios
    .get(url + apis.endPoints[key], config)
    .then(res => {
      if (handleSuccess) handleSuccess(res);
    })
    .catch(err => {
      if (handleError) handleError(err);
    });
}

function AxiosGetWithParams(key, body, handleSuccess, handleError,config = {}) {
  setAuthToken();
  console.log("Token From storage :", sessionStorage.getItem("token"))
  axios
    .get(url + apis.endPoints[key], {
      params: body,
      ...config
    })
    .then(res => {
      if (handleSuccess) handleSuccess(res);
    })
    .catch(err => {
      if (handleError) handleError(err);
    });
}

export {
  url,
  axiosInstance,
  AxiosPost,
  AxiosGet,
  AxiosGetWithParams,
  AxiosPut,
  AxiosPatch
};
