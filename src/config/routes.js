import ProjectsOverview from '@/components/pages/ProjectsOverview';
import KanbanBoard from '@/components/pages/KanbanBoard';
import GanttTimeline from '@/components/pages/GanttTimeline';
import MyTasks from '@/components/pages/MyTasks';
import Team from '@/components/pages/Team';

export const routes = {
  projects: {
    id: 'projects',
    label: 'Projects',
    path: '/',
    icon: 'Folder',
    component: ProjectsOverview
  },
  kanban: {
    id: 'kanban',
    label: 'Kanban',
    path: '/project/:projectId/kanban',
    icon: 'Kanban',
    component: KanbanBoard,
    hideFromNav: true
  },
  gantt: {
    id: 'gantt',
    label: 'Timeline',
    path: '/project/:projectId/gantt',
    icon: 'Calendar',
    component: GanttTimeline,
    hideFromNav: true
  },
  myTasks: {
    id: 'myTasks',
    label: 'My Tasks',
    path: '/my-tasks',
    icon: 'CheckSquare',
    component: MyTasks
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    path: '/timeline',
    icon: 'Calendar',
    component: GanttTimeline
  },
  team: {
    id: 'team',
    label: 'Team',
    path: '/team',
    icon: 'Users',
    component: Team
  }
};

export const routeArray = Object.values(routes);
export default routes;