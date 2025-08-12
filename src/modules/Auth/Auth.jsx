import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  resendVerification,
  resetPassword,
} from "../../redux/auth/auth-thunks";

import Form from "../Form/Form";
import styles from "./Auth.module.css";
import appImage from "../../assets/app.png";
import axios from "../../shared/api/axiosInstance";

import IchgramIconLogin from "../../shared/icons/IchgramIconLogin/IchgramIconLogin";

const Auth = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const verified = location.state?.verified;
  const [searchParams] = useSearchParams();

  const [registeredData, setRegisteredData] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  // состояние для verify
  const [verifyStatus, setVerifyStatus] = useState("loading"); // loading | success | error
  const [verifyMessage, setVerifyMessage] = useState("");

  const loginFields = [
    { name: "email", type: "text", placeholder: "Email", required: true },
    { name: "password", type: "password", placeholder: "Password", required: true },
  ];

  const signupFields = [
    { name: "email", type: "text", placeholder: "Email", required: true },
    { name: "fullname", type: "text", placeholder: "Full Name", required: true },
    { name: "username", type: "text", placeholder: "Username", required: true },
    { name: "password", type: "password", placeholder: "Password", required: true },
  ];

  const resetFields = [
    { name: "email", type: "text", placeholder: "Email", required: true },
  ];

  const handleLogin = async (formData) => {
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    } else {
      throw result.payload;
    }
  };

  const handleSignup = async (formData) => {
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      setRegisteredData(formData);
    } else {
      throw result.payload;
    }
  };

  const handleResend = async () => {
    if (!registeredData) return;
    await dispatch(resendVerification(registeredData.email));

    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Логика верификации email
  useEffect(() => {
    if (mode === "verify") {
      const code = searchParams.get("code");
      if (!code) {
        setVerifyStatus("error");
        setVerifyMessage("Verification code is missing.");
        return;
      }

      const verify = async () => {
        setVerifyStatus("loading");
        setVerifyMessage("Verifying your email...");
        try {
          const { data } = await axios.post("/api/auth/verify", { code });
          setVerifyStatus("success");
          setVerifyMessage(
            data.message || "Your email has been verified. You can now log in."
          );

          setTimeout(() => {
            navigate("/login", { state: { verified: true }, replace: true });
          }, 2000);
        } catch (err) {
          setVerifyStatus("error");
          setVerifyMessage(
            err.response?.data?.message ||
            "Invalid or expired verification code"
          );
        }
      };

      verify();
    }
  }, [mode, searchParams, navigate]);

  // verify mode
  if (mode === "verify") {
    return (
      <div className={styles["auth"]}>
        <div className={styles["auth__verification"]}>
          <div className={styles["auth__form-container"]}>
            <div className={styles["auth__form"]}>
              <div className={styles["auth__logo"]}><IchgramIconLogin /></div>
              {verifyStatus === "loading" && (
                <div className={styles["auth__verified-message"]}>
                  Verifying your email...
                </div>
              )}
              {verifyStatus === "success" && (
                <div className={styles["auth__verified-message"]}>
                  {verifyMessage}
                </div>
              )}
              {verifyStatus === "error" && (
                <div className={styles["auth__error-message"]}>
                  {verifyMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["auth"]}>
      {mode === "login" && (
        <div className={styles["auth__login"]}>
          <div className={styles["auth__illustration"]}>
            <img
              className={styles["auth__illustration-image"]}
              src={appImage}
              alt="Ichgram"
            />
          </div>

          <div className={styles["auth__form-container"]}>
            <div className={styles["auth__form"]}>
              <div className={styles["auth__logo"]}><IchgramIconLogin /></div>
              {verified && (
                <div className={styles["auth__verified-message"]}>
                  Your email has been verified. You can now log in.
                </div>
              )}
              <Form
                fields={loginFields}
                buttonText="Log in"
                disableFieldErrors
                onSuccess={handleLogin}
              />

              <div className={styles["auth__or-block"]}>
                <div className={styles["auth__or-block-text"]}>Or</div>
              </div>
              <Link to="/reset" className={styles["auth__link"]}>
                Forgot password?
              </Link>
            </div>

            <div className={styles["auth__additional"]}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </div>
        </div>
      )}

      {mode === "signup" && (
        <div className={styles["auth__signup"]}>
          <div className={styles["auth__form-container"]}>
            <div className={styles["auth__form"]}>
              <div className={styles["auth__logo"]}><IchgramIconLogin /></div>
              <div className={styles["auth__subtitle"]}>
                Sign up to see photos and videos from your friends.
              </div>
              <Form
                fields={signupFields}
                buttonText="Sign up"
                successText="Registration successful! Please check your email to confirm your account."
                onSuccess={handleSignup}
              />

              {registeredData && (
                <div className={styles["auth__resend"]}>
                  <button
                    type="button"
                    className={styles["auth__button"]}
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0
                      ? `Try again in ${resendTimer}s`
                      : "Didn’t get the email? Try again"}
                  </button>
                </div>
              )}

              <div className={styles["auth__information"]}>
                <p>
                  People who use our service may have uploaded your contact information to Ichgram.{" "}
                  <Link to="/learn-more">Learn More</Link>
                </p>
                <p>
                  By signing up, you agree to our <Link to="/terms">Terms</Link>,{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link> and{" "}
                  <Link to="/cookies-policy">Cookies Policy</Link>.
                </p>
              </div>
            </div>

            <div className={styles["auth__additional"]}>
              Have an account? <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>
      )}

      {mode === "reset" && (
        <div className={styles["auth__reset"]}>
          <div className={styles["auth__form-container"]}>
            <div className={styles["auth__form"]}>
              <div className={styles["auth__trouble-icon"]}></div>
              <div className={styles["auth__title"]}>Trouble logging in?</div>
              <div className={styles["auth__description"]}>
                Enter your email, phone, or username and we'll send you a link to get back into your account.
              </div>

              <Form
                fields={resetFields}
                buttonText="Reset your password"
                successText="Temporary password has been sent to your email."
                onSuccess={async (formData) => {
                  const result = await dispatch(resetPassword(formData.email));

                  if (!resetPassword.fulfilled.match(result)) {
                    throw result.payload;
                  }
                }}
              />

              <div className={styles["auth__or-block"]}>
                <div className={styles["auth__or-block-text"]}>Or</div>
              </div>
              <Link
                to="/signup"
                className={`${styles["auth__link"]} ${styles["auth__link--accent-color"]}`}
              >
                Create new account
              </Link>
              <Link
                to="/login"
                className={`${styles["auth__link"]} ${styles["auth__link--button"]}`}
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;