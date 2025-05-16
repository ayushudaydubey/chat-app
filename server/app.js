// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const port = 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Home Page");
});

let registeredUsers = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register-user", (username) => {
    socket.username = username;
    if (!registeredUsers.includes(username)) {
      registeredUsers.push(username);
    }
    console.log(`Registered user: ${username}`);
    io.emit("update-users", registeredUsers);
  });

  socket.on("private-message", ({ fromUser, toUser, message }) => {
    for (let [id, sock] of io.of("/").sockets) {
      if (sock.username === toUser) {
        sock.emit("receive-private", { fromUser, toUser, message });
        console.log(`Private message from ${fromUser} to ${toUser}: ${message}`);
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username}`);
    registeredUsers = registeredUsers.filter(user => user !== socket.username);
    io.emit("update-users", registeredUsers);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
