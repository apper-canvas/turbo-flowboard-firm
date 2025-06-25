import commentsData from '../mockData/comments.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let comments = [...commentsData];

export const commentService = {
  async getAll() {
    await delay(200);
    return [...comments];
  },

  async getByTaskId(taskId) {
    await delay(150);
    return comments.filter(comment => comment.taskId === parseInt(taskId, 10));
  },

  async getById(id) {
    await delay(100);
    const comment = comments.find(c => c.Id === parseInt(id, 10));
    if (!comment) {
      throw new Error('Comment not found');
    }
    return { ...comment };
  },

  async create(commentData) {
    await delay(300);
    const maxId = Math.max(...comments.map(c => c.Id), 0);
    const newComment = {
      Id: maxId + 1,
      ...commentData,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    return { ...newComment };
  },

  async update(id, updates) {
    await delay(250);
    const index = comments.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Comment not found');
    }
    
    const updatedComment = {
      ...comments[index],
      ...updates,
      Id: comments[index].Id // Prevent Id modification
    };
    
    comments[index] = updatedComment;
    return { ...updatedComment };
  },

  async delete(id) {
    await delay(200);
    const index = comments.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Comment not found');
    }
    
    const deletedComment = { ...comments[index] };
    comments.splice(index, 1);
    return deletedComment;
  }
};

export default commentService;