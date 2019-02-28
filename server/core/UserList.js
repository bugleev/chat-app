class UserList {
  constructor() {
    this.users = [];
  }
  addUser(userData) {
    this.users.push(userData);
  }
  removeUser(socketId) {
    const user = this.users.find(el => el.socketId === socketId);
    this.users = this.users
      .filter(el => el.socketId !== socketId)
      .filter(Boolean);
    return user;
  }

  getUserList(room) {
    return this.users.filter(el => el.room === room).map(el => el.name);
  }
}

module.exports = new UserList();
