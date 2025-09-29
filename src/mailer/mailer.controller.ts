import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './mail.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/auth.interface';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send-email')
  async sendMail(
    @Request() req: AuthenticatedRequest,
    @Body() body: Record<string, string>,
  ) {
    const user = req.user; // the logged-in user info from JWT

    console.log('[DEBUG] user:', user);

    const dto: SendEmailDto = {
      userId: user.id, // <-- track quota
      from: {
        name: user.firstname + ' ' + user.lastname || 'No Name',
        address: user.email,
      },
      recipients: [
        {
          name: 'Juancito Doe',
          address: 'juancito@example.com',
        },
      ],
      subject: 'Test Email from NestJS Mailer Service',
      html: '<h1>Hello {name}!, this is a test email from NestJS Mailer Service</h1>',
      placeholdersReplacements: body,
    };

    return await this.mailerService.sendMail(dto);
  }
}
