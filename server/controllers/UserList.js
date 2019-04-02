const bot = require("./BotInstance");

class UserList {
  constructor() {
    this.users = [];
    this.users.push({ name: bot.name, role: "bot", room: "General" });
  }
  addUser(userData) {
    // if user connects from other socket, do not add him
    const userInList = this.users.find(el => el.name === userData.name);
    if (userInList) {
      return;
    }
    userData.role = "user";
    this.users.push(userData);
  }
  removeUser(socketId) {
    const user = this.users.find(el => el.socketId === socketId);
    this.users = this.users
      .filter(el => el.socketId !== socketId)
      .filter(Boolean);
    return user;
  }
  getUser(socketId) {
    return this.users.find(el => el.socketId === socketId);
  }
  getUserList(room) {
    return this.users
      .filter(el => el.room === room)
      .map(el => ({ name: el.name, role: el.role }));
  }
}

module.exports = new UserList();
