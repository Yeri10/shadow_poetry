import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const app = express();
const port = 3000;

app.use(express.static(path.join(dirName, "public")));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running (local): http://localhost:${port}`);
});
