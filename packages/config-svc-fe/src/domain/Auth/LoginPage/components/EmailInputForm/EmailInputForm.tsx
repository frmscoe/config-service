import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { object, string } from "yup";

import { Button } from "~/components/common/Button";
import { Input } from "~/components/common/Input";
import { useCommonTranslations } from "~/hooks";

import { useModuleTranslations } from "./EmailInputForm.i18n";

interface EmailFormInput {
  email: string;
}

interface Props {
  isLoading: boolean;
  onSubmitEmail: (email: string) => void;
}

const EmailInputForm = ({ isLoading, onSubmitEmail }: Props) => {
  const router = useRouter();
  const { t: moduleTranslations } = useModuleTranslations();
  const { t: commonTranslations } = useCommonTranslations();

  const schema = object({
    email: string()
      .required(moduleTranslations("errors.emailIsRequired"))
      .email(moduleTranslations("errors.emailIsNotValid")),
  }).required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInput>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: EmailFormInput) => {
    onSubmitEmail(data.email);
  };

  const handleGoToSignUpPage = () => {
    router.push("/sign-up");
  };

  return (
    <div>
      <form className="flex flex-col space-y-9 pb-15" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label={commonTranslations("formLabels.email")}
          className="w-full"
          type="text"
          {...register("email")}
          error={errors.email?.message}
        />
        <Button color="primary" type="submit" loading={isLoading}>
          {commonTranslations("loginForm.continueWithEmail")}
        </Button>
      </form>
      <hr className="text-gray mt-12 mb-8" />
      <div className="flex flex-col justify-center space-y-4">
        <p className="text-center">{commonTranslations("dontHaveAccount")}</p>
        <Button
          disabled={isLoading}
          color="primary"
          variant="outline"
          onClick={handleGoToSignUpPage}
        >
          {commonTranslations("loginForm.signup")}
        </Button>
      </div>
    </div>
  );
};

export { EmailInputForm };
