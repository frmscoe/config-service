import React, { useEffect, useState } from "react";

import { useAuth } from "~/context/auth";
import { useCommonTranslations } from "~/hooks";

import { EmailInputForm } from "./components/EmailInputForm";
import { PasswordInputForm } from "./components/PasswordInputForm";
import styles from "./LoginPage.module.scss";
import { Alert } from "antd";

const LoginPage = () => {
  const { isLoading, login, error: authError } = useAuth();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { t: commonTranslations } = useCommonTranslations();

  useEffect(() => {
    setError("");
  }, []);

  const handleSubmitEmail = (submittedEmail: string) => {
    setUsername(submittedEmail);
    setStep(2);
  };

  const handleStepBack = () => {
    setStep(1);
  };

  const handleSubmitPassword = async (password: string) => {
    try {
    await login({ password, username });
    setSuccess(true);
    } catch (error: any) {
      setError(error?.message);
    }
   
  };

  return (
    <div className={styles["login-container"]}>
      <div className="w-full flex flex-col">
        <h1 className="text-3xl font-bold mb-8">{commonTranslations("loginForm.title")}</h1>

       {success && <Alert className="mb-5" showIcon description="Please wait you will be redirected shortly" type="success" message="Login Successful" />}

        {authError && (
          <Alert
          className="mb-5" closable showIcon description={authError} type="error" message="Login Failed" 
          />
        )}

        {step === 1 && <EmailInputForm isLoading={isLoading} onSubmitEmail={handleSubmitEmail} />}
        {step === 2 && (
          <PasswordInputForm
            isLoading={isLoading}
            onBack={handleStepBack}
            onSubmitPassword={handleSubmitPassword}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
