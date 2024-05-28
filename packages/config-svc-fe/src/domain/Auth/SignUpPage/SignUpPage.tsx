import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { object, ref, string } from "yup";

import { Button } from "~/components/common/Button";
import { Input } from "~/components/common/Input";
import { AlreadyAMember } from "~/domain/Auth/components";
import { useCommonTranslations } from "~/hooks";

import styles from "./SignUpPage.module.scss";

const validationSchema = object().shape({
  firstName: string().required("First name is required"),
  lastName: string().required("Last name is required"),
  email: string()
    .label("Email")
    .email("Please enter the valid email address")
    .trim()
    .required("Email is required"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/,
      "Password must contain at least 1 number and 1 special character",
    ),
  confirmPassword: string()
    .oneOf([ref("password"), ""], "Passwords must match")
    .required("Confirm password is required"),
});

interface ISignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage = () => {
  const { t: commonTranslations } = useCommonTranslations();
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ISignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<ISignUpForm> = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>LexTego - Configuration Service</title>
      </Head>
      <div className={styles["register-container"]}>
        <div className="w-full flex flex-col">
          <form className={styles["signup-form"]} onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-3xl font-bold">{commonTranslations("signupForm.title")}</h1>
            <div className={styles["signup-form-forminputs"]}>
              <Input
                label={commonTranslations("formLabels.firstName")}
                className="w-full"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label={commonTranslations("formLabels.lastName")}
                className="w-full"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
              <Input
                label={commonTranslations("formLabels.email")}
                className={classNames(styles["email-input"], "w-full")}
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label={commonTranslations("formLabels.password")}
                className="w-full"
                type="password"
                {...register("password")}
                error={errors.password?.message}
              />
              <Input
                label={commonTranslations("formLabels.confirmPassword")}
                className="w-full"
                type="password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <Button
                className={styles["create-account-btn"]}
                color="primary"
                type="submit"
                loading={loading}
              >
                {commonTranslations("signupForm.createAccount")}
              </Button>
            </div>

            <div className="flex">
              <input
                id="remember"
                aria-describedby="remember"
                type="checkbox"
                className="bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
              />
              <p className="text-sm text-gray ml-2">
                {commonTranslations("signupForm.consent.text1")}{" "}
                <Link href="javascript;">
                  {commonTranslations("signupForm.consent.termsOfService")}
                </Link>
                ,{" "}
                <Link href="javascript;">
                  {commonTranslations("signupForm.consent.privacyPolicy")}
                </Link>
                {commonTranslations("signupForm.consent.text2")}{" "}
                <Link href="javascript;">
                  {commonTranslations("signupForm.consent.notificationSettings")}
                </Link>
                .
              </p>
            </div>
          </form>

          <AlreadyAMember />
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
