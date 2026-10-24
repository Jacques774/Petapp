const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('.')); // Serves your HTML/JS files directly!

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory store for shared tasks
let tasks = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current tasks to newly connected user
  socket.emit('initial-tasks', tasks);

  // Listen for task status updates from family member profiles
  socket.on('update-task', (updatedTask) => {
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
    } else {
      tasks.push(updatedTask);
    }
    // Broadcast updated task list to everyone connected (including main Dashboard)
    io.emit('task-updated', tasks);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`PetCare server running on port ${PORT}`);
});
