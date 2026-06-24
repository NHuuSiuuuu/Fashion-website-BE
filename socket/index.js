const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `http://localhost:5173/`,
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log(`socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
