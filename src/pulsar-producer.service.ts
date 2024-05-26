import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PULSAR_CLIENT } from './pulsar.constants';
import { Client, Producer } from 'pulsar-client';

@Injectable()
export class PulsarProducerService implements OnModuleDestroy {
  private readonly producers = new Map<string, Producer>();

  constructor(@Inject(PULSAR_CLIENT) private readonly pulsarClient: Client) {}

  async onModuleDestroy() {
    for (const producer of this.producers.values()) {
      await producer.close();
    }
  }

  async produce(topic: string, message: any) {
    let producer = this.producers.get(topic);
    if (!producer) {
      producer = await this.pulsarClient.createProducer({
        topic,
        batchingEnabled: true,
      });
      this.producers.set(topic, producer);
    }
    await producer.send({
      data: Buffer.from(JSON.stringify(message)),
    });
  }
}
