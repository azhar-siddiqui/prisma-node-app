import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Route file
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.get("/", (req, resp) => resp.send("Hey Everyone"));
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
