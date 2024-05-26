import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PULSAR_CLIENT } from './pulsar.constants';
import { Client } from 'pulsar-client';

@Injectable()
export class PulsarClientService implements OnModuleDestroy {
  constructor(@Inject(PULSAR_CLIENT) private readonly pulsarClient: Client) {}

  async onModuleDestroy() {
    await this.pulsarClient.close();
  }
}
