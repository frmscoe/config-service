// <!-- SPDX-License-Identifier: Apache-2.0 -->
export type Option = {
  id: string;
  name: string;
};

export type OptionValueName = {
  value: number;
  name: string;
};
export type OptionsValueName = OptionValueName[];

export type Options = Option[];

export type SortTypes = "asc" | "desc" | "none";
