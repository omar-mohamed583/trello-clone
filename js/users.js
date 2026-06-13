export const users = JSON.parse(localStorage.getItem('users')) ?? {
  usersCount: 0,
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
  users.usersData.push({
    userId: users.usersCount++,
    userName: name,
    email,
    password
  });
  saveUser();
}

export function getUser(userId) {
  return users.usersData[userId];
}

export function deleteUser(userId) {
  users.usersData.splice(userId, 1);
  users.usersCount--;
  saveUser();
}

export function saveUser() {
  localStorage.setItem('users', JSON.stringify(users));
}