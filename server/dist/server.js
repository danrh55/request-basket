import "./models/env.js";
import express from "express";
import cors from "cors";
import { Router } from "express";
import { registerHttpRoutes } from './routes/httpRoutes.js';
// import { registerWsRoutes } from "./routes/wsRoutes";
import { connectDBs } from "./models/dbConnection.js";
// import expressWs from "express-ws";
const app = express();
const PORT = 3000;
// const { applyTo } = expressWs(app);
app.use(express.json());
app.use(cors());
// const wsRouter = Router();
// applyTo(wsRouter);
// registerWsRoutes(wsRouter);
// app.use("/", wsRouter)
const httpRouter = Router();
registerHttpRoutes(httpRouter);
app.use("/", httpRouter);
async function main() {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`);
    });
    await connectDBs();
    // ['SIGINT', 'SIGTERM'].forEach(signal => {
    //   process.on(signal, () => {
    //     server.close(() => process.exit(0));
    //   });
    // });
}
main();
export default app;
//# sourceMappingURL=server.js.map