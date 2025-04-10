// <!-- SPDX-License-Identifier: Apache-2.0 -->
export const getRandomNumber = (min = 0, max = 10): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
