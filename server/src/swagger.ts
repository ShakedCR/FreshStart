import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FreshStart API",
      version: "1.0.0",
      description: "API documentation for FreshStart - a social network for smoking cessation"
    },
    servers: [
      { url: "http://localhost:3000", description: "Development" },
      { url: "http://node70.cs.colman.ac.il:4000", description: "Production" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/routes/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);