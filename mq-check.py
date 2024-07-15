import pika
import ssl

# Set up SSL context and disable certificate verification
context = ssl.create_default_context()
context.check_hostname = False
context.verify_mode = ssl.CERT_NONE

# Parse the URL for individual components
url = 'amqps://staging0mq0user:Gyw8b9KrmEccIWAk@b-f4513f14-a7e8-4eb4-a330-ddd73c959a9c.mq.eu-central-1.amazonaws.com:5671'
parameters = pika.URLParameters(url)

# Manually create connection parameters including SSL options
connection_params = pika.ConnectionParameters(
    host='b-f4513f14-a7e8-4eb4-a330-ddd73c959a9c.mq.eu-central-1.amazonaws.com',
    port=5671,
    credentials=pika.PlainCredentials('staging0mq0user', 'Gyw8b9KrmEccIWAk'),
    ssl_options=pika.SSLOptions(context)
)

# Connect to RabbitMQ using SSL/TLS without certificate verification
try:
    connection = pika.BlockingConnection(connection_params)
    channel = connection.channel()

    # Declare a queue to send/receive messages
    channel.queue_declare(queue='test_queue')

    # Publish a message
    channel.basic_publish(exchange='', routing_key='test_queue', body='Hello RabbitMQ!')

    print(" [x] Sent 'Hello RabbitMQ!'")

    # Close the connection
    connection.close()
except pika.exceptions.ProbableAuthenticationError as e:
    print(f"Authentication failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")