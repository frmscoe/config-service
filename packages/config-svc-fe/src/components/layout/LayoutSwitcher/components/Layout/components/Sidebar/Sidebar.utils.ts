// <!-- SPDX-License-Identifier: Apache-2.0 -->
/* eslint-disable no-restricted-syntax */
import type { TFunction } from "i18next";

export const getSidebarItems = (commonTranslations: TFunction) => [
  { text: commonTranslations("dashboard"), icon: "grid", url: "/" },
  {
    text: commonTranslations("rules"),
    icon: "person",
    children: [
      { text: commonTranslations("ruleDetails"), icon: "image", url: "/rule" },
      { text: commonTranslations("ruleConfig"), icon: "image", url: "/rule-config" },
      { text: commonTranslations("import"), icon: "image", url: "/rule-config/import" },
    ],
  },
  {
    text: commonTranslations("typologies"),
    icon: "image",
    children: [
      { text: commonTranslations("typologyDetails"), icon: "image", url: "/typology" },
      { text: commonTranslations("import"), icon: "image", url: "/typology/import" },
    ],
  },
  // { text: commonTranslations("ruleConfig"), icon: 'person', url: '/rule-config' },
  { text: commonTranslations("networkMap"), 
    icon: "setting",
    children: [
      { text: commonTranslations("networkMapDetails"), icon: "setting", url: "/network-map" },
      { text: commonTranslations("import"), icon: "image", url: "/network-map/import" },
    ], 
  },
  { text: commonTranslations("deployment"), icon: "setting", url: "/deployment" },
  { text: commonTranslations("settings"), icon: "setting", url: "/settings" },
];
