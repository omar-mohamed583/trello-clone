export const users = JSON.parse(localStorage.getItem('users')) ?? {
  usersCount: 0,
  activeUserId: null,
  activeBoardId: null,
  usersData: [
    // {
      // userId: 123,
      // userName: 'omar',
      // email: 'l6B0J@example.com',
      // password: 12345678
      // imageUrl: ''
    // }
  ]
}

export function addUser(name, password, email) {
  users.usersData.unshift({
    userId: users.usersCount,
    userName: name,
    email,
    password
  });
  users.activeUserId = users.usersCount++;
  saveUser();
}

export function getUser(email, pass) {
  return users.usersData.find(user => user.email === email && user.password === pass);
}

export function deleteUser(userId) {
  users.usersData.splice(userId, 1);
  users.usersCount--;
  users.activeUserId = null;
  saveUser();
}

export function saveUser() {
  localStorage.setItem('users', JSON.stringify(users));
}