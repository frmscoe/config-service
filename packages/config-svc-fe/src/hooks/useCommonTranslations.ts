import i18next from "i18next";
import { useTranslation } from "react-i18next";

import { deCommon, enCommon, frCommon, esCommon } from "~/i18n/common";

i18next.addResourceBundle("en", "CommonTranslation", enCommon);
i18next.addResourceBundle("de", "CommonTranslation", deCommon);
i18next.addResourceBundle("fr", "CommonTranslation", frCommon);
i18next.addResourceBundle("es", "CommonTranslation", esCommon);

export function useCommonTranslations() {
  return useTranslation("CommonTranslation", { useSuspense: false });
}
