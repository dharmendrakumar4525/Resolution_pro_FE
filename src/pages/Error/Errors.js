import React from "react";
import { Container, Button } from "shards-react";
import { useHistory } from "react-router-dom";

const Errors = () => {
  let history = useHistory();
  return (
    <Container fluid className="main-content-container px-4 pb-4">
      <div className="error">
        <div className="error__content">
          <h2>404</h2>
          <h3>Page Not Found!</h3>
          <p>There was a problem on our end. Please try again later.</p>
          <Button pill onClick={() => history.goBack()}>
            &larr; Go Back
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Errors;
// componentDidMount() {
//   axios.get('http://moolwmsapis.us-east-2.elasticbeanstalk.com/getTemperatures').then((res) => {
//    this.setState({ referralData: res.data });
//  }).catch((err) => {
//  })
// }
