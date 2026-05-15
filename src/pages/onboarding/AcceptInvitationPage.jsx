import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  getAccessToken,
  getAdminStatus,
  setActiveOrgId,
} from "@/api/authStore";
import { useAppDispatch, useAuthState } from "@/redux/hooks";
import { setActiveOrganization, setLoginData } from "@/redux/slices/authSlice";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import DotsBg from "@/assets/images/DotsBg.png";
import { formatEnum } from "@/appFunctions";

const AcceptInvitationPage = () => {
  const [status, setStatus] = useState("loading"); // loading, valid, expired, already_accepted, owner_blocked, invalid
  const [invitationData, setInvitationData] = useState({});
  const [isAccepting, setIsAccepting] = useState(false);

  const navigate = useNavigate();
  const { inviteToken } = useParams();
  const { user, organizations } = useAuthState();
  const dispatch = useAppDispatch();

  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  // Navigation helpers
  const handleGoHome = () => navigate("/");
  const handleGoToApp = () => navigate("/app");

  useEffect(() => {
    if (!inviteToken) {
      navigate("/app", { replace: true });
      return;
    }

    if (isAdmin) {
      navigate("/platform", { replace: true });
      return;
    }

    const fetchInvitation = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.INVITATIONS + "invitation/" + inviteToken + "/",
        );

        const data = response.data;
        setInvitationData(data);

        if (data.is_expired) {
          setStatus("expired");
          return;
        }

        if (data.is_accepted) {
          setStatus("already_accepted");
          return;
        }

        if (data.is_owner) {
          setStatus("owner_blocked");
          return;
        }

        if (!token && !data.user_exists) {
          navigate("/signup", {
            state: { inviteToken, email: data.email, full_name: data.name },
          });
          return;
        }

        if (!token) {
          navigate(`/login?invite_token=${inviteToken}`);
          return;
        }

        if (user?.email !== data.email) {
          setStatus("invalid");
          return;
        }

        setStatus("valid");
      } catch (err) {
        setStatus("invalid");
      }
    };

    fetchInvitation();
  }, [inviteToken, token, user, isAdmin, navigate]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await assort_api.post(
        APP_POINTS.INVITATIONS + "accept/",
        {
          token: inviteToken,
        },
      );
      const newOrg = {
        id: response.data.organization_id,
        title: invitationData?.organization?.title,
        role: invitationData?.role,
        email: invitationData?.organization?.email,
        logo: invitationData?.organization?.logo || "",
        city: invitationData?.organization?.city,
        country: invitationData?.organization?.country,
      };

      dispatch(
        setLoginData({ user, organizations: [...organizations, newOrg] }),
      );
      setActiveOrgId(response.data.organization_id);
      dispatch(setActiveOrganization(newOrg));

      navigate("/app");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccepting(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
        }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div
        className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
        }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <Clock className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Invitation Expired
                  </h2>
                  <p className="text-gray-600 mt-1">
                    This invitation has expired and can no longer be accepted.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleGoHome}
                className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "already_accepted") {
    return (
      <div
        className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
        }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Already Accepted
                  </h2>
                  <p className="text-gray-600 mt-1">
                    This invitation has already been accepted.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleGoToApp}
                className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "owner_blocked") {
    return (
      <div
        className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
        }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Action Not Allowed
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Organization owners cannot accept invitations to join
                    another organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleGoToApp}
                className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div
        className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
        }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Invalid Invitation
                  </h2>
                  <p className="text-gray-600 mt-1">
                    This invitation is invalid or access is denied.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleGoHome}
                className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Accept Invitation
            </h1>
            <p className="text-gray-600 mt-2">
              You&apos;ve been invited to join an organization
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-8 space-y-8">
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Organization
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {invitationData.organization?.title || ""}
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={formatEnum(invitationData.role) || "Member"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end items-center px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-lg gap-3">
            <button
              onClick={handleGoHome}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 rounded-lg font-medium"
            >
              {isAccepting ? "Accepting..." : "Accept Invitation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
