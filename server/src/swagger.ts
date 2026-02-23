import swaggerJsdoc from "swagger-jsdoc";

const isProd = process.env.NODE_ENV === "production";
const serverUrl = process.env.BASE_URL || "http://localhost:3000";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FreshStart API",
      version: "1.0.0",
      description: "API documentation for FreshStart - a social network for smoking cessation"
    },
    servers: [
      { url: serverUrl }
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