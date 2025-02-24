import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Select from "react-select";
export default function DirectorForm() {
  const navigate = useNavigate();
  const { directorId } = useParams();
  const [managers, setManagers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [validated, setValidated] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("refreshToken");
  const location = useLocation();
  const clientId = location.state.clientId;

  const [step, setStep] = useState(1);
  console.log(managers, "manager-list");
  const [formData, setFormData] = useState({
    company_id: `${clientId}`,
    name: "",
    fathers_mothers_spouse_name: "",
    present_address: "",
    permanent_address: "",
    date_of_appointment: "",
    date_of_cessation: "",
    date_of_regularisation_AGM: "",
    designation: "",
    designation_change_date: "",
    remuneration_details: "",
    WTD_tenure: {
      from: "",
      to: "",
    },
    MD_tenure: {
      from: "",
      to: "",
    },
    DSC_expiry_date: "",
    BM_due_date: "",
    KYC_filling_date: "",
    "din/pan": "",
    email: "",
    is_manual: true, // Default value
  });

  // Fetch customer data if editing
  useEffect(() => {
    if (directorId) {
      const fetchDirectorData = async () => {
        try {
          const response = await fetch(
            `${apiURL}/director-data/${directorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          console.log(data, "unfilterred");
          setFormData(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
          toast.error("Failed to load customer data");
        }
      };
      fetchDirectorData();
    }
  }, [directorId]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (directorId) {
        const dataToSubmit = { ...formData };
        delete dataToSubmit.createdAt;
        delete dataToSubmit.updatedAt;
        delete dataToSubmit.id;
        const response = await fetch(`${apiURL}/director-data/${directorId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dataToSubmit),
        });
        if (!response.ok) {
          toast.error("Error while updating director details");
          return;
        }
        toast.success("Director updated successfully");
        navigate(-1);
      } else {
        const response = await fetch(`${apiURL}/director-data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          toast.error("Failed to add director");
        }

        const responseData = await response.json(); // Extract the response JSON
        console.log(responseData, "response-submitted");

        const directorId = responseData.id || responseData._id; // Adjust based on actual response

        if (!directorId) {
          toast.error("Director ID not found in response");
        }

        // Second API call to post director-docs
        const docResponse = await fetch(`${apiURL}/director-docs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            director_id: directorId,
            MBP_doc: {
              templateFile: "<p>Empty</p>",
            },
            DIR_doc: {
              templateFile: "<p>Empty</p>",
            },
          }),
        });

        if (!docResponse.ok) {
          toast.error("Failed to submit director document");
        }

        toast.success("Director added successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to add/update director. Please try again.");
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };
  const designationOptions = [
    { value: "Additional Director", label: "Additional Director" },
    { value: "Director", label: "Director" },
    { value: "Managing Director", label: "Managing Director" },
    { value: "Whole-Time Director", label: "Whole-Time Director" },
    { value: "Company Secretary", label: "Company Secretary" },
  ];

  return (
    <div className="pt-3 ps-3 pe-3 mb-3">
      <h2 className="mb-2">{directorId ? "Edit Director" : "Add Director"}</h2>

      <Form onSubmit={handleSubmit}>
        {/* Name */}
        <Row>
          <Col md={4} className="mt-2">
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>
                Name<sup>*</sup>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group
              controlId="fathers_mothers_spouse_name"
              className="mb-3"
            >
              <Form.Label>
                Father's Name<sup>*</sup>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.fathers_mothers_spouse_name}
                onChange={handleChange}
                placeholder="Enter Name"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="din/pan" className="mb-3">
              <Form.Label>
                DIN/PAN<sup>*</sup>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData["din/pan"]}
                onChange={handleChange}
                placeholder="Enter DIN/PAN"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>
                Email<sup>*</sup>
              </Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="designation" className="mb-3">
              <Form.Label>
                Designation<sup>*</sup>
              </Form.Label>
              <Select
                options={designationOptions}
                isClearable
                value={designationOptions.find(
                  (option) => option.value === formData?.designation
                )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      id: "designation",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                placeholder="Select Designation"
                isSearchable
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="present_address" className="mb-3">
              <Form.Label>Present Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.present_address}
                onChange={handleChange}
                placeholder="Enter Present Address"
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="permanent_address" className="mb-3">
              <Form.Label>Permanent Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.permanent_address}
                onChange={handleChange}
                placeholder="Enter Permanent Address"
              />
            </Form.Group>
          </Col>

          <Col md={4} className="mt-2">
            <Form.Group controlId="date_of_appointment" className="mb-3">
              <Form.Label>Date of Appointment</Form.Label>
              <Form.Control
                type="date"
                value={formData?.date_of_appointment?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="date_of_cessation" className="mb-3">
              <Form.Label>Date of Cessation</Form.Label>
              <Form.Control
                type="date"
                value={formData?.date_of_cessation?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="date_of_regularisation_AGM" className="mb-3">
              <Form.Label>Date of Regularisation AGM</Form.Label>
              <Form.Control
                type="date"
                value={formData.date_of_regularisation_AGM?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={4} className="mt-2">
            <Form.Group controlId="designation_change_date" className="mb-3">
              <Form.Label>Designation Change Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.designation_change_date?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="KYC_filling_date" className="mb-3">
              <Form.Label>KYC Filing Date</Form.Label>
              <Form.Control
                type="date"
                value={formData?.KYC_filling_date?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Remuneration Details */}

          <Col md={4} className="mt-2">
            <Form.Group controlId="remuneration_details" className="mb-3">
              <Form.Label>Remuneration Details</Form.Label>
              <Form.Control
                type="text"
                value={formData.remuneration_details}
                onChange={handleChange}
                placeholder="Enter Remuneration Details"
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="WTD_tenure.from" className="mb-3">
              <Form.Label>WTD Tenure (From)</Form.Label>
              <Form.Control
                type="date"
                value={formData.WTD_tenure?.from?.split("T")[0] || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="WTD_tenure.to" className="mb-3">
              <Form.Label>WTD Tenure (To)</Form.Label>
              <Form.Control
                type="date"
                value={formData.WTD_tenure?.to?.split("T")[0] || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Row 2 */}

          <Col md={4} className="mt-2">
            <Form.Group controlId="MD_tenure.from" className="mb-3">
              <Form.Label>MD Tenure (From)</Form.Label>
              <Form.Control
                type="date"
                value={formData.MD_tenure?.from?.split("T")[0] || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="MD_tenure.to" className="mb-3">
              <Form.Label>MD Tenure (To)</Form.Label>
              <Form.Control
                type="date"
                value={formData.MD_tenure?.to?.split("T")[0] || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Row 3 */}

          <Col md={4} className="mt-2">
            <Form.Group controlId="DSC_expiry_date" className="mb-3">
              <Form.Label>DSC Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={formData?.DSC_expiry_date?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mt-2">
            <Form.Group controlId="BM_due_date" className="mb-3">
              <Form.Label>BM Due Date</Form.Label>
              <Form.Control
                type="date"
                value={formData?.BM_due_date?.split("T")[0]}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Action Buttons */}
        <Button variant="primary" onClick={() => navigate(-1)} className="me-2">
          Cancel
        </Button>
        <Button type="submit" variant="secondary" className="ml-2">
          {buttonLoading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Save"
          )}
        </Button>
      </Form>
    </div>
  );
}
