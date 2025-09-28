const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "Auth Service API",
        description: "Automatically generated Swagger Docs",
        version: "1.0.0"
    },
    host: "localhost:5001",
    schemes: ["http"]
}

const outputFile = "./swagger-output.json";

const endpointFiles = ["./routes/auth.router.ts"];

swaggerAutogen()(outputFile, endpointFiles, doc);


