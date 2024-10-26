import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import authRoute from "./routes/authRoute";
import authMiddleware from "./middlewares/authMiddleware";
import notificationRoute from "./routes/notificationRoute";
import walletRoute from "./routes/walletRoute";
import transactionRoute from "./routes/transactionRoute";


const app = express();
const server = http.createServer(app); // Créer un serveur HTTP
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Change ceci selon ton domaine
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/notification", notificationRoute);

app.get("/", authMiddleware, (req: Request, res: Response) => {
  res.send("Bienvenue dans notre api wave");
});

// Gérer les connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Événement pour rejoindre une salle spécifique
  socket.on('join', (userId: string) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use("/api/transaction", transactionRoute);

app.use("/api/wallet", walletRoute);

app.get("/", (req: Request, res: Response) => {
    res.send("Bienvenue dans notre api wave");
})

export { server, io };

export default app;