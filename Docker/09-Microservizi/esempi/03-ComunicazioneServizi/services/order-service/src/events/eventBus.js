const redis = require('redis');

class EventBus {
  constructor(redisUrl) {
    this.redisUrl = redisUrl;
    this.publisher = null;
    this.subscriber = null;
    this.eventHandlers = new Map();
  }

  async connect() {
    try {
      // Create publisher client
      this.publisher = redis.createClient({ url: this.redisUrl });
      await this.publisher.connect();

      // Create subscriber client
      this.subscriber = redis.createClient({ url: this.redisUrl });
      await this.subscriber.connect();

      console.log('📡 Connected to Redis Event Bus');
    } catch (error) {
      console.error('❌ Redis Event Bus connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.publisher) await this.publisher.quit();
    if (this.subscriber) await this.subscriber.quit();
    console.log('📡 Disconnected from Redis Event Bus');
  }

  async ping() {
    try {
      await this.publisher.ping();
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  async publish(eventType, data) {
    try {
      const event = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        service: 'order-service'
      };

      // Publish to Redis Stream
      await this.publisher.xAdd('events', '*', event);
      
      // Also publish to regular pub/sub for real-time subscribers
      await this.publisher.publish(`event:${eventType}`, JSON.stringify(event));
      
      console.log(`📤 Published event: ${eventType}`, { eventId: event.id });
    } catch (error) {
      console.error(`❌ Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }

  async subscribe(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
    
    // Subscribe to pattern for this event type
    await this.subscriber.pSubscribe(`event:${eventType}`, (message, channel) => {
      try {
        const event = JSON.parse(message);
        console.log(`📥 Received event: ${eventType}`, { eventId: event.id });
        handler(event);
      } catch (error) {
        console.error(`❌ Error processing event ${eventType}:`, error);
      }
    });
  }

  async subscribeToStream(streamName = 'events', consumerGroup = 'order-service') {
    try {
      // Create consumer group if it doesn't exist
      try {
        await this.subscriber.xGroupCreate(streamName, consumerGroup, '0', {
          MKSTREAM: true
        });
      } catch (error) {
        // Group might already exist
        if (!error.message.includes('BUSYGROUP')) {
          throw error;
        }
      }

      // Start consuming from stream
      const consumeEvents = async () => {
        try {
          const results = await this.subscriber.xReadGroup(
            consumerGroup,
            'order-service-consumer',
            [{ key: streamName, id: '>' }],
            { COUNT: 10, BLOCK: 1000 }
          );

          if (results && results.length > 0) {
            for (const result of results) {
              for (const message of result.messages) {
                await this.processStreamEvent(message);
                
                // Acknowledge message
                await this.subscriber.xAck(streamName, consumerGroup, message.id);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error consuming events from stream:', error);
        }

        // Continue consuming
        setImmediate(consumeEvents);
      };

      consumeEvents();
      console.log(`📥 Started consuming from stream: ${streamName}`);
    } catch (error) {
      console.error('❌ Error setting up stream consumer:', error);
      throw error;
    }
  }

  async processStreamEvent(message) {
    try {
      const eventType = message.message.type;
      const handler = this.eventHandlers.get(eventType);
      
      if (handler) {
        const event = {
          id: message.id,
          type: eventType,
          data: JSON.parse(message.message.data),
          timestamp: message.message.timestamp,
          service: message.message.service
        };
        
        await handler(event);
        console.log(`✅ Processed stream event: ${eventType}`, { eventId: event.id });
      }
    } catch (error) {
      console.error('❌ Error processing stream event:', error);
    }
  }

  // Event handler registration
  on(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
  }

  // Remove event handler
  off(eventType) {
    this.eventHandlers.delete(eventType);
  }
}

module.exports = EventBus;
