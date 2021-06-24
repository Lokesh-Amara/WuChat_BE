const dotenv = require("dotenv");
dotenv.config();
const io = require("socket.io")(process.env.PORT || 3001, {
  cors: {},
});

const users = {};

io.on("connection", (socket) => {
  socket.on("new-user", (uname) => {
    users[socket.id] = uname;
    socket.broadcast.emit("user-connected", uname);
  });
  socket.on("send-message", (message, username, room) => {
    const data = {};
    data.username = username;
    data.message = message;
    data.room = room;
    if (room === "") {
      socket.broadcast.emit("receive-message", data);
    } else {
      socket.to(room).emit("receive-message", data);
    }
  });

  socket.on("join-room", (previousRoom, newRoom, user, callback) => {
    if (previousRoom !== "") socket.leave(previousRoom);
    socket.join(newRoom);
    callback(` You joined ${newRoom}`, user);
    socket
      .to(newRoom)
      .emit("room-joined-status", `${user} joined ${newRoom}`, user);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});
