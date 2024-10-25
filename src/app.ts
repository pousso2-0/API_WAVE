// src/app.ts
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import authRoute from "./routes/authRoute";



const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);

app.use("/api/transaction", transactionRoute);

app.use("/api/wallet", walletRoute);

app.get("/", (req: Request, res: Response) => {
    res.send("Bienvenue dans notre api wave");
})


export default app;
