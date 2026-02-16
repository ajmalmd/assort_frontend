import AuthLayout from "@/components/common/AuthLayout";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isCounting, setIsCounting] = useState(true);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const RESEND_INTERVAL = 30; // seconds

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const sentTime = localStorage.getItem("otp_sent_time");

    if (!sentTime) return;

    const sentTimestamp = parseInt(sentTime, 10);
    const now = Date.now();

    const diffInSeconds = Math.floor((now - sentTimestamp) / 1000);
    const remaining = RESEND_INTERVAL - diffInSeconds;

    if (remaining > 0) {
      setTimer(remaining);
      setIsCounting(true);
    } else {
      localStorage.removeItem("otp_sent_time");
    }
  }, []);

  useEffect(() => {
    if (!isCounting) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCounting(false);
          localStorage.removeItem("otp_sent_time");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCounting]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }

    setLoading(true);

    try {
      console.log("Verify OTP:", otpValue);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      navigate("/set-password");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (isCounting) return;

    setResendLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Store new sent time
      localStorage.setItem("otp_sent_time", Date.now().toString());

      setTimer(RESEND_INTERVAL);
      setIsCounting(true);
    } catch (error) {
      console.error(error);
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
                className="w-12 h-12 text-center text-lg font-bold bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 border border-gray-800"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Didn’t receive the code?</span>

            {isCounting ? (
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
