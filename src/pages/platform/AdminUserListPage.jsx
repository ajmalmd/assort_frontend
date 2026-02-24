import { useEffect } from 'react'
import { useNavigate } from 'react-router';
import { APP_POINTS } from '@/api/apiConfig';
import assort_api from '@/api/axios';

const AdminUserListPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.PLATFORM + "users/",
        );
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // fetchData();
  }, []);
  return (
    <div>AdminUserListPage</div>
  )
}

export default AdminUserListPage