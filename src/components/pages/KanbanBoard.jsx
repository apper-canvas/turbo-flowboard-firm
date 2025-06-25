import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import TaskCard from '@/components/molecules/TaskCard';
import KanbanColumn from '@/components/molecules/KanbanColumn';
import CreateTaskModal from '@/components/organisms/CreateTaskModal';
import TaskModal from '@/components/organisms/TaskModal';
import BulkActionToolbar from '@/components/organisms/BulkActionToolbar';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { userService } from '@/services/api/userService';
import { projectService } from '@/services/api/projectService';

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectData, projectTasks, allUsers] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProjectId(projectId),
        userService.getAll()
      ]);
      
      setProject(projectData);
      setTasks(projectTasks);
      setUsers(allUsers);
    } catch (err) {
      setError(err.message || 'Failed to load project data');
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await taskService.updateStatus(
        parseInt(draggableId, 10), 
        destination.droppableId, 
        destination.index
      );

      // Update local state optimistically
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];
        const taskIndex = updatedTasks.findIndex(t => t.Id === parseInt(draggableId, 10));
        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status: destination.droppableId,
            position: destination.index,
            progress: destination.droppableId === 'done' ? 100 : updatedTasks[taskIndex].progress
          };
        }
        return updatedTasks;
      });

      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
      // Reload data to ensure consistency
      loadData();
    }
  };

const handleAddTask = (status) => {
    setCreateTaskStatus(status);
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleTaskClick = (task) => {
    if (!isSelectionMode) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleTaskSelect = (task, isSelected) => {
    if (isSelected) {
      setSelectedTasks(prev => [...prev, task]);
      if (!isSelectionMode) {
        setIsSelectionMode(true);
      }
    } else {
      setSelectedTasks(prev => prev.filter(t => t.Id !== task.Id));
      if (selectedTasks.length === 1) {
        setIsSelectionMode(false);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedTasks([]);
    setIsSelectionMode(false);
  };

  const handleTasksUpdated = () => {
    loadData();
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ));
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      handleClearSelection();
    } else {
      setIsSelectionMode(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      handleClearSelection();
    } else {
      setSelectedTasks([...tasks]);
      setIsSelectionMode(true);
    }
  };

  const isTaskSelected = (task) => {
    return selectedTasks.some(t => t.Id === task.Id);
  };

  const getTasksByStatus = (status) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-surface-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-24 bg-surface-200 rounded-lg"></div>
              <SkeletonLoader count={3} type="task" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load project"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Project not found"
          message="The project you're looking for doesn't exist or has been deleted."
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-surface-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-surface-900">
                {project.name}
              </h1>
              <p className="text-surface-600 text-sm mt-1">
                {project.description}
              </p>
            </div>
</div>
          <div className="flex items-center gap-3">
            {tasks.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={isSelectionMode ? "X" : "CheckSquare"}
                  onClick={handleToggleSelectionMode}
                >
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </Button>
                {isSelectionMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="CheckCircle"
                    onClick={handleSelectAll}
                  >
                    {selectedTasks.length === tasks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              icon="Calendar"
              onClick={() => navigate(`/project/${projectId}/gantt`)}
            >
              Timeline View
            </Button>
            <Button
              icon="Plus"
              onClick={() => handleAddTask('todo')}
            >
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon="CheckSquare"
              title="No tasks yet"
              description="Create your first task to start organizing your project workflow"
              actionLabel="Create Task"
              onAction={() => handleAddTask('todo')}
            />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="h-full overflow-x-auto">
              <div className="flex gap-6 p-6 min-w-max h-full">
                {columns.map((column) => {
                  const columnTasks = getTasksByStatus(column.id);
                  return (
                    <div key={column.id} className="w-80 flex-shrink-0">
<KanbanColumn
                        column={column}
                        tasks={columnTasks}
                        users={users}
                        onTaskClick={handleTaskClick}
                        onAddTask={handleAddTask}
                        isSelectionMode={isSelectionMode}
                        selectedTasks={selectedTasks}
                        onTaskSelect={handleTaskSelect}
                        isTaskSelected={isTaskSelected}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        projectId={projectId}
        status={createTaskStatus}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        task={selectedTask}
        users={users}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
onTaskUpdated={handleTaskUpdated}
      />

      <BulkActionToolbar
        selectedTasks={selectedTasks}
        onClearSelection={handleClearSelection}
        onTasksUpdated={handleTasksUpdated}
        projects={[project]}
        users={users}
      />
    </div>
  );
};

export default KanbanBoard;