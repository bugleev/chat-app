const fs = require("fs");
const path = require("path");
const request = require("request");
const serverPath = require("../util/path");
const Room = require("../models/room");
const Message = require("../models/message");
const userList = require("./UserList");
const Bot = require("./BotInstance");

const isOlderThan = (created, interval) =>
  Date.now() - new Date(created).getTime() > 1000 * 60 * 60 * 24 * interval;

const extractUserFromJWT = socket => {
  try {
    return {
      username: socket.decoded_token.username,
      userId: socket.decoded_token.userId
    };
  } catch (error) {
    socket.emit("error", { message: "Socket authorization error" });
  }
};

exports.createRoomHandler = async function(socket, request, cb) {
  try {
    const { room } = request;
    if (!room) throw new Error("No room provided!");
    const { userId } = extractUserFromJWT(socket);
    const roomsCreated = await Room.find({ creator: userId }).countDocuments();
    if (roomsCreated >= 2) {
      throw new Error("Only 2 rooms per user allowed!");
    }
    const newRoom = new Room({
      name: room,
      creator: userId
    });
    const savedRoom = await newRoom.save();
    this.updateRoomList(null);
    cb(savedRoom.name);
  } catch (error) {
    let message = "";
    if (error.code === 11000) {
      message += "room name taken!";
    }
    socket.emit("error", { message: message || error.message });
  }
};
exports.updateRoomList = async function(socket) {
  // emit to all on room create, otherwise update only socket
  const emitTarget = socket || this.ioServer;
  try {
    const roomList = await Room.find().select("name -_id");
    emitTarget.emit("updateRoomList", { rooms: roomList });
  } catch (error) {
    emitTarget.emit("error", error);
  }
};
exports.joinRoomHandler = async function(socket, { room }, cb) {
  try {
    // leave current room
    this.leaveRoomAndUpdateUserList(socket);
    // enter new room
    const roomInDB = await Room.findOne({ name: room });
    if (!roomInDB) {
      throw new Error("No room found with that name!");
    }
    const { username } = extractUserFromJWT(socket);
    const usersBeforeAdded = userList.getUserList(room);
    socket.join(room);
    userList.addUser({
      socketId: socket.id,
      name: username,
      room: room
    });
    const roomUserList = userList.getUserList(room);
    this.ioServer.to(room).emit("updateUserList", roomUserList);
    // broadcast the join event only on one open connection
    if (!usersBeforeAdded.includes(username)) {
      socket.broadcast.to(room).emit("newMessage", {
        system: true,
        message: `${username} joined!`
      });
    }
    cb(room);
  } catch (error) {
    socket.emit("error", { message: error.message });
  }
};

exports.leaveRoomAndUpdateUserList = function(socket) {
  const user = userList.removeUser(socket.id);
  if (!user) return;
  socket.leave(user.room);
  const roomUserList = userList.getUserList(user.room);
  this.ioServer.to(user.room).emit("updateUserList", roomUserList);
  // broadcast the leave event only on one open connection
  if (!roomUserList.includes(user.name)) {
    socket.broadcast
      .to(user.room)
      .emit("newMessage", { system: true, message: `${user.name} left...` });
  }
};
exports.messageHandler = async function(socket, request) {
  try {
    if (!request.text) throw new Error("No message provided!");
    request.created = Date.now();
    const { userId, username } = extractUserFromJWT(socket);
    const room = await Room.findOne({ name: request.room }).select("_id");
    const message = new Message({
      author: userId,
      room: room._id,
      text: request.text
    });
    this.ioServer
      .to(request.room)
      .emit("newMessage", { user: username, ...request });
    message.save();
    this.sendBotResponse(request.text, request.room, socket);
  } catch (error) {
    socket.emit("error", error);
  }
};
exports.sendBotResponse = async function(message, room, socket) {
  try {
    const botResponse = await Bot.checkMessage(message);
    if (!botResponse) return;
    if (typeof botResponse === "string") {
      const response = {
        text: botResponse,
        created: Date.now(),
        room: room,
        user: "SRVBot"
      };
      this.ioServer.to(room).emit("newMessage", response);
    } else {
      botResponse.listValue.values.forEach(msg => {
        const {
          arrival,
          departure,
          transport,
          duration
        } = msg.structValue.fields;
        const response = {
          text: `--- Тип: ${transport.stringValue} --- Отправление:  ${
            departure.stringValue
          } --- Прибытие: ${arrival.stringValue} --- В пути: ${
            duration.stringValue
          } ---`,
          created: Date.now(),
          room: room,
          user: "SRVBot"
        };
        this.ioServer.to(room).emit("newMessage", response);
      });
    }
  } catch (error) {
    console.log("error:", error);
    socket.emit("error", error);
  }
};

