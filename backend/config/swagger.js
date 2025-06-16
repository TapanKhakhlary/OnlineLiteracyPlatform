const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Literacy Platform API',
      version: '1.0.0',
      description: 'API documentation for the literacy platform'
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api/v1'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Adjusted to match your structure
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
