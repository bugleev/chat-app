class UserList {
  constructor() {
    this.users = [];
  }
  addUser(userData) {
    // if user connects from other socket, replace him
    const userInList = this.users.find(el => el.name === userData.name);
    if (userInList) {
      this.removeUser(userInList.socketId);
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
  getAllRooms() {
    return [...new Set(this.users.map(el => el.room))];
  }
  getUserList(room) {
    return this.users.filter(el => el.room === room).map(el => el.name);
  }
}

module.exports = new UserList();
