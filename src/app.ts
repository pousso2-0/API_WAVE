// src/app.ts
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import authRoute from "./routes/authRoute";
import authMiddleware from "./middlewares/authMiddleware";
import contactRoutes from './routes/contactRoute';
import googleAuthRoute from "./routes/googleAuthRoute";



const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use('/api/contacts', contactRoutes);
app.use('/api/google', googleAuthRoute);






app.get("/", (req: Request, res: Response) => {
    res.send("Bienvenue dans notre api wave");
})


export default app;