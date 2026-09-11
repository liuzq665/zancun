import { Rule, RuleType } from '@midwayjs/validate';

export class LoginDTO {
  @Rule(RuleType.string().required())
  phone: string;

  @Rule(RuleType.string().required())
  password: string;
}

export class RegisterDTO {
  @Rule(RuleType.string().required())
  phone: string;

  @Rule(RuleType.string().required().min(6).max(20))
  password: string;

  @Rule(RuleType.string())
  nickname?: string;
}
