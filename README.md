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
We'll first start off with creating message topic enum, topics.enum.ts:

```typescript
export enum Topics {
  USER_CREATED,
  ...
}
```
then create .env file in your root directory:
```
PULSAR_SERVICE_URL=pulsar://localhost:6650
```
and we mount PulsarModule into AppModule:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PulsarModule } from '@streamware/nestjs-pulsar';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PulsarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

next we want to produce message with created topic, now we inject **PulsarProducerService** into our AppService:

```typescript
import { Injectable } from '@nestjs/common';
import { PulsarProducerService } from './pulsar/pulsar-producer.service';
import { Topics } from './topics.enum.ts';

@Injectable()
export class AppService {
  constructor(private readonly pulsarProducerService: PulsarProducerService) {}

  async sendMessage(request: any) {
    for (let i = 0; i <= 5; i++) {
      await this.pulsarProducerService.produce(Topics.USER_CREATED, request, { batchingEnabled: true });
    }
  }
}
```

for consuming messages from pulsar you have to implement **Consumer** (could be another servce to consume message from the other services) like so:

```typescript
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

and in your app.module.ts (or any other):

```typescript
import { Module } from '@nestjs/common';
import { PulsarModule } from '@streamware/nestjs-pulsar';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConsumer } from './app.consumer';

@Module({
  imports: [PulsarModule],
  controllers: [AppController],
  providers: [AppService, AppConsumer],
})
export class AppModule {}
```
### Client Config
see full configurations [here](https://pulsar.apache.org/docs/next/client-libraries-node-configs)

Clinet configurations should be defined in .env:

```
serviceUrl=
authentication=
operationTimeoutSeconds=
ioThreads=
messageListenerThreads=
concurrentLookupRequest=
tlsTrustCertsFilePath=
tlsValidateHostname=
tlsAllowInsecureConnection=
statsIntervalInSeconds=
```
for authentication see [here](https://pulsar.apache.org/docs/next/security-tls-authentication/)

### Producer Config
- producerName: A name for the producer. If you do not explicitly assign a name, Pulsar automatically generates a globally unique name. If you choose to explicitly assign a name, it needs to be unique across all Pulsar clusters, otherwise the creation operation throws an error.
- sendTimeoutMs: When publishing a message to a topic, the producer waits for an acknowledgment from the responsible Pulsar broker. If a message is not acknowledged within the threshold set by this parameter, an error is thrown. If you set sendTimeoutMs to -1, the timeout is set to infinity (and thus removed). Removing the send timeout is recommended when using Pulsar's message de-duplication feature. **(Default: 30000)**
- initialSequenceId: The initial sequence ID of the message. When producer send message, add sequence ID to message. The ID is increased each time to send.	
- maxPendingMessages: The maximum size of the queue holding pending messages (i.e. messages waiting to receive an acknowledgment from the broker). By default, when the queue is full all calls to the send method fails unless blockIfQueueFull is set to true. **(Default: 1000)**
- maxPendingMessagesAcrossPartitions: The maximum size of the sum of partition's pending queue.	**(Default: 50000)**
- blockIfQueueFull: If set to true, the producer's send method waits when the outgoing message queue is full rather than failing and throwing an error (the size of that queue is dictated by the maxPendingMessages parameter); if set to false (the default), send operations fails and throw a error when the queue is full.	**(Default: false)**
- messageRoutingMode: The message routing logic (for producers on partitioned topics). This logic is applied only when no key is set on messages. The available options are: round robin (RoundRobinDistribution), or publishing all messages to a single partition (UseSinglePartition, the default).	**(Default: UseSinglePartition)**
- hashingScheme: The hashing function that determines the partition on which a particular message is published (partitioned topics only). The available options are: JavaStringHash (the equivalent of String.hashCode() in Java), Murmur3_32Hash (applies the Murmur3 hashing function), or BoostHash (applies the hashing function from C++'s Boost library).	**(Default: BootHash)**
- compressionType: The message data compression type used by the producer. The available options are LZ4, and Zlib, ZSTD, SNAPPY.	**(Default: Compression None)**
- batchingEnabled: If set to true, the producer send message as batch. **(Default: true)**
- batchingMaxPublishDelayMs: The maximum time of delay sending message in batching.	 **(Default: 10)**
- batchingMaxMessages: The maximum size of sending message in each time of batching.	**(Default: 1000)**
- properties: The metadata of producer.	

### Consumer Config
- topic: The Pulsar topic on which the consumer establishes a subscription and listen for messages.
- topics: The array of topics.
- topicsPattern: The regular expression for topics.
- subscription: The subscription name for this consumer.	
- subscriptionType: Available options are Exclusive, Shared, Key_Shared, and Failover. **(Default: Exclusive)**
- subscriptionInitialPosition: Initial position at which to set cursor when subscribing to a topic at first time. **(Default: SubscriptionInitialPosition.Latest)**
- ackTimeoutMs: Acknowledge timeout in milliseconds. **(Default: 0)**
- nAckRedeliverTimeoutMs: Delay to wait before redelivering messages that failed to be processed. **(Default: 60000)**
- receiverQueueSize: Sets the size of the consumer's receiver queue, i.e. the number of messages that can be accumulated by the consumer before the application calls receive. A value higher than the default of 1000 could increase consumer throughput, though at the expense of more memory utilization. (Default: 1000)
- receiverQueueSizeAcrossPartitions: Set the max total receiver queue size across partitions. This setting is used to reduce the receiver queue size for individual partitions if the total exceeds this value. **(Default: 50000)**
- consumerName: The name of consumer. Currently(v2.4.1), failover mode use consumer name in ordering.
- properties: The metadata of consumer.
- readCompacted: A consumer only sees the latest value for each key in the compacted topic, up until reaching the point in the topic message when compacting backlog. Beyond that point, send messages as normal.

readCompacted can only be enabled on subscriptions to persistent topics, which have a single active consumer (like failure or exclusive subscriptions).

Attempting to enable it on subscriptions to non-persistent topics or on shared subscriptions leads to a subscription call throwing a PulsarClientException. **(Default: false)**

## License

The code in this repository is licensed under the terms of the [Apache License 2.0](LICENSE).