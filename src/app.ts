// src/app.ts
import bodyParser from "body-parser";
import express, { Request, Response } from "express";



const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




app.get("/", (req: Request, res: Response) => {
    res.send("Bienvenue dans notre api wave");
})


export default app;
