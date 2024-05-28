import i18next from "i18next";
import { useTranslation } from "react-i18next";

const namespace = "EmailInputForm";

i18next.addResourceBundle("en", namespace, {
  title: "LogIn",
  email: "Email",
  continueWithEmail: "Continue With Email",
  signup: "Sign up",
  errors: {
    emailIsRequired: "Email is required",
    emailIsNotValid: "Email is not valid",
  },
});

i18next.addResourceBundle("de", namespace, {
  title: "Anmeldung",
  email: "Email",
  continueWithEmail: "Weiter mit E-Mail",
  signup: "Melden Sie sich an",
  errors: {
    emailIsRequired: "Email is required",
    emailIsNotValid: "Email is not valid",
  },
});

i18next.addResourceBundle("fr", namespace, {
  title: "LogIn",
  email: "Email",
  continueWithEmail: "Continue With Email",
  signup: "Sign up",
  errors: {
    emailIsRequired: "Email is required",
    emailIsNotValid: "Email is not valid",
  },
});

export function useModuleTranslations() {
  return useTranslation(namespace, { useSuspense: false });
}
