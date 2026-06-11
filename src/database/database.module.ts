import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const sslMode = configService.get<string>('DB_SSL_MODE');
        const caCert = configService.get<string>('DB_CA_CERT');

        const sslConfig = sslMode === 'REQUIRED'
          ? { rejectUnauthorized: true, ca: caCert || undefined }
          : undefined;

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT', '3306')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
          logging: configService.get<string>('DB_LOGGING') === 'true',
          autoLoadEntities: true,
          ...(sslConfig ? { ssl: sslConfig } : {}),
        };
      },
    }),
    UsersModule,
  ],
  providers: [DatabaseInitService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
