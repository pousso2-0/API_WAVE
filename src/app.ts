import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import authRoute from "./routes/authRoute";
import authMiddleware from "./middlewares/authMiddleware";
import contactRoutes from './routes/contactRoute';
import googleAuthRoute from "./routes/googleAuthRoute";
import userRoute from "./routes/userRoute";

import notificationRoute from "./routes/notificationRoute";
import walletRoute from "./routes/walletRoute";
import transactionRoute from "./routes/transactionRoute";
import demandeRoute from "./routes/demandeRoute";
import proccessRoute from "./routes/accountJobRoute";
import activeRoute from "./routes/accountActiveRoute";


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
app.use('/api/contacts', contactRoutes);
app.use('/api/google', googleAuthRoute);




app.use("/api/users", userRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/demande", demandeRoute);
app.use("/api/job", proccessRoute);
app.use("/api/active", activeRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/wallet", walletRoute);


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



app.get("/", (req: Request, res: Response) => {
    res.send("Bienvenue dans notre api wave");
})

export { server, io };

export default app;