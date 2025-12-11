import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>('UserRepository');

  try {
    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log('Username: admin');
      console.log('If you forgot the password, please reset it using the forgot password feature.');
      await app.close();
      return;
    }

    // Create admin user
    const adminPassword = 'Admin@123'; // Default password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = userRepository.create({
      email: 'admin@petcarex.com',
      username: 'admin',
      password: hashedPassword,
      full_name: 'System Administrator',
      phone: '0123456789',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      is_active: true,
    });

    await userRepository.save(admin);

    console.log('✅ Admin user created successfully!');
    console.log('=====================================');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('Email: admin@petcarex.com');
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Please change this password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await app.close();
  }
}

createAdminUser();
