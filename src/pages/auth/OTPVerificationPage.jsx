import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import AuthLayout from "@/components/common/AuthLayout";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "../../api/axios";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const {
    setVerificationToken,
    getFlow,
    getRemainingOtpTime,
    resetOtpTimer,
    requireStep,
  } = useAuthFlow();

  const flow = requireStep("otp");

  const RESEND_INTERVAL = 30;

  /* ---------------------------
     INITIAL GUARD + TIMER SETUP
  ----------------------------*/
  useEffect(() => {
    if (!flow) {
      navigate("/create-organization", { replace: true });
    }

    const remaining = getRemainingOtpTime(RESEND_INTERVAL);
    setTimer(remaining);
  }, []);

  /* ---------------------------
     TIMER COUNTDOWN
  ----------------------------*/
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ---------------------------
     OTP INPUT HANDLING
  ----------------------------*/
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ---------------------------
     VERIFY OTP
  ----------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!flow) return;

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await assort_api.post(
        APP_POINTS.ORGANIZATIONS + "verify-otp/",
        {
          email: flow.email,
          otp: otpValue,
        },
      );

      setVerificationToken(response.data.verification_token);
      navigate("/set-password");
    } catch (err) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      const { status, data } = err.response || {};

      if (status === 429) {
        setError(data?.detail);
        return;
      }

      if (data?.error_code === "OTP_EXPIRED") {
        setError("OTP expired. Please request a new one.");
        return;
      }

      setError(data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     RESEND OTP
  ----------------------------*/
  const handleResendOTP = async () => {
    if (!flow || timer > 0) return;

    setResendLoading(true);
    setError("");

    try {
      await assort_api.post(APP_POINTS.ORGANIZATIONS + "resend-otp/", {
        email: flow.email,
      });

      resetOtpTimer();
      setTimer(RESEND_INTERVAL);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const { status, data } = err.response || {};

      if (status === 429) {
        setError(data?.detail);
      } else {
        setError(data?.detail || "Unable to resend OTP. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-normal text-gray-900">Verify OTP</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                disabled={loading}
                className="w-12 h-12 text-center text-lg font-bold bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 border border-gray-800"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Didn’t receive the code?</span>

            {timer > 0 ? (
              <span className="text-gray-400 font-medium">
                Resend in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-gray-900 font-semibold hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors mt-6"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
