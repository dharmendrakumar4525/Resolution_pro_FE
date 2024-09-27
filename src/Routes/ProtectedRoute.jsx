import React, { useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { toggleLocationDropDown } from "../actions/utilityActions";
// import { AuthContextProvider } from "../context/authContext";


import { UserContextProvider } from "../context/UserContext";



//routes where location drop down should be disabled
const disabledLocationDDRoutes = ["/checkPerson/:type", "/PersonOut", "/PersonInOtp", "/AddEditPerson", "/thirdPartyOTP", "/checkVehicle", "/AddVehicle"]

function ProtectedRoute({ component: Component, ...rest }) {
  const { path } = rest;
  // const { locationDropdownDisabled } = useSelector(store => store.utility);

  // const reduxDispatch = useDispatch()

  // useEffect(() => {
  //   //console.log(path)
  //   if ((disabledLocationDDRoutes.includes(path) && !locationDropdownDisabled)
  //     || (!disabledLocationDDRoutes.includes(path) && locationDropdownDisabled)
  //   )
  //     reduxDispatch(toggleLocationDropDown())
  // }, [path])
  return (
   
   

    <UserContextProvider>


    
    
      <Route
        {...rest}
        render={props => {
          if (
            true ||
            (sessionStorage.dashboard_data &&
              JSON.parse(sessionStorage.dashboard_data))
          ) {
            const dashData =
              sessionStorage.dashboard_data &&
              JSON.parse(sessionStorage.dashboard_data).role;
            //remove '||true' from below if condition
            if (
              true ||
              (dashData &&
                dashData[0].routes &&
                Object.keys(dashData[0].routes).includes(path))
            )
              return <Component {...props} />;
            else return <Redirect to="/errors" />;
          } else {
            return (
              <Redirect
                to={{ to: "/", state: { from: props.location.pathname } }}
              />
            );
          }
        }}
      />
    
    </UserContextProvider>

    
   

  );
}

export default ProtectedRoute;
