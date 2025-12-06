import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NhanVienModule } from './nhan-vien/nhan-vien.module';
import { KhachHangModule } from './khach-hang/khach-hang.module';
import { ChiNhanhModule } from './chi-nhanh/chi-nhanh.module';
import { YTeModule } from './y-te/y-te.module';
import { HoaDonModule } from './hoa-don/hoa-don.module';
import { LichHenModule } from './lich-hen/lich-hen.module';

// Import all entities
import * as Entities from './entities';

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1435,
      username: 'sa',
      password: 'Admin123',
      database: 'PetCareX',
      entities: Object.values(Entities),
      synchronize: false, // Disable auto-sync to prevent constraint errors
      logging: ['error', 'warn'], // Enable logging for debugging
      options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
      },
      extra: {
          trustServerCertificate: true,
      },
  }),
  AuthModule,
  NhanVienModule,
  KhachHangModule,
  ChiNhanhModule,
  YTeModule,
  HoaDonModule,
  LichHenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

