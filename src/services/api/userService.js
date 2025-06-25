import usersData from '../mockData/users.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let users = [...usersData];

export const userService = {
  async getAll() {
    await delay(200);
    return [...users];
  },

  async getById(id) {
    await delay(150);
    const user = users.find(u => u.Id === parseInt(id, 10));
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  },

  async create(userData) {
    await delay(300);
    const maxId = Math.max(...users.map(u => u.Id), 0);
    const newUser = {
      Id: maxId + 1,
      ...userData,
      avatar: userData.avatar || '#64748b'
    };
    users.push(newUser);
    return { ...newUser };
  },

  async update(id, updates) {
    await delay(250);
    const index = users.findIndex(u => u.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...users[index],
      ...updates,
      Id: users[index].Id // Prevent Id modification
    };
    
    users[index] = updatedUser;
    return { ...updatedUser };
  },

  async delete(id) {
    await delay(200);
    const index = users.findIndex(u => u.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const deletedUser = { ...users[index] };
    users.splice(index, 1);
    return deletedUser;
  }
};

export default userService;