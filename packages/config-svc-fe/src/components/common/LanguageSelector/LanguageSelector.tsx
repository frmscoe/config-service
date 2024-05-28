import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { PopupPosition } from "~/components/common/Select";
import { Select } from "~/components/common/Select";
import { languages } from "~/constants";

type Props = {
  popupPosition?: PopupPosition;
  isLabelShown?: boolean;
};

const LanguageSelector = ({ popupPosition, isLabelShown }: Props) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const handleChangeLanguage = (lng: string) => {
    i18n
      .changeLanguage(lng)
      .then(() => {
        setCurrentLang(lng);
      })
      .catch((err) => console.error(err));
  };

  return (
    <Select
      className="min-w-0"
      options={languages}
      value={currentLang}
      onChange={handleChangeLanguage}
      popupPosition={popupPosition}
      isLabelShown={isLabelShown}
    />
  );
};

export { LanguageSelector };
