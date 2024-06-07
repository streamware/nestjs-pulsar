![nestjs-apache-pulsar](assets/nestjs-apache-pulsar.png?raw=true)

## NestJS Apache Pulsar
A robust and easy-to-use NestJS module for integrating with Apache Pulsar, enabling efficient message streaming and pub-sub capabilities.

The NestJS Apache Pulsar package provides seamless integration with Apache Pulsar, empowering your NestJS applications with advanced messaging and event streaming capabilities. Leverage the power of Apache Pulsar's multi-topic messaging, high-throughput, and low-latency features directly within your NestJS ecosystem.

### Features
- 🚀 Easy Integration: Quickly integrate Apache Pulsar with your NestJS application using this module.
- 📬 Publisher and Subscriber Support: Effortlessly publish and subscribe to topics within your NestJS services.
- 📈 Scalability: Harness the scalability of Apache Pulsar to handle high volumes of messages.
- ⚙️ Flexible Configuration: Easily configure connection settings, authentication, and other parameters.
- 🛡️ Typed Interfaces: Utilize TypeScript's strong typing to ensure type safety and better developer experience.
- 🔄 Asynchronous Message Processing: Benefit from non-blocking, asynchronous message handling.

## Installing Nestjs Pulsar

```
npm i @nestjs/config @streamware/nestjs-pulsar
```

```
yarn add @nestjs/config @streamware/nestjs-pulsar
```

## Usage

We'll first start off with creating message topic enum, topics.enum.ts

```
export enum Topics {
  USER_CREATED,
  ...
}
```

next we want to produce message with created topic, now we inject **PulsarProducerService** into our AppService

```
import { Injectable } from '@nestjs/common';
import { PulsarProducerService } from './pulsar/pulsar-producer.service';
import { Topics } from './topics.enum.ts';

@Injectable()
export class AppService {
  constructor(private readonly pulsarProducerService: PulsarProducerService) {}

  async sendMessage(request: any) {
    for (let i = 0; i <= 5; i++) {
      await this.pulsarProducerService.produce(Topics.USER_CREATED, request);
    }
  }
}
```

for consuming messages from pulsar you have to implement **Consumer** like so

```
import { Inject, Injectable } from '@nestjs/common';
import { PULSAR_CLIENT, PulsarConsumer } from '@streamware/nestjs-pulsar';
import { Client } from 'pulsar-client';

@Injectable()
export class AppConsumer extends PulsarConsumer<any> {
  constructor(@Inject(PULSAR_CLIENT) pulsarClient: Client) {
    super(pulsarClient, {
      topic: 'USER_CREATED',
      subscriptionType: 'Shared',
      subscription: 'nestjs-shared',
    });
  }

  protected handleMessage(data: any) {
    this.logger.log('New message in AppConsumer.', data);
  }
}
```