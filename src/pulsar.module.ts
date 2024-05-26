import { Module } from '@nestjs/common';
import { Client } from 'pulsar-client';
import { PULSAR_CLIENT } from './pulsar.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PulsarProducerService } from './pulsar-producer.service';
import { PulsarClientService } from './pulsar-client.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PULSAR_CLIENT,
      useFactory: (configService: ConfigService) =>
        new Client({
          serviceUrl: configService.getOrThrow('PULSAR_SERVICE_URL'),
        }),
      inject: [ConfigService],
    },
    PulsarProducerService,
    PulsarClientService,
  ],
  exports: [PulsarProducerService, PULSAR_CLIENT],
})
export class PulsarModule {}
