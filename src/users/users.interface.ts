export interface User {
  id: number;
  firstname?: string;
  lastname?: string;
  email: string;
  password: string;
  emailsSent: number;
  lastEmailSentDate?: string;
  role: 'USER' | 'ADMIN';
}

export type UserWithoutPassword = Omit<User, 'password'>;
