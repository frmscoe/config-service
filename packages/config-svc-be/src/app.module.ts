import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RuleModule } from './rule/rule.module';
import { RuleConfigModule } from './rule-config/rule-config.module';
import { AuthModule } from './auth/auth.module';
import { TypologyModule } from './typology/typology.module';
import { TypologyConfigModule } from './typology-config/typology-config.module';
import { PrivilegeModule } from './privilege/privilege.module';
import { ArangoDatabaseService } from './arango-database/arango-database.service';
import { PrivilegeService } from './privilege/privilege.service';
import { BandModule } from './band/band.module';
import { CaseModule } from './case/case.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrivilegeModule,
    AuthModule,
    RuleModule,
    RuleConfigModule,
    TypologyModule,
    TypologyConfigModule,
    BandModule,
    CaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, ArangoDatabaseService, PrivilegeService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly arangoService: ArangoDatabaseService) {}
  async onModuleInit() {
    await this.arangoService.initializeDatabase();
  }
}
