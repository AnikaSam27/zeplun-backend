const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Zeplun Call Server Running 🚀");
});


const server = http.createServer(app);

// 🔹 Socket.IO v4 initialization
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
    transports: ["websocket"],  // 🔥 only websocket, no polling
  pingTimeout: 60000,           // optional, for stable connections
  pingInterval: 25000
});

// 🔹 Socket.IO connection events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // =========================
  // JOIN ORDER CALL ROOM
  // =========================
  socket.on("join-call-room", ({ orderId, userId, role }, ack) => {
  socket.join(orderId);
  console.log(`📦 ${role} ${userId} joined room ${orderId}`);
  ack?.({ success: true });
});


  // =========================
  // PARTNER STARTS CALL
  // =========================
  socket.on("start-call", ({ orderId, partnerId }) => {
    console.log("📞 Call started for order:", orderId);

    // notify customer in same order room
    socket.to(orderId).emit("incoming-call", {
      orderId,
      from: "partner",
      partnerId
    });
  });

  // =========================
  // WEBRTC SIGNALING
  // =========================
  socket.on("signal", ({ orderId, data }) => {
    socket.to(orderId).emit("signal", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
