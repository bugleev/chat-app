class UserList {
  constructor() {
    this.users = [];
  }
  addUser(userData) {
    const user = { ...userData };
    this.users.push(user);
  }
  removeUser(from) {
    this.users = this.users.filter(el => el.from !== from).filter(Boolean);
  }

  getUserList(room) {
    return this.users.filter(el => el.room === room).map(el => el.from);
  }
}

module.exports = new UserList();
