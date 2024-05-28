import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { object, string } from "yup";

import { Button } from "~/components/common/Button";
import { Input } from "~/components/common/Input";
import { useCommonTranslations } from "~/hooks";

import { useModuleTranslations } from "./PasswordInputForm.i18n";

interface PasswordFormInput {
  password: string;
}

interface Props {
  isLoading: boolean;
  onBack: () => void;
  onSubmitPassword: (password: string) => void;
}

const PasswordInputForm = ({ isLoading, onBack, onSubmitPassword }: Props) => {
  const { t: moduleTranslations } = useModuleTranslations();
  const { t: commonTranslations } = useCommonTranslations();

  const schema = object({
    password: string()
      .required(moduleTranslations("errors.passwordIsRequired"))
      .min(6, moduleTranslations("errors.passwordMustBeAtLeast")),
  }).required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormInput>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: PasswordFormInput) => {
    onSubmitPassword(data.password);
  };

  return (
    <form className="flex flex-col space-y-9 pb-15" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Password"
        className="w-full"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      <div className="flex justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            aria-describedby="remember"
            type="checkbox"
            className="bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
          />
          <span className="ml-2">{commonTranslations("rememberMe")}</span>
        </div>
        <Link href="/forgot-password" className="!text-red">
          {commonTranslations("forgotPassword")}
        </Link>
      </div>
      {/* <ReCAPTCHA sitekey={import.meta.env.VITE_APP_SITE_KEY} ref={captchaRef} /> */}
      <Button color="primary" type="submit" loading={isLoading}>
        {commonTranslations("login")}
      </Button>
      <Button
        onClick={onBack}
        type="button"
        color="red"
        variant="outline"
        className="!border-white !mt-2"
        disabled={isLoading}
      >
        {commonTranslations("back")}
      </Button>
    </form>
  );
};

export { PasswordInputForm };
