import React, { useState, useEffect, useContext } from "react";

import { Button, Card, CardBody, CardFooter, CardHeader, Col, FormSelect, ListGroup, ListGroupItem, Row } from "shards-react";
import {
  AxiosGetWithParams,
  axiosInstance,
  AxiosPost
} from "../../Axios/Axios";

import moment from "moment";



// import PNotify from "pnotify/dist/es/PNotify";
// import { div } from "../../../node_modules/@material-ui/core/index";
import { Form, Modal } from "react-bootstrap";
import { UserContext } from "../../context/UserContext";
// import { ClientContext } from "../../context/clientContext";


function User({ history }) {
  const [data, setData] = useState();
  // const [show, setShow] = useState(false);
  const [userList, setUserList] = useState();
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());
  const { getUser} = useContext(UserContext)


  useEffect(() => {
    getUserList();
  }, []);

  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  // const { orgId: fk_id_org, roleId } = useSelector(
  //   store => store.auth
  // );
  // const locationId = 1;


  const [arrayList, setArrayList] = useState(
    [
      ["S.No", "Indent Number", "Request Type", "Status", "Driver Mobile Number", "Organization", "Client Name", "Created By", "Created Date", "Created Time"]
    ]
  );
 

  

  const getUserList = () => {
    console.log("inside getEmployeeList")
    getUser({},(res) => {
        const { data: { meta: { code, message, status }, data } } = res;
        console.log("res :", res)
        if (code == 200) {
          console.log("in if block");
          console.log("data---->", data);
          setUserList(data)
          let temp = data.map((obj, index) => ({
            sno: index + 1,
            employee_name: obj.employee_name ? obj.employee_name : "NA",
            employee_email: obj.employee_email ? obj.employee_email : "NA",
            employee_gender_label: obj.employee_gender_label ? obj.employee_gender_label : "NA",
            employee_dob: obj.employee_dob ? moment(obj.employee_dob).format('DD-MMMM-YYYY') : "NA",
            employee_name: obj.employee_name ? obj.employee_name : "NA"
            // employee_image_url : obj.employee_image_url  ?  "Image" : obj.employee_image_url,
          }));

         

          setData(temp);
          let token = res.data.token;
          sessionStorage.setItem("token", token);
          // PNotify.success(message);
        } else {
          // PNotify.error(message);
          console.log("in else block");
        }
      },
      err => {
        console.log("apiError", err);
      }
    );
  }


 

  


  function handleRedirectEdit(i) {
    console.log("data :", data)
    console.log("EMployee List" ,userList);
    console.log("Index" ,i);
    // history.push({
    //   pathname: "/AddEditEmployee",
    //   state: { index: i, employeeList: employeeList }
    // });
    return;
  }
  function handleRedirectAdd() {
    history.push("/AddEditEmployee");
    return;
  }

  console.log("data", data)
  console.log("arrayList", arrayList)
 
  return (
    <>
      <div className="p-3">
        <div container lg={12} justifyContent="space-between" spacing={2} >
          <div item container lg={6}>
            <h5 className="custom_heading mb-4">Employee List</h5>
          </div>
          {/* <div item container lg={6} justifyContent="flex-end">
            <div style={{ float: 'right' }}>
              <Button style={{ color: "white" }} variant="primary"
                onClick={handleRedirectAdd}
              >
                Add Indent</Button>
            </div>&nbsp;&nbsp;&nbsp;&nbsp;
            <div style={{ float: 'right' }}>
              <Button style={{ color: "#2f64ae", backgroundColor: "transparent" }} variant="secondary"
                onClick={exportToCsv}> <i class="fa fa-download" aria-hidden="true"></i> Download

              </Button>
            </div>

          </div> */}
        </div>

   
          <div item container lg={12} justifyContent="flex-end">
            {/* <div item container lg={6} md={6} sm={6} >
              <div item style={{ marginTop: "-5%" }}>
                <DateInput
                  name={"startDate"}
                  // required={true}
                  handleChange={(date) => setStartDate(date)}
                  value={startDate}
                  placeHolder={"yyyy-MM-dd"}
                  label={"Start Date"}
                />
              </div>
              <div item style={{ marginTop: "-5%" }}>
                <DateInput
                  name={"endDate"}
                  // required={true}
                  handleChange={(date) => setEndDate(date)}
                  value={endDate}
                  placeHolder={"yyyy-MM-dd"}
                  label={"End Date"}
                />
              </div>&nbsp;
              <div item >
                <Button style={{ color: "white" }} variant="primary"
                  onClick={() => handleFilterChange()}
                >
                  Filter</Button>
              </div>&nbsp;
              <div item >
                <Button style={{ color: "white" }} variant="primary"
                  onClick={() => handleResetFilter()}
                >
                  Reset</Button>
              </div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> */}
            <div item container lg={6} md={6} sm={6} columnGap={5} justifyContent="flex-end" alignItems="right">

              <div style={{ float: 'right' }}>
                <Button style={{ color: "white" }} variant="primary"
                  onClick={handleRedirectAdd}
                >
                  Add Employee</Button>
              </div>&nbsp;
              <div style={{ float: 'right' }}>
                {/* <Button style={{ color: "#2f64ae", backgroundColor: "transparent" }} variant="secondary"
                  onClick={exportToCsv}> <i class="fa fa-download" aria-hidden="true"></i> Download

                </Button> */}
              </div>

            </div>
          </div>
          {/* <CustomTable
            headings={["S.No", "Name", "Email", "Gender", "Date of birth"]}
            title={"View Employees"}
            data={data}
            onRowClick={(i) => { handleRedirectEdit(i) }}
          /> */}


       
      </div>

    </>
  );
}

export default User;