exports.uploadFileMessage = function(socket, request, file, cb) {
  try {
    if (!request.filename) throw new Error("No file provided!");
    const splitName = request.filename.split(".");
    const downloadLink = `${splitName[0]}_${new Date().getTime().toString()}.${
      splitName[1]
    }`;
    var stream = fs.createWriteStream(
      path.join(serverPath, process.env.UPLOADS_DIR, downloadLink)
    );
    stream.once("open", () => {
      stream.write(file);
      stream.end(async () => {
        request.created = Date.now();
        const room = await Room.findOne({ name: request.room }).select("_id");
        const { userId, username } = extractUserFromJWT(socket);
        const message = new Message({
          author: userId,
          room: room._id,
          text: request.filename,
          isFile: true,
          fileLink: downloadLink
        });
        const fileMessage = { ...request };
        fileMessage.text = request.filename;
        fileMessage.user = username;
        fileMessage.isFile = true;
        fileMessage.fileLink = downloadLink;
        this.ioServer.to(request.room).emit("newMessage", fileMessage);
        message.save();
        cb();
      });
    });
  } catch (error) {
    socket.emit("error", error);
  }
};
exports.downloadYandex = function(socket) {
  try {
    var options = {
      url:
        "https://api.rasp.yandex.net/v3.0/stations_list/?apikey=ebf316c3-0577-46c4-93b3-cd3ef3e5feea&lang=ru_RU&format=json",
      method: "GET",
      accept: "application/json"
    };
    request(options, (err, httpResponse, body) => {
      const data = [];
      JSON.parse(body).countries.forEach(co => {
        co.regions.forEach(el => {
          el.settlements.forEach(st => {
            if (st.title) {
              const str = st.title.replace(/[[\]{}()*+?.,\\^$|#]/g, " ").trim();
              data.push({ value: str, code: st.codes.yandex_code });
            }
          });
        });
      });
      Bot.loadDataFromServer(data);
      fs.writeFile(
        path.join(serverPath, process.env.UPLOADS_DIR, "yandex"),
        JSON.stringify(data),
        "utf8",
        e => {
          console.log(e);
        }
      );
    });
  } catch (error) {
    socket.emit("error", error);
  }
};
exports.downloadFile = (req, res, next) => {
  const { link } = req.params;
  var filePath = path.join(serverPath, process.env.UPLOADS_DIR, link);
  return res.download(filePath, err => {
    if (err) {
      const error = new Error("No file found!");
      error.statusCode = err.statusCode || 500;
      next(error);
    }
  });
};

exports.populateMessages = async function(socket, { limit, skip, room }) {
  /*
   * 1. Populate virtual field on provided room, and populate author field in found messages
   * 2. Set limit and skip options from request
   * 3. Sort messages by date to apply skip from the most recent messages
   */
  const { messages } = await Room.findOne({ name: room }).populate({
    path: "messages",
    populate: { path: "author", select: "username -_id" },
    select: "-_id",
    options: { limit, skip, sort: { created: -1 } }
  });

  /**
   * 1.sort found messages backwards to display in a correct order on UI, map them to the           expected format
     2. files will be deleted from temp folder on the server every 10 days, so we won't display links older than 10 days   
 */
  const formattedMessages = messages
    .sort((a, b) => a.created - b.created)
    .map(el =>
      el.author
        ? {
            user: el.author.username,
            text: el.isFile
              ? isOlderThan(el.created, process.env.CLEAN_UPLOADS_DAYS)
                ? "link expired"
                : el.text
              : el.text,
            created: el.created,
            isFile: !!el.isFile,
            fileLink: el.fileLink
          }
        : undefined
    )
    .filter(Boolean);
  socket.emit("populateMessagesFromDB", { messages: formattedMessages });
};
exports.typingHandler = function(socket) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("typing", {
    user: user.name
  });
};
exports.stopTypingHandler = function(socket) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("stop typing", {
    user: user.name
  });
};
exports.onErrorHandler = function(socket, error) {
  // emit different type of error event to handle it on the UI, on the "error" type socket would just close
  socket.emit("appError", error);
};

exports.onDisconnectHandler = function(socket) {
  this.leaveRoomAndUpdateUserList(socket);
};
