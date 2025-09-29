import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './mail.interface';
import Mail from 'nodemailer/lib/mailer';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MailerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  mailTransport() {
    // Create a test account or replace with real credentials.
    const transporter = nodemailer.createTransport({
      host: 'invalid.smtp.host', // Intentionally invalid to test fallback
      //host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    return transporter;
  }

  template(html: string, replacements: Record<string, string>) {
    let processedHtml = html;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{${key}}`;
      processedHtml = processedHtml.replace(
        new RegExp(placeholder, 'g'),
        value,
      );
    }
    return processedHtml;
  }

  async sendMail(dto: SendEmailDto) {
    const {
      userId,
      from,
      recipients,
      subject,
      html: originalHtml,
      placeholdersReplacements,
    } = dto;

    console.log('[DEBUG] sendMail() received userId:', userId);

    // ✅ Enforce quota before sending
    try {
      this.usersService.incrementEmailsSent(userId);
    } catch (err: unknown) {
      let message = 'Unknown error';

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }

      console.error('[Mailer] 🚫 Email quota error:', message);

      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    const html = placeholdersReplacements
      ? this.template(originalHtml, placeholdersReplacements)
      : originalHtml;

    const primaryTransport = this.mailTransport();
    const secondaryTransport = this.secondaryMailTransport();

    const options: Mail.Options = {
      from: from ?? {
        name: this.configService.get<string>('APP_NAME') || 'Mailer Service',
        address:
          this.configService.get<string>('DEFAULT_MAIL_FROM') ||
          'no-reply@example.com',
      },
      to: recipients,
      subject,
      html,
    };

    try {
      const result = await primaryTransport.sendMail(options);
      console.log(`[Mailer] ✅ Email sent successfully using PRIMARY service.`);
      return {
        message: 'Email sent successfully.',
        provider: 'primary',
        result,
      };
    } catch (primaryError: unknown) {
      const error = primaryError as Error;
      console.error('[Mailer] ❌ Primary mail service failed:', error.message);

      console.log(
        '[Mailer] 🧚🏻 Waiting for the secondary service to take over...',
      );
      try {
        const fallbackResult = await secondaryTransport.sendMail(options);
        console.log(
          `[Mailer] ✅ Email sent successfully using SECONDARY service.`,
        );
        return {
          message: 'Email sent successfully (via fallback).',
          provider: 'secondary',
          result: fallbackResult,
        };
      } catch (secondaryError: unknown) {
        const fallbackErr = secondaryError as Error;
        console.error(
          '[Mailer] ❌ Secondary mail service also failed:',
          fallbackErr.message,
        );
        throw new Error('Both primary and secondary email services failed.');
      }
    }
  }

  secondaryMailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SECONDARY_MAIL_HOST'),
      port: this.configService.get<number>('SECONDARY_MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SECONDARY_MAIL_USER'),
        pass: this.configService.get<string>('SECONDARY_MAIL_PASS'),
      },
    });

    return transporter;
  }
}
