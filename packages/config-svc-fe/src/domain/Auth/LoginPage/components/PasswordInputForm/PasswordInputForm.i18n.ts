import i18next from "i18next";
import { useTranslation } from "react-i18next";

const namespace = "PasswordInputForm";

i18next.addResourceBundle("en", namespace, {
  title: "Welcome",
  password: "Password",
  login: "Login",
  forgotPassword: "Forgot password?",
  errors: {
    passwordIsRequired: "Password is required",
    passwordMustBeAtLeast: "Password must be at least 6 characters",
  },
});

i18next.addResourceBundle("de", namespace, {
  title: "Willkommen",
  password: "Passwort",
  login: "Anmeldung",
  forgotPassword: "Forgot password?",
  errors: {
    passwordIsRequired: "Password is required",
    passwordMustBeAtLeast: "Password must be at least 6 characters",
  },
});

i18next.addResourceBundle("fr", namespace, {
  title: "Welcome",
  password: "Password",
  login: "Login",
  forgotPassword: "Forgot password?",
  errors: {
    passwordIsRequired: "Password is required",
    passwordMustBeAtLeast: "Password must be at least 6 characters",
  },
});

export function useModuleTranslations() {
  return useTranslation(namespace, { useSuspense: false });
}
