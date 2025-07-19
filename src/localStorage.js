// Local storage mock for development/testing
// This is a simple alternative if you want to test the form without Firebase

class LocalStorageDB {
  constructor() {
    this.collectionName = 'users';
  }

  // Get all users from localStorage
  async getUsers() {
    try {
      const users = localStorage.getItem(this.collectionName);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Add a new user to localStorage
  async addUser(userData) {
    try {
      const users = await this.getUsers();
      const newUser = {
        id: Date.now().toString(), // Simple ID generation
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem(this.collectionName, JSON.stringify(users));
      return { id: newUser.id };
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  // Delete a user from localStorage
  async deleteUser(userId) {
    try {
      const users = await this.getUsers();
      const filteredUsers = users.filter(user => user.id !== userId);
      localStorage.setItem(this.collectionName, JSON.stringify(filteredUsers));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      throw error;
    }
  }

  // Clear all users (for testing)
  async clearAll() {
    localStorage.removeItem(this.collectionName);
  }
}

export const localDB = new LocalStorageDB();
