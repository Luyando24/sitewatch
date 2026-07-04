/**
 * SiteWatch 360 — Main Server Entry Point (HTTP Version)
 */
require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", methods: ["GET", "POST"] },
});

// ─── Set Socket.io on App ─────────────────────────────────────────────────────
app.set("io", io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/sites", require("./routes/sites"));
app.use("/api/readings", require("./routes/readings"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/tenants", require("./routes/tenants"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 SiteWatch 360 server running on http://localhost:${PORT}`);
});
