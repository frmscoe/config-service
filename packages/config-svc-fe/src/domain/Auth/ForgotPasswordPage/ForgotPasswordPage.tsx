import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import React, { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { object, string } from "yup";

import { Button } from "~/components/common/Button";
import { Input } from "~/components/common/Input";
import { AlreadyAMember } from "~/domain/Auth/components";
import { useCommonTranslations } from "~/hooks";

import styles from "./ForgotPasswordPage.module.scss";

const validationSchema = object({
  email: string().label("Email").email().trim().required(),
}).required();

interface IForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const { t: commonTranslations } = useCommonTranslations();
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IForgotPasswordForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IForgotPasswordForm> = () => {
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

      <div className={styles["forgot-password-container"]}>
        <div className="w-full flex flex-col">
          <h1 className="text-3xl">{commonTranslations("forgotPassword")}</h1>
          <form className="flex flex-col space-y-9 mb-2 mt-8" onSubmit={handleSubmit(onSubmit)}>
            <p className="text-center leading-loose">
              {commonTranslations("forgetPasswordDescription")}
            </p>
            <Input
              label="Email"
              className="w-full"
              {...register("email")}
              error={errors.email?.message}
            />
            <Button color="primary" type="submit" loading={loading}>
              {commonTranslations("submit")}
            </Button>
          </form>
          <Button color="red" variant="outline" className="!border-white">
            {commonTranslations("resendLink")}
          </Button>

          <AlreadyAMember />
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
