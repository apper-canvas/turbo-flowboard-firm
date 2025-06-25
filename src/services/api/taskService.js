import tasksData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...tasksData];

export const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getByProjectId(projectId) {
    await delay(250);
    return tasks.filter(task => task.projectId === parseInt(projectId, 10));
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id, 10));
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const maxId = Math.max(...tasks.map(t => t.Id), 0);
const newTask = {
      Id: maxId + 1,
      ...taskData,
      progress: 0,
      dependencies: taskData.dependencies || [],
      position: taskData.position || 0,
      attachments: taskData.attachments || []
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updates,
      Id: tasks[index].Id // Prevent Id modification
    };
    
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async updateStatus(id, status, position) {
    await delay(200);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      status,
      position: position !== undefined ? position : tasks[index].position,
      progress: status === 'done' ? 100 : tasks[index].progress
    };
    
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(250);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = { ...tasks[index] };
tasks.splice(index, 1);
    return deletedTask;
  },

  async attachFile(taskId, fileData) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(taskId, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }

    const file = {
      Id: Date.now(), // Simple ID for mock data
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      url: fileData.url || URL.createObjectURL(fileData),
      uploadedAt: new Date().toISOString()
    };

    if (!tasks[index].attachments) {
      tasks[index].attachments = [];
    }

    tasks[index].attachments.push(file);
    return { ...tasks[index] };
  },

  async removeFile(taskId, fileId) {
    await delay(200);
    const index = tasks.findIndex(t => t.Id === parseInt(taskId, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }

    if (tasks[index].attachments) {
      tasks[index].attachments = tasks[index].attachments.filter(
        file => file.Id !== fileId
      );
    }

    return { ...tasks[index] };
  },

  async getFiles(taskId) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(taskId, 10));
    if (!task) {
      throw new Error('Task not found');
}
    return task.attachments || [];
  },

  async bulkUpdate(taskIds, updates) {
    await delay(500);
    const updatedTasks = [];
    
    for (const taskId of taskIds) {
      const index = tasks.findIndex(t => t.Id === parseInt(taskId, 10));
      if (index !== -1) {
        const updatedTask = {
          ...tasks[index],
          ...updates,
          Id: tasks[index].Id // Prevent Id modification
        };
        tasks[index] = updatedTask;
        updatedTasks.push({ ...updatedTask });
      }
    }
    
    return updatedTasks;
  },

  async bulkDelete(taskIds) {
    await delay(400);
    const deletedTasks = [];
    
    // Sort by index in reverse order to avoid index shifting issues
    const indices = taskIds
      .map(id => ({ id, index: tasks.findIndex(t => t.Id === parseInt(id, 10)) }))
      .filter(item => item.index !== -1)
      .sort((a, b) => b.index - a.index);
    
    for (const item of indices) {
      const deletedTask = { ...tasks[item.index] };
      tasks.splice(item.index, 1);
      deletedTasks.push(deletedTask);
    }
    
    return deletedTasks;
  },

  async bulkMove(taskIds, targetStatus, targetProjectId = null) {
    await delay(450);
    const movedTasks = [];
    
    for (const taskId of taskIds) {
      const index = tasks.findIndex(t => t.Id === parseInt(taskId, 10));
      if (index !== -1) {
        const updates = { status: targetStatus };
        if (targetProjectId !== null) {
          updates.projectId = parseInt(targetProjectId, 10);
        }
        if (targetStatus === 'done') {
          updates.progress = 100;
        }
        
        const updatedTask = {
          ...tasks[index],
          ...updates,
          Id: tasks[index].Id
        };
        
        tasks[index] = updatedTask;
        movedTasks.push({ ...updatedTask });
      }
    }
    
    return movedTasks;
  },

  async bulkAssign(taskIds, assigneeId) {
    await delay(350);
    const assignedTasks = [];
    
    for (const taskId of taskIds) {
      const index = tasks.findIndex(t => t.Id === parseInt(taskId, 10));
      if (index !== -1) {
        const updatedTask = {
          ...tasks[index],
          assigneeId: parseInt(assigneeId, 10),
          Id: tasks[index].Id
        };
        
        tasks[index] = updatedTask;
        assignedTasks.push({ ...updatedTask });
      }
    }
    
    return assignedTasks;
  }
};

export default taskService;