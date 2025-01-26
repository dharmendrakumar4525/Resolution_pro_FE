import React, { useEffect, useState } from "react";

import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  Col,
  Row,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { apiURL } from "../../API/api";

import { faEye } from "@fortawesome/free-solid-svg-icons";
export default function AttendanceInsights() {
  const [shareholders, setShareholders] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [bmAttendance, setBMAttendance] = useState([
    {
      notes: {
        fileName: null,
        filedocx: null,
        templateName: "Notice",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/02ab18c2-b3a3-48d6-ab45-a25107da245f-Notice_1732180834066.docx",
      },
      mom: {
        fileName: null,
        filedocx: null,
        templateName: "MOM",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/025f558c-7150-4ea3-844b-909fa59277df-MOM_1732190305036.docx",
      },
      attendance: {
        fileName: null,
        filedocx: null,
        templateName: "Attendance",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/38aa0abf-527c-4856-8b82-69a60ffc08ee-Attendance_1732190319661.docx",
      },
      acknowledgement: {
        fileName: null,
        filedocx: null,
        templateName: "Acknowledgement",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/720f23ad-c239-4340-8c2d-680a0ea16952-BM_Acknowledgement_1735022718617.docx",
      },
      standard_time: "IST",
      endTime: null,
      status: "scheduled",
      approval_status: "approved",
      is_approved: false,
      pre_stage: false,
      post_stage: false,
      title: "1st Board Meeting",
      client_name: "674ebfddc89a57593c685b30",
      description: "To disburse Salary",
      meetingType: "board_meeting",
      date: "2025-01-23T00:00:00.000Z",
      startTime: "16:43",
      organizer: "66f535f59665e24b0435d420",
      participants: [
        {
          isPresent: true,
          isPresent_vc: false,
          _id: "67923d4b04c368e9404a0e30",
          director: {
            end_date: "-",
            is_manual: false,
            company_id: "674ebfddc89a57593c685b30",
            name: "RAMAN SEHGAL",
            email: "subham@gmail.com",
            designation: "Director",
            begin_date: "2024-12-13",
            "din/pan": "05158883",
            createdAt: "2024-12-03T08:22:53.387Z",
            updatedAt: "2024-12-16T07:05:28.621Z",
            id: "674ebfddc89a57593c685b33",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "67923d4b04c368e9404a0e31",
          director: {
            end_date: "-",
            is_manual: true,
            company_id: "674ebfddc89a57593c685b30",
            name: "Dev",
            designation: "Director",
            begin_date: "2024-12-24",
            "din/pan": "EZAPR0802U",
            email: "mukul@gmail.com",
            createdAt: "2024-12-16T07:05:52.620Z",
            updatedAt: "2024-12-16T07:05:52.620Z",
            id: "675fd1502571cb490f86dbb9",
          },
        },
      ],
      other_participants: [],
      agendaItems: [
        {
          fileName:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/d18efc87-4529-4b25-be71-2238f2f31821-bc7a0bee-4ad6-44f6-9529-e4a1e6f9e378-BM_Agenda_Physical_1732798955830.pdf",
          filedocx:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/d18efc87-4529-4b25-be71-2238f2f31821-bc7a0bee-4ad6-44f6-9529-e4a1e6f9e378-BM_Agenda_Physical_1732798955830.docx",
          stage: null,
          _id: "6790d2fe43cb560023bd7853",
          templateName: "BM Agenda Physical",
          meetingType: "board_meeting",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/bc7a0bee-4ad6-44f6-9529-e4a1e6f9e378-BM_Agenda_Physical_1732798955830.docx",
        },
      ],
      variables: {
        counter: "1ST",
        company_name: "Tech Innovations Pvt Ltd",
        current_year: "2024-2025",
        venue: "123 Innovation Street, Silicon Valley, CA",
        day_date: "Thursday, January 23RD 2025",
        time: "4:43 PM IST",
        prev_board_meeting: "21/3/25",
        name: "RAMAN SEHGAL",
        din_pan: "05158883",
      },
      location: "123 Innovation Street, Silicon Valley, CA",
      leave_of_absense: [
        {
          fileName: null,
          filedocx: null,
          _id: "67923d4b04c368e9404a0e32",
          director: "675fd1502571cb490f86dbb9",
          templateName: "Leave of Absence",
          meetingType: "board_meeting",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/e0636bcc-b906-4e70-8c5e-9690f816ab35-BM_Leave_of_Absence_1735022741749.docx",
        },
      ],
      resolutions: [],
      createdAt: "2025-01-22T11:14:06.537Z",
      updatedAt: "2025-01-23T12:59:55.153Z",
      id: "6790d2fe43cb560023bd7850",
    },
    {
      notes: {
        fileName: null,
        filedocx: null,
        templateName: "Notice",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/8f1732fa-a4b1-4753-82e7-3bbfb9e3b164-Notice_1732180834066.docx",
      },
      mom: {
        fileName: null,
        filedocx: null,
        templateName: "MOM",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/596b2e95-1c96-458e-b480-dace705bbc79-MOM_1732190305036.docx",
      },
      attendance: {
        fileName: null,
        filedocx: null,
        templateName: "Attendance",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/83798bd4-3482-47f5-84bc-51a789c8d5b2-Attendance_1732190319661.docx",
      },
      acknowledgement: {
        fileName: null,
        filedocx: null,
        templateName: "Acknowledgement",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/72e876c8-c56c-430e-9f8c-0674b700a2c5-BM_Acknowledgement_1735022718617.docx",
      },
      standard_time: "IST",
      endTime: null,
      status: "scheduled",
      approval_status: "review",
      is_approved: false,
      pre_stage: false,
      post_stage: false,
      title: "2nd Board Meeting",
      client_name: "674ebfddc89a57593c685b30",
      description: "To disburse Salary",
      meetingType: "board_meeting",
      date: "2025-02-28T00:00:00.000Z",
      startTime: "17:49",
      organizer: "66f535f59665e24b0435d420",
      participants: [
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "6790e25243cb560023bd7a27",
          director: {
            end_date: "-",
            is_manual: false,
            company_id: "674ebfddc89a57593c685b30",
            name: "RAMAN SEHGAL",
            email: "subham@gmail.com",
            designation: "Director",
            begin_date: "2024-12-13",
            "din/pan": "05158883",
            createdAt: "2024-12-03T08:22:53.387Z",
            updatedAt: "2024-12-16T07:05:28.621Z",
            id: "674ebfddc89a57593c685b33",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "6790e25243cb560023bd7a28",
          director: {
            end_date: "-",
            is_manual: true,
            company_id: "674ebfddc89a57593c685b30",
            name: "Dev",
            designation: "Director",
            begin_date: "2024-12-24",
            "din/pan": "EZAPR0802U",
            email: "mukul@gmail.com",
            createdAt: "2024-12-16T07:05:52.620Z",
            updatedAt: "2024-12-16T07:05:52.620Z",
            id: "675fd1502571cb490f86dbb9",
          },
        },
      ],
      other_participants: [],
      agendaItems: [
        {
          fileName:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/mukul.pdf",
          filedocx:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/mukul.docx",
          stage: null,
          _id: "6790e25243cb560023bd7a29",
          templateName: "BM Agenda Physical",
          meetingType: "board_meeting",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/730bf86e-2e47-454b-8ba3-98d9d235dc07-BM_Agenda_Physical_1732798955830.docx",
        },
      ],
      variables: {
        counter: "2ND",
        company_name: "Tech Innovations Pvt Ltd",
        current_year: "2024-2025",
        venue: "123 Innovation Street, Silicon Valley, CA",
        day_date: "Friday, February 28TH 2025",
        time: "5:49 PM IST",
        prev_board_meeting: "23/01/2025",
        name: "RAMAN SEHGAL",
        din_pan: "05158883",
      },
      location: "123 Innovation Street, Silicon Valley, CA",
      leave_of_absense: [],
      resolutions: [
        {
          fileName: null,
          filedocx: null,
          _id: "6791e9d08012817c61abf3b2",
          templateName: "To grant authorisation for MCA compliances",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/1a889743-4138-47b3-af63-6253715aa573-Authorisation_MCA_Compliances_1733743904185_9ow0qz.docx",
          meetingType: "board_meeting",
        },
      ],
      createdAt: "2025-01-22T12:19:30.444Z",
      updatedAt: "2025-01-23T07:03:54.694Z",
      id: "6790e25243cb560023bd7a26",
    },
    {
      notes: {
        fileName: null,
        filedocx: null,
        templateName: "Notice",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/d5c5974f-a8bc-492a-b329-71350e6eea4a-Notice_1732180834066.docx",
      },
      mom: {
        fileName: null,
        filedocx: null,
        templateName: "MOM",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/3873cd81-646f-4ac1-8ee5-6e09a92d5ff4-MOM_1732190305036.docx",
      },
      attendance: {
        fileName: null,
        filedocx: null,
        templateName: "Attendance",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/2d3d6b8b-9987-4909-a55c-54962e1cdb10-Attendance_1732190319661.docx",
      },
      acknowledgement: {
        fileName: null,
        filedocx: null,
        templateName: "Acknowledgement",
        meetingType: "board_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/f90462cd-6461-485d-b97d-1fdc4a48073f-BM_Acknowledgement_1735022718617.docx",
      },
      standard_time: "sak",
      endTime: null,
      status: "scheduled",
      approval_status: "draft",
      is_approved: true,
      pre_stage: false,
      post_stage: false,
      title: "3rd Board Meeting",
      client_name: "674ebfddc89a57593c685b30",
      description: "To disburse Salary",
      meetingType: "board_meeting",
      date: "2025-03-29T00:00:00.000Z",
      startTime: "19:10",
      organizer: "672c47c238903b464c9d2920",
      participants: [
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "6790f73f8012817c61abf2e9",
          director: {
            end_date: "-",
            is_manual: false,
            company_id: "674ebfddc89a57593c685b30",
            name: "RAMAN SEHGAL",
            email: "subham@gmail.com",
            designation: "Director",
            begin_date: "2024-12-13",
            "din/pan": "05158883",
            createdAt: "2024-12-03T08:22:53.387Z",
            updatedAt: "2024-12-16T07:05:28.621Z",
            id: "674ebfddc89a57593c685b33",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "6790f73f8012817c61abf2ea",
          director: {
            end_date: "-",
            is_manual: true,
            company_id: "674ebfddc89a57593c685b30",
            name: "Dev",
            designation: "Director",
            begin_date: "2024-12-24",
            "din/pan": "EZAPR0802U",
            email: "mukul@gmail.com",
            createdAt: "2024-12-16T07:05:52.620Z",
            updatedAt: "2024-12-16T07:05:52.620Z",
            id: "675fd1502571cb490f86dbb9",
          },
        },
      ],
      other_participants: [],
      agendaItems: [
        {
          fileName:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/4d32fa60-db40-4494-b686-c74da8a20b51-423f1143-2b6b-4232-a69a-301cc47ac128-BM_Agenda_Physical_1732798955830.pdf",
          filedocx:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/4d32fa60-db40-4494-b686-c74da8a20b51-423f1143-2b6b-4232-a69a-301cc47ac128-BM_Agenda_Physical_1732798955830.docx",
          stage: null,
          _id: "6790f73f8012817c61abf2eb",
          templateName: "BM Agenda Physical",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/meeting-agendas/423f1143-2b6b-4232-a69a-301cc47ac128-BM_Agenda_Physical_1732798955830.docx",
          meetingType: "board_meeting",
        },
      ],
      variables: {
        counter: "3RD",
        company_name: "Tech Innovations Pvt Ltd",
        current_year: "2024-2025",
        venue: "123 Innovation Street, Silicon Valley, CA",
        day_date: "Saturday, March 29TH 2025",
        time: "7:10 PM sak",
        prev_board_meeting: "28/02/2025",
        name: "RAMAN SEHGAL",
        din_pan: "05158883",
      },
      location: "123 Innovation Street, Silicon Valley, CA",
      leave_of_absense: [],
      resolutions: [],
      createdAt: "2025-01-22T13:41:13.109Z",
      updatedAt: "2025-01-23T11:01:46.175Z",
      id: "6790f5798012817c61abf2ad",
    },
  ]);
  const [cmAttendance, setCMAttendance] = useState([
    {
      notes: {
        fileName: null,
        filedocx: null,
        templateName: "Notice",
        meetingType: "committee_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/3b797539-5290-48cf-af1c-7aa8eacc0fc6-Committee_Notice_1734494773114.docx",
      },
      mom: {
        fileName: null,
        filedocx: null,
        templateName: "MOM",
        meetingType: "committee_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/3a0f3ec6-11c2-4284-b995-278fe64a719d-Committee_MOM_1734495645330.docx",
      },
      attendance: {
        fileName: null,
        filedocx: null,
        templateName: "Attendance",
        meetingType: "committee_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/617f567c-7a21-45a9-af3b-3d37a1c9ad61-Committee_Attendance_1734495768983.docx",
      },
      acknowledgement: {
        fileName: null,
        filedocx: null,
        templateName: "Acknowledgement",
        meetingType: "committee_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/065f3296-2c9c-49e0-978e-529b7c299914-Committee_Acknowledgement_1736342628337.docx",
      },
      meetingType: "committee_meeting",
      standard_time: "IST",
      endTime: null,
      status: "scheduled",
      approval_status: "draft",
      is_approved: false,
      pre_stage: false,
      post_stage: false,
      title: "1st Committee Meeting",
      client_name: "674ebfddc89a57593c685b30",
      date: "2025-01-31T00:00:00.000Z",
      startTime: "12:03",
      organizer: "66f535f59665e24b0435d420",
      committee_id: {
        client_name: "674ebfddc89a57593c685b30",
        committee: "67627bccef90fcf9287714d4",
        committee_members: [
          {
            _id: "6785be40e934823a5fd13e3a",
            name: "674ebfddc89a57593c685b33",
          },
          {
            _id: "6785be52e934823a5fd13e62",
            name: "674ebfddc89a57593c685b33",
          },
          {
            _id: "6785be52e934823a5fd13e63",
            name: "674ebfddc89a57593c685b32",
          },
        ],
        createdAt: "2025-01-14T01:30:40.901Z",
        updatedAt: "2025-01-14T01:30:58.722Z",
        id: "6785be40e934823a5fd13e39",
      },
      participants: [
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "67860554ef1ee4002307edbe",
          director: {
            end_date: "-",
            is_manual: false,
            company_id: "674ebfddc89a57593c685b30",
            name: "RAMAN SEHGAL",
            email: "subham@gmail.com",
            designation: "Director",
            begin_date: "2024-12-13",
            "din/pan": "05158883",
            createdAt: "2024-12-03T08:22:53.387Z",
            updatedAt: "2024-12-16T07:05:28.621Z",
            id: "674ebfddc89a57593c685b33",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "67860554ef1ee4002307edbf",
          director: {
            end_date: "-",
            is_manual: false,
            company_id: "674ebfddc89a57593c685b30",
            name: "RAMAN SEHGAL",
            email: "subham@gmail.com",
            designation: "Director",
            begin_date: "2024-12-13",
            "din/pan": "05158883",
            createdAt: "2024-12-03T08:22:53.387Z",
            updatedAt: "2024-12-16T07:05:28.621Z",
            id: "674ebfddc89a57593c685b33",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "67860554ef1ee4002307edc0",
          director: null,
        },
      ],
      other_participants: [],
      agendaItems: [
        {
          fileName: null,
          filedocx: null,
          stage: null,
          _id: "67860554ef1ee4002307edc1",
          templateName: "Committee Agenda Physical",
          meetingType: "committee_meeting",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/committee-meeting-agendas/74c72080-731e-4f14-b751-cb235b9814d4-Committee_Agenda_Physical_1734495304506.docx",
        },
      ],
      variables: {},
      location: "123 Innovation Street, Silicon Valley, CA",
      leave_of_absense: [],
      resolutions: [],
      createdAt: "2025-01-14T06:33:56.240Z",
      updatedAt: "2025-01-14T06:33:56.240Z",
      id: "67860554ef1ee4002307edbd",
    },
  ]);
  const [smAttendance, setSMAttendance] = useState([
    {
      notes: {
        fileName: null,
        filedocx: null,
        templateName: "Notice",
        meetingType: "shareholder_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/14a658aa-2444-46d2-ae84-40c0a67a3662-Shareholder_Meeting_Notice_1736408699873.docx",
      },
      mom: {
        fileName: null,
        filedocx: null,
        templateName: "MOM",
        meetingType: "shareholder_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/7829e6a0-af90-4cf4-86be-6045cc45e5d2-Shareholder_MOM_1736409025124.docx",
      },
      attendance: {
        fileName: null,
        filedocx: null,
        templateName: "Attendance",
        meetingType: "shareholder_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/1a4b2039-aaed-489e-843b-db5a1927cffa-Shareholder_Attendance_1736408758858.docx",
      },
      acknowledgement: {
        fileName: null,
        filedocx: null,
        templateName: "Acknowledgement",
        meetingType: "shareholder_meeting",
        templateFile:
          "https://resolutionpro.s3.amazonaws.com/meeting-agendas/73a3db43-7b3c-426c-b2c9-8eccf20c073d-Shareholder_Acknowledgement_1736408779228.docx",
      },
      meetingType: "shareholder_meeting",
      standard_time: "IST",
      endTime: null,
      status: "scheduled",
      approval_status: "draft",
      is_approved: false,
      pre_stage: false,
      post_stage: false,
      title: "1st Shareholder Meeting",
      client_name: "674ebfddc89a57593c685b30",
      date: "2025-01-17T00:00:00.000Z",
      startTime: "14:26",
      organizer: "66f535f59665e24b0435d420",
      participants: [
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c37527",
          director: null,
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c37528",
          director: {
            end_date: "-",
            is_manual: false,
            company_id: "674ebfddc89a57593c685b30",
            name: "RAMAN SEHGAL",
            email: "subham@gmail.com",
            designation: "Director",
            begin_date: "2024-12-13",
            "din/pan": "05158883",
            createdAt: "2024-12-03T08:22:53.387Z",
            updatedAt: "2024-12-16T07:05:28.621Z",
            id: "674ebfddc89a57593c685b33",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c37529",
          director: {
            end_date: "-",
            is_manual: true,
            company_id: "674ebfddc89a57593c685b30",
            name: "Dev",
            designation: "Director",
            begin_date: "2024-12-24",
            "din/pan": "EZAPR0802U",
            email: "mukul@gmail.com",
            createdAt: "2024-12-16T07:05:52.620Z",
            updatedAt: "2024-12-16T07:05:52.620Z",
            id: "675fd1502571cb490f86dbb9",
          },
        },
      ],
      shareholder_participants: [
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c3752a",
          shareholder: {
            end_date: "-",
            company_id: "674ebfddc89a57593c685b30",
            name: "Mukul",
            designation: "Shareholder-1",
            begin_date: "2025-01-01",
            "din/pan": "DZAPR0802",
            email: "mukul@avidusinteractive.com",
            createdAt: "2025-01-05T17:22:54.087Z",
            updatedAt: "2025-01-05T17:22:54.087Z",
            id: "677abfee5019771c8acf32a3",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c3752b",
          shareholder: {
            end_date: "-",
            company_id: "674ebfddc89a57593c685b30",
            name: "Subham",
            designation: "Director",
            begin_date: "2025-01-18",
            "din/pan": "DZAPR0803",
            email: "ramdevmukul800@gmail.com",
            createdAt: "2025-01-05T17:37:07.200Z",
            updatedAt: "2025-01-09T07:30:45.098Z",
            id: "677ac3435019771c8acf32f0",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c3752c",
          shareholder: {
            end_date: "-",
            company_id: "674ebfddc89a57593c685b30",
            name: "Dharmendra",
            designation: "fde",
            begin_date: "2025-01-17",
            "din/pan": "DZAPR0805",
            email: "fds@gmail.com",
            createdAt: "2025-01-05T17:38:05.887Z",
            updatedAt: "2025-01-09T07:30:58.711Z",
            id: "677ac37d5019771c8acf32f8",
          },
        },
        {
          isPresent: false,
          isPresent_vc: false,
          _id: "677f8f5bd3115f06a4c3752d",
          shareholder: {
            end_date: "-",
            company_id: "674ebfddc89a57593c685b30",
            name: "Darshan",
            designation: "fd",
            begin_date: "2025-01-03",
            "din/pan": "sd",
            email: "mukul@avidusinteractive.com",
            createdAt: "2025-01-05T17:42:06.938Z",
            updatedAt: "2025-01-09T07:31:08.842Z",
            id: "677ac46e5019771c8acf3309",
          },
        },
      ],
      other_participants: [],
      agendaItems: [
        {
          fileName: null,
          filedocx: null,
          stage: null,
          _id: "677f8f5bd3115f06a4c3752e",
          templateName: "Shareholder Meeting Agenda",
          meetingType: "shareholder_meeting",
          templateFile:
            "https://resolutionpro.s3.amazonaws.com/shareholder-meeting-agendas/58053833-75d5-42dd-9049-d9c815f52a46-Shareholder_Meeting_Agenda_1736408635029.docx",
        },
      ],
      variables: {},
      location: "123 Innovation Street, Silicon Valley, CA",
      leave_of_absense: [],
      resolutions: [],
      createdAt: "2025-01-09T08:56:59.357Z",
      updatedAt: "2025-01-09T08:56:59.357Z",
      id: "677f8f5bd3115f06a4c37526",
    },
  ]);
  const { id } = useParams();
  const location = useLocation();
  const row = location.state.row;
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/customer-maintenance/attendance/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setShareholders(data.data);
        // setBMAttendance(data.data?.meetings);
        // setCMAttendance(data.data?.committeeMeetings);
        // setSMAttendance(data.data?.shareholderMeetings);
        console.log("absentees", data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id, token]);
  const toggleRow = (meetingId) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(meetingId)
        ? prevExpandedRows.filter((id) => id !== meetingId)
        : [...prevExpandedRows, meetingId]
    );
  };
  return (
    <div className="details-container">
      <h2 className="mb-4">Attendance Details for {row?.company_name}</h2>

      <Tabs
        defaultActiveKey="BoardMeeting"
        id="example-tabs"
        className="mb-3 mt-4"
      >
        <Tab
          eventKey="BoardMeeting"
          title="Board Meeting"
          className="bg-black-400 w-full"
        >
          {bmAttendance?.length > 1 ? (
            <table className="width-70 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Meeting Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Directors Present
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bmAttendance?.map((meeting) => (
                  <React.Fragment key={meeting.id}>
                    {/* Main Row */}
                    <tr className="mb-2">
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting.participants.length} Directors
                      </td>
                      <td
                        className="border border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRow(meeting.id)}
                      >
                        <Button>
                          {expandedRows.includes(meeting.id) ? "Hide" : "Show"}
                        </Button>
                      </td>
                    </tr>

                    {/* Collapsible Row */}
                    {expandedRows.includes(meeting.id) && (
                      <>
                        {meeting.participants?.map((participant) => (
                          <tr
                            key={participant.id}
                            className="px-4 py-3 bg-shade"
                          >
                            <td className="px-4">
                              {participant.director.name}
                            </td>
                            <td className="px-4">
                              {participant.isPresent || participant.isPresent_vc
                                ? "Present"
                                : "Absent"}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>

        <Tab eventKey="CommitteeMeeting" title="Committee Meeting">
          {cmAttendance?.length >= 1 ? (
            <table className="width-70 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Meeting Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Directors Present
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cmAttendance?.map((meeting) => (
                  <React.Fragment key={meeting?.id}>
                    {/* Main Row */}
                    <tr className="mb-2">
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.participants?.length} Directors
                      </td>
                      <td
                        className="border border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRow(meeting?.id)}
                      >
                        <Button>
                          {expandedRows.includes(meeting?.id) ? "Hide" : "Show"}
                        </Button>
                      </td>
                    </tr>

                    {/* Collapsible Row */}
                    {expandedRows.includes(meeting?.id) && (
                      <>
                        {meeting?.participants?.map((participant) => (
                          <tr
                            key={participant._id}
                            className="px-4 py-3 bg-shade"
                          >
                            <td className="px-4">
                              {participant?.director?.name}
                            </td>
                            <td className="px-4">
                              {participant?.isPresent ||
                              participant?.isPresent_vc
                                ? "Present"
                                : "Absent"}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>
        <Tab eventKey="ShareholderMeeting" title="Shareholder Meeting">
          {smAttendance?.length >= 1 ? (
            <table className="width-70 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Meeting Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Directors Present
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {smAttendance?.map((meeting) => (
                  <React.Fragment key={meeting.id}>
                    {/* Main Row */}
                    <tr className="mb-2">
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {meeting?.participants.length} Directors
                      </td>
                      <td
                        className="border border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRow(meeting?.id)}
                      >
                        <Button>
                          {expandedRows.includes(meeting.id) ? "Hide" : "Show"}
                        </Button>
                      </td>
                    </tr>

                    {/* Collapsible Row */}
                    {expandedRows.includes(meeting.id) && (
                      <>
                        {meeting.participants?.map((participant) => (
                          <tr
                            key={participant?._id}
                            className="px-4 py-3 bg-shade"
                          >
                            <td className="px-4">
                              {participant?.director?.name}
                            </td>
                            <td className="px-4">
                              {participant?.isPresent ||
                              participant?.isPresent_vc
                                ? "Present"
                                : "Absent"}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center mt-5">
              <h5>No data available</h5>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
