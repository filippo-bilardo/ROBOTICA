/**
 * Module 15 - Modern JavaScript Integration
 * Example 04: Node.js Functional API with Express
 * 
 * This example demonstrates building a RESTful API using functional programming
 * principles with Express.js, including pure functions, composition, and middleware.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Utility functions for functional programming
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

// Functional utilities for async operations
const asyncPipe = (...fns) => (value) => fns.reduce(async (acc, fn) => fn(await acc), value);
const tryCatch = (fn) => async (...args) => {
    try {
        return { success: true, data: await fn(...args) };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Data transformation functions
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name?.trim(),
    email: user.email?.toLowerCase().trim(),
    createdAt: user.createdAt || new Date().toISOString()
});

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateName = (name) => name && name.trim().length >= 2;

const validateUser = (user) => {
    const errors = [];
    
    if (!validateName(user.name)) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!validateEmail(user.email)) {
        errors.push('Invalid email format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Higher-order functions for middleware
const withLogging = (handler) => async (req, res, next) => {
    const start = Date.now();
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    
    try {
        await handler(req, res, next);
    } finally {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${duration}ms`);
    }
};

const withErrorHandling = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

const withValidation = (validator) => (handler) => async (req, res, next) => {
    const validation = validator(req.body);
    
    if (!validation.isValid) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.errors
        });
    }
    
    req.validatedData = req.body;
    await handler(req, res, next);
};

// Response builders using functional composition
const buildSuccessResponse = (data, message = 'Success') => ({
    success: true,
    message,
    data
});

const buildErrorResponse = (error, statusCode = 400) => ({
    success: false,
    error: typeof error === 'string' ? error : error.message,
    statusCode
});

const sendResponse = curry((res, response) => {
    const statusCode = response.statusCode || (response.success ? 200 : 400);
    return res.status(statusCode).json(response);
});

// Data layer with functional patterns
class UserRepository {
    constructor() {
        this.users = new Map();
        this.nextId = 1;
    }

    findAll = () => Array.from(this.users.values());
    
    findById = (id) => this.users.get(parseInt(id));
    
    findByEmail = (email) => 
        this.findAll().find(user => user.email === email.toLowerCase());
    
    create = (userData) => {
        const user = {
            id: this.nextId++,
            ...sanitizeUser(userData),
            createdAt: new Date().toISOString()
        };
        this.users.set(user.id, user);
        return user;
    };
    
    update = (id, userData) => {
        const existingUser = this.findById(id);
        if (!existingUser) return null;
        
        const updatedUser = {
            ...existingUser,
            ...sanitizeUser(userData),
            updatedAt: new Date().toISOString()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    };
    
    delete = (id) => {
        const user = this.findById(id);
        if (user) {
            this.users.delete(id);
            return user;
        }
        return null;
    };
}

// Service layer with functional patterns
const createUserService = (repository) => ({
    getAllUsers: tryCatch(async () => repository.findAll()),
    
    getUserById: tryCatch(async (id) => {
        const user = repository.findById(id);
        if (!user) throw new Error('User not found');
        return user;
    }),
    
    createUser: tryCatch(async (userData) => {
        // Check if email already exists
        const existingUser = repository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        
        return repository.create(userData);
    }),
    
    updateUser: tryCatch(async (id, userData) => {
        const updatedUser = repository.update(id, userData);
        if (!updatedUser) throw new Error('User not found');
        return updatedUser;
    }),
    
    deleteUser: tryCatch(async (id) => {
        const deletedUser = repository.delete(id);
        if (!deletedUser) throw new Error('User not found');
        return deletedUser;
    })
});

// Controller functions using functional composition
const createUserController = (userService) => {
    const handleServiceResult = curry((successMessage, req, res) => 
        (result) => {
            if (result.success) {
                return sendResponse(res, buildSuccessResponse(result.data, successMessage));
            } else {
                return sendResponse(res, buildErrorResponse(result.error, 400));
            }
        }
    );

    return {
        getAllUsers: compose(
            withErrorHandling,
            withLogging
        )(async (req, res) => {
            const result = await userService.getAllUsers();
            handleServiceResult('Users retrieved successfully', req, res)(result);
        }),

        getUserById: compose(
            withErrorHandling,
            withLogging
        )(async (req, res) => {
            const { id } = req.params;
            const result = await userService.getUserById(parseInt(id));
            handleServiceResult('User retrieved successfully', req, res)(result);
        }),

        createUser: compose(
            withErrorHandling,
            withLogging,
            withValidation(validateUser)
        )(async (req, res) => {
            const result = await userService.createUser(req.validatedData);
            handleServiceResult('User created successfully', req, res)(result);
        }),

        updateUser: compose(
            withErrorHandling,
            withLogging,
            withValidation(validateUser)
        )(async (req, res) => {
            const { id } = req.params;
            const result = await userService.updateUser(parseInt(id), req.validatedData);
            handleServiceResult('User updated successfully', req, res)(result);
        }),

        deleteUser: compose(
            withErrorHandling,
            withLogging
        )(async (req, res) => {
            const { id } = req.params;
            const result = await userService.deleteUser(parseInt(id));
            handleServiceResult('User deleted successfully', req, res)(result);
        })
    };
};

// Functional middleware composition
const createMiddleware = () => [
    helmet(), // Security headers
    cors(), // CORS support
    express.json({ limit: '10mb' }), // JSON parsing
    express.urlencoded({ extended: true }), // URL encoding
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP'
    })
];

// Route configuration using functional patterns
const createRoutes = (controller) => {
    const router = express.Router();
    
    // Define routes with their handlers
    const routes = [
        { method: 'get', path: '/', handler: controller.getAllUsers },
        { method: 'get', path: '/:id', handler: controller.getUserById },
        { method: 'post', path: '/', handler: controller.createUser },
        { method: 'put', path: '/:id', handler: controller.updateUser },
        { method: 'delete', path: '/:id', handler: controller.deleteUser }
    ];
    
    // Apply routes to router
    routes.forEach(({ method, path, handler }) => {
        router[method](path, handler);
    });
    
    return router;
};

// Application factory function
const createApp = () => {
    const app = express();
    
    // Initialize dependencies
    const userRepository = new UserRepository();
    const userService = createUserService(userRepository);
    const userController = createUserController(userService);
    
    // Apply middleware
    createMiddleware().forEach(middleware => app.use(middleware));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    
    // API routes
    app.use('/api/users', createRoutes(userController));
    
    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl
        });
    });
    
    // Global error handler
    app.use((error, req, res, next) => {
        console.error('Global error handler:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    });
    
    return app;
};

// Testing utilities using functional patterns
const createTestHelpers = (app) => {
    const request = require('supertest');
    
    return {
        testEndpoint: curry((method, path, expectedStatus = 200) => 
            async (data = null) => {
                const req = request(app)[method](path);
                if (data) req.send(data);
                return req.expect(expectedStatus);
            }
        ),
        
        createTestUser: () => ({
            name: 'Test User',
            email: 'test@example.com'
        }),
        
        runTestSuite: async () => {
            const testUser = createTestUser();
            const testGet = testEndpoint('get');
            const testPost = testEndpoint('post');
            const testPut = testEndpoint('put');
            const testDelete = testEndpoint('delete');
            
            console.log('Running test suite...');
            
            // Test GET /api/users
            await testGet('/api/users')(null);
            console.log('✓ GET /api/users');
            
            // Test POST /api/users
            const createResponse = await testPost('/api/users', 201)(testUser);
            const createdUser = createResponse.body.data;
            console.log('✓ POST /api/users');
            
            // Test GET /api/users/:id
            await testGet(`/api/users/${createdUser.id}`)(null);
            console.log('✓ GET /api/users/:id');
            
            // Test PUT /api/users/:id
            await testPut(`/api/users/${createdUser.id}`)({
                ...testUser,
                name: 'Updated Test User'
            });
            console.log('✓ PUT /api/users/:id');
            
            // Test DELETE /api/users/:id
            await testDelete(`/api/users/${createdUser.id}`)(null);
            console.log('✓ DELETE /api/users/:id');
            
            console.log('All tests passed!');
        }
    };
};

// Server startup function
const startServer = (app, port = process.env.PORT || 3000) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log(`Server running on port ${port}`);
                console.log(`Health check: http://localhost:${port}/health`);
                console.log(`API endpoint: http://localhost:${port}/api/users`);
                resolve(server);
            }
        });
    });
};

// Main execution
const main = async () => {
    try {
        const app = createApp();
        
        // Start server
        const server = await startServer(app);
        
        // Setup graceful shutdown
        const gracefulShutdown = () => {
            console.log('Received shutdown signal, closing server...');
            server.close((error) => {
                if (error) {
                    console.error('Error during shutdown:', error);
                    process.exit(1);
                } else {
                    console.log('Server closed successfully');
                    process.exit(0);
                }
            });
        };
        
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
        // Run tests if in test mode
        if (process.env.NODE_ENV === 'test') {
            const testHelpers = createTestHelpers(app);
            setTimeout(async () => {
                try {
                    await testHelpers.runTestSuite();
                } catch (error) {
                    console.error('Test suite failed:', error);
                }
            }, 1000);
        }
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Export for testing and module usage
module.exports = {
    createApp,
    createUserService,
    createUserController,
    UserRepository,
    validateUser,
    sanitizeUser,
    createTestHelpers,
    pipe,
    compose,
    curry,
    tryCatch,
    withLogging,
    withErrorHandling,
    withValidation
};

// Start server if this file is run directly
if (require.main === module) {
    main();
}

// Example package.json scripts for this application:
/*
{
  "scripts": {
    "start": "node 04-NodeJSFunctionalAPI.js",
    "dev": "nodemon 04-NodeJSFunctionalAPI.js",
    "test": "NODE_ENV=test node 04-NodeJSFunctionalAPI.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^5.1.0",
    "express-rate-limit": "^6.3.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.16",
    "supertest": "^6.2.3"
  }
}
*/

// Example usage and API documentation:
/*
# User API Documentation

## Endpoints

### GET /api/users
Get all users
Response: { success: true, data: User[] }

### GET /api/users/:id
Get user by ID
Response: { success: true, data: User }

### POST /api/users
Create new user
Body: { name: string, email: string }
Response: { success: true, data: User }

### PUT /api/users/:id
Update user
Body: { name?: string, email?: string }
Response: { success: true, data: User }

### DELETE /api/users/:id
Delete user
Response: { success: true, data: User }

## User Schema
{
  id: number,
  name: string,
  email: string,
  createdAt: string,
  updatedAt?: string
}

## Example Usage
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
*/
