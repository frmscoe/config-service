import { RulePrivilegesDefinition } from '../src/rule/privilege.constant';
import { RuleConfigPrivilegesDefinition } from '../src/rule-config/privilege.constant';
import { AUTHORIZATION_BASEURL } from '../src/constants';

export const assignPrivileges = async (userToken: string, username: string) => {
  const privileges = [
    ...RulePrivilegesDefinition,
    ...RuleConfigPrivilegesDefinition,
  ].map((privilege) => privilege.privId);

  return await fetch(
    `${AUTHORIZATION_BASEURL}/platformRoles/${username}/add_privileges`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(privileges),
    },
  );
};
