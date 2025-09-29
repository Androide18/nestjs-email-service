import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should throw ForbiddenException if not admin', () => {
      const req = { user: { role: 'USER' } } as unknown as Parameters<
        UsersController['findAll']
      >[0];
      expect(() => {
        controller.findAll(req, undefined);
      }).toThrow(ForbiddenException);
    });
    it('should call usersService.findAll with role if admin', () => {
      const req = { user: { role: 'ADMIN' } } as unknown as Parameters<
        UsersController['findAll']
      >[0];
      (usersService.findAll as jest.Mock).mockReturnValue(['user']);
      const result = controller.findAll(req, 'USER');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findAll as jest.Mock).toHaveBeenCalledWith('USER');
      expect(result).toEqual(['user']);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with id', () => {
      (usersService.findOne as jest.Mock).mockReturnValue({ id: 1 });
      const result = controller.findOne(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findOne as jest.Mock).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('create', () => {
    it('should call usersService.create with dto', () => {
      const dto: CreateUserDto = {
        email: 'a',
        password: 'pw',
        role: 'USER',
      } as CreateUserDto;
      (usersService.create as jest.Mock).mockReturnValue({ id: 1, ...dto });
      const result = controller.create(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create as jest.Mock).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('update', () => {
    it('should call usersService.update with id and dto', () => {
      const dto: UpdateUserDto = { email: 'b' } as UpdateUserDto;
      (usersService.update as jest.Mock).mockReturnValue({ id: 1, ...dto });
      const result = controller.update(1, dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.update as jest.Mock).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('delete', () => {
    it('should call usersService.delete with id', () => {
      (usersService.delete as jest.Mock).mockReturnValue({ id: 1 });
      const result = controller.delete(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.delete as jest.Mock).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
