import {
  Body, Controller, Get, Headers, Inject, InternalServerErrorException, Logger, LoggerService, Param, Post, Query,
  UseGuards
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserInfo } from './UserInfo';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    @Inject(Logger) private readonly logger: LoggerService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    this.printWinstonLog(dto);
    this.printLoggerServiceLog(dto);
    const { name, email, password } = dto;
    await this.usersService.createUser(name, email, password);
  }

  private printWinstonLog(dto) {
    // this.logger.info('info:', dto);
    this.logger.log('info:', dto);
    this.logger.error('error: ', dto);
    this.logger.warn('warn:', dto);
    this.logger.debug('debug:', dto);
    this.logger.verbose('verbose:', dto);
  }

  private printLoggerServiceLog(dto) {
    try {
      throw new InternalServerErrorException('test');
    } catch (e) {
      this.logger.error('error: ' + JSON.stringify(dto), e.stack);
    }
    // this.logger.info('info: ' + JSON.stringify(dto));
    this.logger.log('info: ' + JSON.stringify(dto));
    this.logger.warn('warn: ' + JSON.stringify(dto));
    this.logger.verbose('verbose: ' + JSON.stringify(dto));
    this.logger.debug('debug: ' + JSON.stringify(dto));
  }

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    console.log(dto);
    const { signupVerifyToken } = dto;
    return await this.usersService.verifyEmail(signupVerifyToken);
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto): Promise<string> {
    console.log(dto);
    const { email, password } = dto;
    return await this.usersService.login(email, password);
  }

  // @Get('/:id')
  // async getUserInfo(@Headers() headers: any, @Param('id') userId: string): Promise<UserInfo> {
  //   const jwtString = headers.authorization.split('Bearer ')[1];
  //   this.authService.verify(jwtString);
  //   return await this.usersService.getUserInfo(userId);
  // }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserInfo(@Headers() headers: any, @Param('id') userId: string): Promise<UserInfo> {
    return await this.usersService.getUserInfo(userId);
  }
}
