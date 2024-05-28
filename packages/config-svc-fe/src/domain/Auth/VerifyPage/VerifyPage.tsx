import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { object, string } from "yup";

import { Button } from "~/components/common/Button";
import { Input } from "~/components/common/Input";
import { useCommonTranslations } from "~/hooks";

import styles from "./VerifyPage.module.scss";

const validationSchema = object().shape({
  code: string()
    .required("Verification code is required")
    .test("length", "Verification code must have 6 characters", (value) => value?.length === 6)
    .test("characters", "Verification code can only contain letters and digits", (value) =>
      /^[a-zA-Z0-9]+$/.test(value || ""),
    ),
});

interface IVerifyCodeForm {
  code: string;
}

const VerifyPage = () => {
  const { t: commonTranslations } = useCommonTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IVerifyCodeForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IVerifyCodeForm> = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>LexTego - Configuration Service</title>
      </Head>
      <div className={styles["verify-container"]}>
        <div className="w-full flex flex-col">
          <form className="flex flex-col space-y-9 mb-2" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-3xl font-bold">{commonTranslations("verify")}</h1>
            <Input
              label={commonTranslations("formLabels.oneTimeCode")}
              className="w-full"
              {...register("code")}
              error={errors.code?.message}
            />
            <Button color="primary" type="submit" loading={loading}>
              {commonTranslations("confirm")}
            </Button>
          </form>
          <Button color="red" variant="outline" className="!border-white">
            {commonTranslations("resendCode")}
          </Button>
          <Button color="red" variant="outline" className="!border-white mt-2" onClick={handleBack}>
            {commonTranslations("back")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default VerifyPage;
