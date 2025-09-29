import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('axios');

type ConfigKey =
  | 'MAIL_PORT'
  | 'MAIL_USER'
  | 'MAIL_PASS'
  | 'APP_NAME'
  | 'DEFAULT_MAIL_FROM'
  | 'SECONDARY_MAIL_HOST'
  | 'SECONDARY_MAIL_PORT'
  | 'SECONDARY_MAIL_USER'
  | 'SECONDARY_MAIL_PASS';

describe('MailerService', () => {
  let service: MailerService;

  const configMap: Record<ConfigKey, string | number> = {
    MAIL_PORT: 587,
    MAIL_USER: 'user',
    MAIL_PASS: 'pass',
    APP_NAME: 'TestApp',
    DEFAULT_MAIL_FROM: 'test@app.com',
    SECONDARY_MAIL_HOST: 'secondary.host',
    SECONDARY_MAIL_PORT: 2525,
    SECONDARY_MAIL_USER: 'secondaryUser',
    SECONDARY_MAIL_PASS: 'secondaryPass',
  };

  const mockConfigService = {
    get: jest.fn((key: ConfigKey): string | number => configMap[key]),
  };

  const mockUsersService = {
    incrementEmailsSent: jest.fn(),
  };

  const mockSendMail = jest.fn();

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    jest.clearAllMocks();
  });

  describe('mailTransport', () => {
    it('should create a transporter with correct config', () => {
      service.mailTransport();
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'invalid.smtp.host',
          port: 587,
          secure: false,
          auth: { user: 'user', pass: 'pass' },
        }),
      );
    });
  });
});
