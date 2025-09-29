import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return all users without password', () => {
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
        { id: 2, email: 'b', password: 'pw', role: 'ADMIN', emailsSent: 0 },
      ];
      const users = service.findAll();
      expect(users.length).toBe(2);
      // password should not be present in returned user
      expect('password' in users[0]).toBe(false);
    });
    it('should filter by role', () => {
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
        { id: 2, email: 'b', password: 'pw', role: 'ADMIN', emailsSent: 0 },
      ];
      const users = service.findAll('ADMIN');
      expect(users.length).toBe(1);
      expect(users[0].role).toBe('ADMIN');
    });
    it('should throw if no users with role', () => {
      service['users'] = [];
      expect(() => service.findAll('ADMIN')).toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return user without password', () => {
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
      ];
      const user = service.findOne(1);
      expect(user.id).toBe(1);
      expect('password' in user).toBe(false);
    });
    it('should throw if not found', () => {
      service['users'] = [];
      expect(() => service.findOne(1)).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user with hashed password and increment id', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
      ];
      const dto: CreateUserDto = {
        email: 'b',
        password: 'pw',
        role: 'USER',
      } as CreateUserDto;
      const user = await service.create(dto);
      expect(user.id).toBe(2);
      expect(user.password).toBe('hashed');
      expect(user.emailsSent).toBe(0);
    });
    it('should start id at 1 if no users', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      service['users'] = [];
      const dto: CreateUserDto = {
        email: 'b',
        password: 'pw',
        role: 'USER',
      } as CreateUserDto;
      const user = await service.create(dto);
      expect(user.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update user fields', () => {
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
      ];
      const dto: UpdateUserDto = { email: 'updated' } as UpdateUserDto;
      const user = service.update(1, dto);
      expect(user.email).toBe('updated');
    });
  });

  describe('delete', () => {
    it('should remove user', () => {
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
      ];
      const removed = service.delete(1);
      expect(removed.id).toBe(1);
      expect(service['users'].length).toBe(0);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', () => {
      service['users'] = [
        { id: 1, email: 'a', password: 'pw', role: 'USER', emailsSent: 0 },
      ];
      const user = service.findByEmail('a');
      expect(user).toBeDefined();
    });
    it('should return undefined if not found', () => {
      service['users'] = [];
      const user = service.findByEmail('a');
      expect(user).toBeUndefined();
    });
  });

  describe('incrementEmailsSent', () => {
    it('should reset emailsSent if new day', () => {
      service['users'] = [
        {
          id: 1,
          email: 'a',
          password: 'pw',
          role: 'USER',
          emailsSent: 2,
          lastEmailSentDate: '2025-09-16',
        },
      ];
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue('2025-09-17T00:00:00.000Z');
      service.incrementEmailsSent(1);
      expect(service['users'][0].emailsSent).toBe(1);
      expect(service['users'][0].lastEmailSentDate).toBe('2025-09-17');
    });
    it('should increment emailsSent if under quota', () => {
      service['users'] = [
        {
          id: 1,
          email: 'a',
          password: 'pw',
          role: 'USER',
          emailsSent: 1,
          lastEmailSentDate: '2025-09-17',
        },
      ];
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue('2025-09-17T00:00:00.000Z');
      service.incrementEmailsSent(1);
      expect(service['users'][0].emailsSent).toBe(2);
    });
    it('should throw if over quota', () => {
      service['users'] = [
        {
          id: 1,
          email: 'a',
          password: 'pw',
          role: 'USER',
          emailsSent: 3,
          lastEmailSentDate: '2025-09-17',
        },
      ];
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue('2025-09-17T00:00:00.000Z');
      expect(() => service.incrementEmailsSent(1)).toThrow(BadRequestException);
    });
    it('should not throw if user not found (just logs)', () => {
      service['users'] = [];
      expect(() => service.incrementEmailsSent(1)).not.toThrow();
    });
  });
});
