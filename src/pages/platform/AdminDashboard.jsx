import { APP_POINTS } from "@/api/apiConfig";
import { getAdminStatus } from "@/api/authStore";
import assort_api from "@/api/axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";

const AdminDashboard = () => {
  const navigate = useNavigate();
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await assort_api.get(
//           APP_POINTS.PLATFORM + "organizations/",
//         );
//         console.log(response.data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchData();
//   }, []);

  return <div>AdminDashboard</div>;
};

export default AdminDashboard;
