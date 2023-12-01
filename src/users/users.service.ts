import * as uuid from 'uuid';
import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserInfo } from './UserInfo';
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entity/user.entity";
import { DataSource, Repository } from "typeorm";
import { ulid } from "ulid";

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async createUser(name: string, email: string, password: string) {
    const existsUser = await this.checkUserExists(email);
    if (existsUser) {
      throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.');
    }

    const signupVerifyToken = uuid.v1();

    await this.saveUser(name, email, password, signupVerifyToken);
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  private async checkUserExists(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { email: email }
    });

    return user !== undefined;
  }

  private async saveUser(name: string, email: string, password: string, signupVerifyToken: string) {
    const user = new UserEntity();
    user.id = ulid();
    user.name = name;
    user.email = email;
    user.password = password;
    user.signupVerifyToken = signupVerifyToken;
    await this.usersRepository.save(user);
  }

  private async saveUserUsingQueryRunner(name: string, email: string, password: string, signupVerifyToken: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const user = new UserEntity();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;

      await queryRunner.manager.save(user);

      // throw new InternalServerErrorException();
      
      await queryRunner.commitTransaction();
    } catch (e) {
      // 롤백
      await queryRunner.rollbackTransaction();
    } finally {
      // QueryRunner 해제 필요
      await queryRunner.release();
    }
  }

  private async saveUserUsingTransaction(name: string, email: string, password: string, signupVerifyToken: string) {
    await this.dataSource.transaction(async manager => {
      const user = new UserEntity();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;

      await manager.save(user);

      // throw new InternalServerErrorException();
    })
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    /**
     * TODO
     * 1. DB에서 signupVerifyToken으로 회원 가입 처리중인 유저가 있는지 조회하고 없으면 에러처리
     * 2. 바로 로그인 상태가 되도록 jwt를 발급
     */
    throw new Error('method not implemented.');
  }

  async login(email: string, password: string): Promise<string> {
    /**
     * TODO
     * 1. email, password를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러 처리
     * 2. JWT 발급
     */
    throw new Error('method not implemented.');
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    /**
     * TODO
     * 1. userId를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러처리
     * 2. 조회된 데이터를 UserInfo 타입으로 응답
     */
    throw new Error('method not implemented.');
  }
}
