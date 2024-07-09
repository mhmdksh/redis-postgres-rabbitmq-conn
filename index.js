require('dotenv').config();
const { Client } = require('pg');
const redis = require('redis');
const amqp = require('amqplib/callback_api');
const express = require('express');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const app = express();
let postgresConnected = false;
let redisConnected = false;
let rabbitMQConnected = false;

const connectPostgres = async () => {
    while (true) {
        const postgresClient = new Client({
            connectionString: process.env.POSTGRES_URI,
        });

        try {
            await postgresClient.connect();
            console.log('Connected to PostgreSQL');
            postgresConnected = true;
            return postgresClient; // Return the client on successful connection
        } catch (err) {
            console.error('PostgreSQL connection error:', err);
            console.log('Retrying in 5 seconds...');
            await wait(5000);
        }
    }
};

const connectRedis = async () => {
    while (true) {
        const redisClient = redis.createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        });

        redisClient.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        try {
            await redisClient.connect();
            console.log('Connected to Redis');
            redisConnected = true;
            return redisClient; // Return the client on successful connection
        } catch (err) {
            console.log('Retrying in 5 seconds...');
            await wait(5000);
        }
    }
};

const connectRabbitMQ = async () => {
    while (true) {
        try {
            await new Promise((resolve, reject) => {
                amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Connected to RabbitMQ');
                        connection.close();
                        rabbitMQConnected = true;
                        resolve();
                    }
                });
            });
            return; // Exit the loop on successful connection
        } catch (err) {
            console.error('RabbitMQ connection error:', err);
            console.log('Retrying in 5 seconds...');
            await wait(5000);
        }
    }
};

const startApp = async () => {
    await connectRedis();
    console.log('PostgreSQL connection established, moving to RabbitMQ...');
    await connectRabbitMQ();
    console.log('RabbitMQ connection established, moving to Postgres...');
    await connectPostgres();
    console.log('All apps are connected');
};

app.get('/', (req, res) => {
    if (postgresConnected && redisConnected && rabbitMQConnected) {
        res.send('All apps are connected successfully!');
    } else {
        res.send('Not all apps are connected yet.');
    }
});

app.get('/health', (req, res) => {
    if (postgresConnected && redisConnected && rabbitMQConnected) {
        res.status(200).send('OK');
    } else {
        res.status(500).send('Not all apps are connected yet.');
    }
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
    startApp();
});
