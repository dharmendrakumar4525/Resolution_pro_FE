import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./components/common/Common.css";
import routes from "./Routes/routes";
import withTracker from "./withTracker";

import { Provider } from "react-redux";
import store from "./store";

import "bootstrap/dist/css/bootstrap.min.css";
import "./shards-dashboard/styles/shards-dashboards.1.1.0.min.css";
import ProtectedRoute from "./Routes/ProtectedRoute";
import Errors from "./components/Error/Errors";
import SignUp from "./components/SignUp/index";
//import Carousel from "./shared_components/Carousel/Carousel";
//import AddWareHouse from "./components/AddWareHouse/AddWareHouse";
import AddHomeScreen from "./components/AddHomeScreen/AddHomeScreen";

//import { DefaultLayout } from "./layouts";
import OtpIn from "./components/new-login/otp/otpIndex";
import NewLoginIndex from "./components/new-login/login/new-loginIndex";
import Welcome from "./components/Welcome/";
//import Login from "./components/Login/Login";
//import AddMaterial from "./components/Material/AddMaterial/AddMaterial";
import SignUpOtp from "./components/SignUp/SignUpOtpForm";
import SuccessMsg from "./components/SignUp/SuccessMsg";
import LogOut from "./components/Logout/LogOut";
import ForgotPassword from "./components/new-login/ForgotPassword/ForgotPassword";


export default () => (
  <Provider store={store}>
    <Router basename={process.env.REACT_APP_BASENAME || ""}>
      <div>
        <Switch>
          <Route exact path="/" component={NewLoginIndex} />{" "}

          <Route exact path="/forgot" component={ForgotPassword} />{" "}
          {/* <Route exact path="/Welcome" component={Welcome} /> */}{" "}
          <Route exact path="/SignUp" component={SignUp} />{" "}
          <Route exact path="/Otp" component={OtpIn} />{" "}
          <Route exact path="/SignUpOtp" component={SignUpOtp} />{" "}
          <Route exact path="/Welcome" component={Welcome} />{" "}
          <Route exact path="/SignUpSucsess" component={SuccessMsg} />
          <Route exact path="/AddHomeScreen" component={AddHomeScreen} />{" "}
          <Route exact path="/LogOut" component={LogOut} />{" "}
          {routes.map((route, index) => {
            return (
              <ProtectedRoute
                key={index}
                path={route.path}
                exact={true}
                component={withTracker(props => {
                  return (
                    <route.layout {...props}>
                      <route.component {...props} />{" "}
                    </route.layout>
                  );
                })}
              />
            );
          })}
          {/* <Route
              path="*"
              component={withTracker(props => {
                return (
                  <DefaultLayout {...props}>
                    <Errors {...props} />
                  </DefaultLayout>
                );
              })}
            /> */}{" "}
          <Route path="*" component={Errors} />{" "}
        </Switch>{" "}
      </div>{" "}
    </Router>{" "}
  </Provider>
);

