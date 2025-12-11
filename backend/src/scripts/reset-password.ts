import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

async function resetPassword() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>('UserRepository');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const username = await new Promise<string>((resolve) => {
      rl.question('Enter username to reset password: ', (answer) => {
        resolve(answer);
      });
    });

    const user = await userRepository.findOne({
      where: { username }
    });

    if (!user) {
      console.log('❌ User not found!');
      await app.close();
      rl.close();
      return;
    }

    const newPassword = await new Promise<string>((resolve) => {
      rl.question('Enter new password: ', (answer) => {
        resolve(answer);
      });
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.refresh_token = null; // Invalidate existing sessions
    await userRepository.save(user);

    console.log('✅ Password reset successfully!');
    console.log('Username:', username);
    console.log('New password:', newPassword);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await app.close();
    rl.close();
  }
}

resetPassword();
