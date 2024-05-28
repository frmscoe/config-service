/* eslint-disable no-restricted-syntax */
import type { TFunction } from "i18next";

export const getSidebarItems = (commonTranslations: TFunction) => [
  { text: commonTranslations("dashboard"), icon: "grid", url: "/" },
  {
    text: commonTranslations("typologies"),
    icon: "image",
    children: [{ text: commonTranslations("typologyDetails"), icon: "image", url: "/typology" }],
  },
  {
    text: commonTranslations("rules"),
    icon: "person",
    children: [
      { text: commonTranslations("ruleDetails"), icon: "image", url: "/rule" },
      { text: commonTranslations("ruleConfig"), icon: "image", url: "/rule-config" },
      { text: commonTranslations("import"), icon: "image", url: "/rule-config/import" },
    ],
  },
  // { text: commonTranslations("ruleConfig"), icon: 'person', url: '/rule-config' },
  { text: commonTranslations("networkMap"), icon: "setting", url: "/network-map" },
  { text: commonTranslations("deployment"), icon: "setting", url: "/deployment" },
  { text: commonTranslations("settings"), icon: "setting", url: "/settings" },
];
