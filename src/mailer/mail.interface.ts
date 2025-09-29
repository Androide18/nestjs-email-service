import { Address } from 'nodemailer/lib/mailer';

export type SendEmailDto = {
  userId: number; // <-- Required to track quota
  from?: Address;
  recipients: Address[];
  subject: string;
  text?: string;
  html: string;
  placeholdersReplacements?: Record<string, string>;
};

export interface MailerInterface {
  sendEmail(emailOptions: SendEmailDto): Promise<void>;
}
