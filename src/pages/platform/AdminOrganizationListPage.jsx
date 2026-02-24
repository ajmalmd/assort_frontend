import { useEffect } from "react";
import { useNavigate } from "react-router";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";

const mockPlans = [
  {
    id: "1",
    planName: "Starter",
    price: 29,
    duration: "monthly",
    maxProjects: 5,
    maxMembers: 10,
    storage: 10240,
    subscriptionsCount: 12,
  },
  {
    id: "2",
    planName: "Professional",
    price: 79,
    duration: "monthly",
    maxProjects: 25,
    maxMembers: 50,
    storage: 102400,
    subscriptionsCount: 28,
  },
  {
    id: "3",
    planName: "Enterprise",
    price: 199,
    duration: "monthly",
    maxProjects: 999,
    maxMembers: 999,
    storage: 1024000,
    subscriptionsCount: 15,
  },
];

const AdminOrganizationListPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.PLATFORM + "organizations/",
        );
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // fetchData();
  }, []);
  return <div>AdminOrganizationListPage</div>;
};

export default AdminOrganizationListPage;
