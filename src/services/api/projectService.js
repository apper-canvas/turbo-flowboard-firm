import projectsData from '../mockData/projects.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let projects = [...projectsData];

export const projectService = {
  async getAll() {
    await delay(300);
    return [...projects];
  },

  async getById(id) {
    await delay(200);
    const project = projects.find(p => p.Id === parseInt(id, 10));
    if (!project) {
      throw new Error('Project not found');
    }
    return { ...project };
  },

  async create(projectData) {
    await delay(400);
    const maxId = Math.max(...projects.map(p => p.Id), 0);
    const newProject = {
      Id: maxId + 1,
      ...projectData,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    return { ...newProject };
  },

  async update(id, updates) {
    await delay(300);
    const index = projects.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...projects[index],
      ...updates,
      Id: projects[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    };
    
    projects[index] = updatedProject;
    return { ...updatedProject };
  },

  async delete(id) {
    await delay(250);
    const index = projects.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    const deletedProject = { ...projects[index] };
    projects.splice(index, 1);
    return deletedProject;
  }
};

export default projectService;