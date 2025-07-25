// <!-- SPDX-License-Identifier: Apache-2.0 -->
export interface UserEmailMapping {
  _key?: string; // ArangoDB document key, optional as it's typically auto-generated
  clientId: string;
  email: string;
  privileges: string[]; // Storing privileges here for completeness, as they're also from the JWT
  createdAt?: string; // Using string to match ISOString output from Date.toISOString()
  updatedAt?: string;
}