import { Module, UnauthorizedException } from '@nestjs/common';
import { PrivilegeService } from './privilege.service';
import { RulePrivilegesDefinition } from '../rule/privilege.constant';
import { RuleConfigPrivilegesDefinition } from '../rule-config/privilege.constant';
@Module({
  providers: [PrivilegeService],
  exports: [PrivilegeService],
  controllers: [],
})
export class PrivilegeModule {
  constructor(private readonly privilegeService: PrivilegeService) {}
  async seedPrivileges() {
    try {
      const authorizationClient =
        await this.privilegeService.privilegeConnection();
      authorizationClient.addPrivilegesArray([
        ...RulePrivilegesDefinition,
        ...RuleConfigPrivilegesDefinition,
      ]);
      await authorizationClient.bootstrap(true);
      await authorizationClient.init();
      await authorizationClient.fetch();
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
