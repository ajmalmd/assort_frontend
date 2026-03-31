import { getInitials } from "@/appFunctions";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router";

const mockMember = {
  id: "1",
  name: "John Doe",
  email: "john@company.com",
  role: "Admin",
  department: "Engineering",
  status: "Active",
  profile_pic: "",
};

const MemberViewPage = () => {
  const [memberDetails, setMemberDetails] = useState(mockMember);
  const { id } = useParams();
  useEffect(() => {
    // console.log(id);
  }, []);
  return (
    <div className="space-y-6">
      {/* profile picture */}
      {memberDetails.profile_pic ? (
        <img
          src={memberDetails.profile_pic}
          alt="Organization logo"
          className="w-16 h-16 rounded-lg object-cover bg-gray-100"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            {getInitials(memberDetails.name)}
          </span>
        </div>
      )}

      {/* details */}
      <p>{memberDetails.name}</p>
      <p>{memberDetails.email}</p>
      <p>{memberDetails.role}</p>
    </div>
  );
};

export default MemberViewPage;
