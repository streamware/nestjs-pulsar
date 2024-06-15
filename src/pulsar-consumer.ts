import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { nextTick } from 'process';
import { Client, Consumer, ConsumerConfig, Message } from 'pulsar-client';

export abstract class PulsarConsumer<T>
  implements OnModuleInit, OnModuleDestroy
{
  private consumer: Consumer;

  protected readonly logger = new Logger(this.config.topic);

  protected running = true;

  constructor(
    private readonly pulsarClient: Client,
    private readonly config: ConsumerConfig,
  ) {}

  async onModuleDestroy() {
    this.running = false;
    await this.consumer.close();
  }

  async onModuleInit() {
    await this.connect();
  }

  protected async connect() {
    this.consumer = await this.pulsarClient.subscribe(this.config);
    nextTick(this.consume.bind(this));
  }

  private async consume() {
    while (this.running) {
      try {
        const messages = await this.consumer.batchReceive();
        await Promise.allSettled(
          messages.map((message) => this.receive(message)),
        );
      } catch (err) {
        this.logger.error('Error receiving batch.', err);
      }
    }
  }

  private async receive(message: Message) {
    try {
      const data: T = JSON.parse(message.getData().toString());
      this.handleMessage(data);
    } catch (err) {
      this.logger.error('Error consuming.', err);
    }

    try {
      await this.consumer.acknowledge(message);
    } catch (err) {
      this.logger.error('Error acking.', err);
    }
  }

  protected abstract handleMessage(data: T): void;
}
