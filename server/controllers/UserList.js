class UserList {
  constructor() {
    this.users = [];
  }
  addUser(userData) {
    // if user connects from other socket, do not add him
    const userInList = this.users.find(el => el.name === userData.name);
    if (userInList) {
      return;
    }
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
    return this.users.filter(el => el.room === room).map(el => el.name);
  }
}

module.exports = new UserList();
