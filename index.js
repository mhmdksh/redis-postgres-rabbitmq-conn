require('dotenv').config();
const { Client } = require('pg');
const redis = require('redis');
const amqp = require('amqplib/callback_api');
const express = require('express');
const path = require('path');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const app = express();
let postgresConnected = false;
let redisConnected = false;
let rabbitMQConnected = false;

const connectPostgres = async () => {
    const postgresClient = new Client({
        connectionString: process.env.POSTGRES_URI,
    });

    while (!postgresConnected) {
        try {
            await postgresClient.connect();
            console.log('Connected to PostgreSQL');
            postgresConnected = true;
        } catch (err) {
            console.error('PostgreSQL connection error:', err);
            console.log('Retrying in 5 seconds...');
            await wait(5000);
        }
    }
    return postgresClient;
};

const connectRedis = async () => {
    const redisClient = redis.createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });

    redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    while (!redisConnected) {
        try {
            await redisClient.connect();
            console.log('Connected to Redis');
            redisConnected = true;
        } catch (err) {
            console.log('Retrying in 5 seconds...');
            await wait(5000);
        }
    }
    return redisClient;
};

const connectRabbitMQ = async () => {
    while (!rabbitMQConnected) {
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
        } catch (err) {
            console.error('RabbitMQ connection error:', err);
            console.log('Retrying in 5 seconds...');
            await wait(5000);
        }
    }
};

const startApp = async () => {
    try {
        const tasks = [];
        
        if (process.env.ENABLE_REDIS === 'true') {
            tasks.push(connectRedis());
        }
        if (process.env.ENABLE_RABBITMQ === 'true') {
            tasks.push(connectRabbitMQ());
        }
        if (process.env.ENABLE_POSTGRES === 'true') {
            tasks.push(connectPostgres());
        }

        await Promise.all(tasks);
        
        console.log('Current Connection Status:');
        console.log(`PostgreSQL: ${postgresConnected ? 'Connected' : 'Pending'}`);
        console.log(`Redis: ${redisConnected ? 'Connected' : 'Pending'}`);
        console.log(`RabbitMQ: ${rabbitMQConnected ? 'Connected' : 'Pending'}`);

        app.listen(8080, () => {
            console.log('Server is running on port 8080');
        });
    } catch (err) {
        console.error('Error starting the application:', err);
    }
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const status = {
        postgres: postgresConnected,
        redis: redisConnected,
        rabbitmq: rabbitMQConnected,
    };
    res.send(`
        <html>
        <head>
            <title>Service Connection Status</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; }
                .service { margin: 10px; padding: 10px; border: 1px solid #ccc; display: inline-block; width: 200px; }
                .connected { background-color: #c8e6c9; }
                .pending { background-color: #ffccbc; }
            </style>
        </head>
        <body>
            <h1>Service Connection Status</h1>
            <div class="service ${status.postgres ? 'connected' : 'pending'}">
                <h2>PostgreSQL</h2>
                <p>${status.postgres ? '🟢 Connected' : '🔴 Pending'}</p>
            </div>
            <div class="service ${status.redis ? 'connected' : 'pending'}">
                <h2>Redis</h2>
                <p>${status.redis ? '🟢 Connected' : '🔴 Pending'}</p>
            </div>
            <div class="service ${status.rabbitmq ? 'connected' : 'pending'}">
                <h2>RabbitMQ</h2>
                <p>${status.rabbitmq ? '🟢 Connected' : '🔴 Pending'}</p>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    if (postgresConnected && redisConnected && rabbitMQConnected) {
        res.status(200).send('OK');
    } else {
        res.status(500).send('Not all apps are connected yet.');
    }
});

startApp();

