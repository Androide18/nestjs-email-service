Email Service challenge with NestJS

# NestJS Email Service Challenge using NESTJS

This repository contains a service that sends emails using two different SMTP providers with a failover mechanism.
If the primary SMTP provider fails, the service automatically switches to a secondary provider to ensure email delivery.

## Overview

The goal of this challenge is to build a robust email service using NestJS that can send emails
through multiple providers. The service should be able to handle failures gracefully and provide
a seamless experience for users.

## Technologies used:

- NestJS
- TypeScript
- Nodemailer
- Mailtrap (Primary SMTP)
- SparkPost (Secondary SMTP)
- JWT Authentication
- dotenv for environment variable management
- Jest for testing
- Swagger for API documentation

## Features

- Send emails using a RESTful API
- JWT authentication for secure access
- Environment variable management with dotenv
- Unit tests with Jest
- Role-based access control (RBAC) for user management
- Fallback to secondary SMTP server if the primary fails
- Input validation with class-validator
- Comprehensive error handling
- API documentation with Swagger