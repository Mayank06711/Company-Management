import { WorkerConfig } from "../types/scriptInterfaces";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config(); // Load .env variables

// Function to reload .env variables
function reloadEnvVariables() {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const key in envConfig) {
        process.env[key] = envConfig[key];
    }
    console.log('Environment variables reloaded:', process.env);
}

// Example of changing the .env file dynamically
function updateEnvVariable(key: string, value: string) {
    const envFilePath = '.env';
    let envFileContent = fs.readFileSync(envFilePath, 'utf8');

    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envFileContent.match(regex)) {
        envFileContent = envFileContent.replace(regex, `${key}=${value}`);
    } else {
        envFileContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envFilePath, envFileContent);
    reloadEnvVariables();
}

export const defaultWorkerConfig: WorkerConfig = {
    redisHost: 'localhost',
    redisPort: 6379,
    queueName: 'notifications',
};

// Function to load configuration from an external source, e.g., environment variables
export function loadWorkerConfig(): WorkerConfig {
    return {
        redisHost: process.env.REDIS_HOST || defaultWorkerConfig.redisHost,
        redisPort: Number(process.env.REDIS_PORT) || defaultWorkerConfig.redisPort,
        queueName: process.env.QUEUE_NAME || defaultWorkerConfig.queueName,
    };
}