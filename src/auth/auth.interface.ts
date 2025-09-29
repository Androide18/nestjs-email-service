import { Request } from 'express';
import { User } from '../users/users.interface';

export interface AuthenticatedRequest extends Request {
  user: User;
}
