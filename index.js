import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Route file
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(routes);

app.get("/", (req, resp) => resp.send("Hey Everyone"));

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
