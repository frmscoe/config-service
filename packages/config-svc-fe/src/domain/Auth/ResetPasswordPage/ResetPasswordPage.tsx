import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import React, { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { object, ref, string } from "yup";

import { Button } from "~/components/common/Button";
import { Input } from "~/components/common/Input";
import { AlreadyAMember } from "~/domain/Auth/components";
import { useCommonTranslations } from "~/hooks";

import styles from "./ResetPasswordPage.module.scss";

const validationSchema = object().shape({
  password: string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: string()
    .oneOf([ref("password"), ""], "Passwords must match")
    .required("Confirm password is required"),
});

interface IResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const { t: commonTranslations } = useCommonTranslations();
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IResetPasswordForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IResetPasswordForm> = () => {
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
      <div className={styles["reset-password-container"]}>
        <div className="w-full flex flex-col">
          <h1 className="text-3xl">{commonTranslations("resetPassword")}</h1>
          <form className="flex flex-col space-y-9 mb-2" onSubmit={handleSubmit(onSubmit)}>
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
            <Button color="primary" type="submit" loading={loading}>
              {commonTranslations("reset")}
            </Button>

            <AlreadyAMember />
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
