import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

async function resetAdminPassword() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>('UserRepository');

  try {
    const user = await userRepository.findOne({
      where: { username: 'admin' }
    });

    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('Run: npm run create-admin to create the admin user.');
      await app.close();
      return;
    }

    // Reset to default password
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.refresh_token = null; // Invalidate existing sessions
    await userRepository.save(user);

    console.log('✅ Admin password reset successfully!');
    console.log('=====================================');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('Email:', user.email);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Please change this password after login!');
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await app.close();
  }
}

resetAdminPassword();
