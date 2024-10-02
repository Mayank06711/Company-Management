import swaggerJsdoc, { OAS3Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';  // Import Express type

const options: OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Company Management',
      version: '1.0.0',
      description: 'API for company management',
    },
    servers: [
      {
        url: 'http://localhost:9001',
      },
    ],
  },
  apis:  ['src/routes/*.routes.ts'], // Adjust the path accordingly, // Adjust the path if your routes are in TS files
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default swaggerDocs;
