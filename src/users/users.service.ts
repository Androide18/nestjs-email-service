import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './users.interface';

@Injectable()
export class UsersService {
  private readonly DAILY_EMAIL_QUOTA = 3; // Set daily quota
  private users: User[] = [];

  // METHODS
  findAll(role?: 'USER' | 'ADMIN') {
    let filteredUsers = this.users;

    if (role) {
      filteredUsers = this.users.filter((user) => user.role === role);

      if (!filteredUsers.length) {
        throw new NotFoundException(`No users with role ${role} found`);
      }
    }

    // Remove password before returning
    return filteredUsers.map(({ password, ...user }) => user);
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async create(createUserDto: CreateUserDto) {
    // Get users sorted by descending id
    const usersByHighestId = [...this.users].sort((a, b) => b.id - a.id);

    // Calculate the next id (if no users, start at 1)
    const nextId = usersByHighestId.length > 0 ? usersByHighestId[0].id + 1 : 1;

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create the new user object
    const newUser = {
      id: nextId,
      ...createUserDto,
      password: hashedPassword,
      emailsSent: 0, // initialize emailsSent
    };

    // Add to the users array
    this.users.push(newUser);

    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this.users = this.users.map((user) => {
      if (user.id === id) {
        return { ...user, ...updateUserDto };
      }
      return user;
    });

    return this.findOne(id);
  }

  delete(id: number) {
    const removedUser = this.findOne(id);

    this.users = this.users.filter((user) => user.id !== id);

    return removedUser;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  incrementEmailsSent(userId: number) {
    const user = this.users.find((u) => u.id === userId);

    if (!user) {
      console.error(`[UsersService] User with ID ${userId} not found`);
      return;
    }

    const today = new Date().toISOString().split('T')[0]; // e.g.,"2025-09-17"
    console.log('TODAY:', today);
    console.log('LAST EMAIL SENT DATE:', user.lastEmailSentDate);

    if (user.lastEmailSentDate !== today) {
      console.log(`[UsersService] Resetting email count for user ID ${userId}`);
      // Reset counter for new day
      user.emailsSent = 0;
      user.lastEmailSentDate = today;
    }

    if (user.emailsSent >= this.DAILY_EMAIL_QUOTA) {
      console.warn(
        `[UsersService] User ID ${userId} has reached the daily quota (${this.DAILY_EMAIL_QUOTA})`,
      );
      throw new BadRequestException(
        `🚩 You have reached your daily email limit of ${this.DAILY_EMAIL_QUOTA}. Try again tomorrow.`,
      );
    }

    user.emailsSent += 1;
    console.log(
      `[UsersService] Email count for user ID ${userId} is now ${user.emailsSent}`,
    );
  }
}
