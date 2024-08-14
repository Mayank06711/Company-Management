import { Kafka, AdminConfig, Producer, ProducerConfig, KafkaConfig, Admin, ITopicConfig, ConsumerConfig, EachMessagePayload, Message } from "kafkajs";
import { EventData } from "../types/scriptInterfaces";
import { json } from "stream/consumers";

class KafkaManager {
    private kafka: Kafka;
    private admin: Admin;
    private producer: Producer;
    private consumers: Map<string, any> = new Map(); // Track consumers by topic

    constructor(kafkaConfig: KafkaConfig, adminConfig?: AdminConfig) {
        this.kafka = new Kafka(kafkaConfig);
        this.admin = this.kafka.admin(adminConfig);
        this.producer = this.kafka.producer();
    }

    // Connect to Kafka Admin
    async connectAdmin() {
        try {
            console.log('Connecting Kafka admin...');
            await this.admin.connect();
            console.log('Kafka admin connected.');
        } catch (error) {
            console.error('Failed to connect Kafka admin:', error);
        }
    }

    // Disconnect Kafka Admin (Best Practice)
    async disconnectAdmin() {
        try {
            console.log('Disconnecting Kafka admin...');
            await this.admin.disconnect();
            console.log('Kafka admin disconnected.');
        } catch (error) {
            console.error('Failed to disconnect Kafka admin:', error);
        }
    }

    // Create Kafka Topics
    async createTopics(topicConfig: { topic: string; numPartitions: number; replicationFactor: number }[]) {
        try {
            const result = await this.admin.createTopics({
                topics: topicConfig,
                timeout: 30000,
                waitForLeaders: true,
            });

            if (result) {
                console.log('Kafka topics created successfully.');
            } else {
                console.log('Kafka topics were already created.');
            }
        } catch (error) {
            console.error('Failed to create Kafka topics:', error);
        }
    }

    // Delete Kafka Topics
    async deleteTopics(topics: string[]) {
        try {
            console.log('Deleting Kafka topics:', topics);
            await this.admin.deleteTopics({
                topics: topics,
                timeout: 30000,
            });
            console.log('Kafka topics deleted successfully.');
        } catch (error) {
            console.error('Failed to delete Kafka topics:', error);
        }
    }

    async connectProducer() {
        try {
            console.log("Connecting producer...")
            await this.producer.connect();
            console.log("Producer connected successfully connected successfully")
        } catch (error) {
            console.error('Failed to connect Kafka producer:', error);
        }
    }

    async initializeProducer(topic:string, data:EventData){
        try {
          const msg:Message = {
            value:JSON.stringify(data)
          }
          await this.producer.send({
            topic:topic,
            messages:[msg]
          })
          console.log(`Message sent to topic ${topic}`)
        } catch (error) {
            console.log("failed to initialise producer")
        }
    }

    async disconnectProducer(){
        try {
            console.log("Disconnecting producer...")
            await this.producer.disconnect();
            console.log("Producer disconnected successfully")
        } catch (error) {
            console.error('Failed to disconnect Kafka producer:', error);
        }
    }
    // Initialize Kafka Consumer
    async initializeConsumer(topic: string, groupId: string, eachMessageHandler: (payload: EachMessagePayload) => Promise<void>) {
        try {
            const consumerConfig: ConsumerConfig = { groupId: groupId };
            const consumer = this.kafka.consumer(consumerConfig);

            console.log(`Connecting Kafka consumer for topic: ${topic}`);
            await consumer.connect();
            console.log(`Kafka consumer connected for topic: ${topic}`);

            await consumer.subscribe({ topic, fromBeginning: true });
            console.log(`Subscribed to topic ${topic}`);

            await consumer.run({
                eachMessage: async (payload) => {
                    await eachMessageHandler(payload);
                },
            });

            this.consumers.set(topic, consumer); // Save the consumer for later use
        } catch (error) {
            console.error('Failed to initialize Kafka consumer:', error);
        }
    }

    // Disconnect Kafka Consumer
    async disconnectConsumer(topic: string) {
        const consumer = this.consumers.get(topic);
        if (consumer) {
            try {
                console.log(`Disconnecting Kafka consumer for topic: ${topic}`);
                await consumer.disconnect();
                console.log(`Kafka consumer disconnected for topic: ${topic}`);
                this.consumers.delete(topic); // Remove the consumer from the map
            } catch (error) {
                console.error(`Failed to disconnect Kafka consumer for topic: ${topic}`, error);
            }
        } else {
            console.log(`No consumer found for topic: ${topic}`);
        }
    }
}

// Example usage:
const kafkaConfig: KafkaConfig = { clientId: 'user-service', brokers: ['localhost:9092'] };
const kafkaManager = new KafkaManager(kafkaConfig);

export const intit = async () => {
    // Admin operations
    await kafkaManager.connectAdmin();
    await kafkaManager.createTopics([{ topic: 'user-service', numPartitions: 2, replicationFactor: 1 }]);
    await kafkaManager.connectProducer();
    // await kafkaManager.deleteTopics(['user-service']);
    // await kafkaManager.disconnectAdmin();

    // Consumer operations
    const eachMessageHandler = async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        console.log({
            topic,
            partition,
            key: message.key?.toString(),
            value: message.value?.toString(),
        });
    };

    await kafkaManager.initializeConsumer('user-service', 'user-service-group', eachMessageHandler);
    await kafkaManager.disconnectConsumer('user-service');
};

export const produceMessage = async (data:EventData) => {
    await kafkaManager.connectProducer()
    await kafkaManager.initializeProducer('user-service', data );
    await kafkaManager.disconnectConsumer('user-service');
};

export const consumeMessages = async (topic:string, groupId:string) => {  
     // Consumer operations
     const eachMessageHandler = async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        console.log({
            topic,
            partition,
            key: message.key?.toString(),
            value: message.value?.toString(),
        });
    };
    await kafkaManager.initializeConsumer(topic, groupId, eachMessageHandler);
}

export const disconnectKafka = async () => {
    await kafkaManager.disconnectAdmin();
    await kafkaManager.disconnectProducer();
    await kafkaManager.disconnectConsumer('user-service');
}




 /*
Relationship Between Admin and Producer
Admin: The Kafka admin client is responsible for administrative tasks such as creating, deleting, or modifying topics. It ensures that the required topics exist before any messages are produced.

Producer: The Kafka producer sends messages to topics. If the topic doesn’t exist and allowAutoTopicCreation is set to false, the producer will fail unless the topic is created by the admin.

 The admin ensures that topics are correctly set up with the desired number of partitions and replication factors before any producer attempts to send messages to them.

  
Best Practice for Disconnecting Admin:

Always ensure that all operations that require the admin connection (like topic creation/deletion) are completed before calling disconnectAdmin.
Disconnect the admin when you no longer need to perform admin operations to free up resources.
 */