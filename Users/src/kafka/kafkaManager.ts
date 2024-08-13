import { Kafka, AdminConfig,Producer, ProducerConfig, KafkaConfig, Admin, ITopicConfig,} from "kafkajs";
import { EventData } from "../types/scriptInterfaces";


  class KafkaManager {
    private kafka: Kafka;
    private admin: Admin;
  
    constructor(kafkaConfig: KafkaConfig, adminConfig?: AdminConfig) {
      this.kafka = new Kafka(kafkaConfig);
      this.admin = this.kafka.admin(adminConfig);
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
  
    // Disconnect Kafka Admin
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
  
  
  
}
  
  // Example usage:
  const kafkaConfig: KafkaConfig = { clientId: 'user-service', brokers: ['localhost:9092'] };
  const kafkaManager = new KafkaManager(kafkaConfig);

  
  export const intit = async () => {
    // Step 1: Connect to Kafka admin
    await kafkaManager.connectAdmin();
  
    // Step 2: Create Kafka topics (or ensure they exist)
    await kafkaManager.createTopics([
      { topic: 'user-service', numPartitions: 2, replicationFactor: 1 },
    ]);
  
    // Step 3: Disconnect Kafka admin
    await kafkaManager.disconnectAdmin();
  };
  


  // /*
// Relationship Between Admin and Producer
// Admin: The Kafka admin client is responsible for administrative tasks such as creating, deleting, or modifying topics. It ensures that the required topics exist before any messages are produced.

// Producer: The Kafka producer sends messages to topics. If the topic doesn’t exist and allowAutoTopicCreation is set to false, the producer will fail unless the topic is created by the admin.

// The admin ensures that topics are correctly set up with the desired number of partitions and replication factors before any producer attempts to send messages to them.
// */
 
