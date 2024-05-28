import { Module } from '@nestjs/common';
import { Client } from 'pulsar-client';
import { PULSAR_CLIENT } from './pulsar-client.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PulsarProducerService } from './pulsar-producer.service';
import { PulsarClientService } from './pulsar-client.service';
import pulsarClientConfig from './pulsar-client.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [pulsarClientConfig],
    }),
  ],
  providers: [
    {
      provide: PULSAR_CLIENT,
      useFactory: (configService: ConfigService) =>
        new Client(configService.get('pulsar')),
      inject: [ConfigService],
    },
    PulsarProducerService,
    PulsarClientService,
  ],
  exports: [PulsarProducerService, PULSAR_CLIENT],
})
export class PulsarModule {}
