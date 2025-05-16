import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
const port = 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Home Page");
});

//  Store list of registered usernames
let registeredUsers = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  //  Register username and broadcast updated user list
  socket.on("register-user", (username) => {
    socket.username = username;
    if (!registeredUsers.includes(username)) {
      registeredUsers.push(username);
    }
    console.log(`Registered user: ${username}`);
    io.emit("update-users", registeredUsers);
  });

  //  Private messaging by finding recipient socket
  socket.on("private-message", ({ fromUser, toUser, message }) => {
    for (let [id, sock] of io.of("/").sockets) {
      if (sock.username === toUser) {
        sock.emit("receive-private", { fromUser, message });
        console.log(`Private message from ${fromUser} to ${toUser}: ${message}`);
        break;
      }
    }
  });

  //  Handle disconnection and update user list
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username}`);
    registeredUsers = registeredUsers.filter(user => user !== socket.username);
    io.emit("update-users", registeredUsers);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
