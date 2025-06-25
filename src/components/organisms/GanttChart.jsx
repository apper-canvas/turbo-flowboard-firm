import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';

const GanttChart = ({ tasks = [], users = [], className = '' }) => {
  const chartData = useMemo(() => {
    if (!tasks.length) return { tasks: [], startDate: new Date(), endDate: new Date(), totalDays: 0 };

    const sortedTasks = [...tasks].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const startDate = new Date(sortedTasks[0].startDate);
    const endDate = new Date(Math.max(...tasks.map(task => new Date(task.dueDate))));
    const totalDays = differenceInDays(endDate, startDate) + 1;

    const tasksWithPosition = sortedTasks.map(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.dueDate);
      const daysFromStart = differenceInDays(taskStart, startDate);
      const duration = differenceInDays(taskEnd, taskStart) + 1;
      const widthPercentage = (duration / totalDays) * 100;
      const leftPercentage = (daysFromStart / totalDays) * 100;

      return {
        ...task,
        daysFromStart,
        duration,
        widthPercentage,
        leftPercentage
      };
    });

    return {
      tasks: tasksWithPosition,
      startDate,
      endDate,
      totalDays
    };
  }, [tasks]);

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-success';
      case 'in-progress': return 'bg-primary';
      case 'todo': return 'bg-secondary';
      default: return 'bg-surface-400';
    }
  };

  const generateTimelineHeaders = () => {
    const headers = [];
    for (let i = 0; i <= chartData.totalDays; i += Math.max(1, Math.floor(chartData.totalDays / 10))) {
      const date = addDays(chartData.startDate, i);
      headers.push({
        date,
        position: (i / chartData.totalDays) * 100
      });
    }
    return headers;
  };

  const timelineHeaders = generateTimelineHeaders();

  if (!tasks.length) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 p-8 text-center ${className}`}>
        <div className="text-surface-400 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-medium text-surface-600 mb-1">No timeline data</h3>
        <p className="text-sm text-surface-500">Tasks will appear here once they have start and due dates</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-surface-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-surface-200">
        <h3 className="font-display font-semibold text-lg text-surface-900">
          Project Timeline
        </h3>
        <p className="text-sm text-surface-600 mt-1">
          {format(chartData.startDate, 'MMM d')} - {format(chartData.endDate, 'MMM d, yyyy')}
          {' '}({chartData.totalDays} days)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="relative h-12 bg-surface-50 border-b border-surface-200">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-64 flex-shrink-0"></div>
              <div className="flex-1 relative">
                {timelineHeaders.map((header, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 flex items-center"
                    style={{ left: `${header.position}%` }}
                  >
                    <div className="text-xs text-surface-600 font-medium">
                      {format(header.date, 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="divide-y divide-surface-200">
            {chartData.tasks.map((task, index) => {
              const user = getUserById(task.assigneeId);
              return (
                <motion.div
                  key={task.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center h-16 px-4 hover:bg-surface-50 transition-colors"
                >
                  {/* Task Info */}
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-3">
                      {user && (
                        <Avatar name={user.name} color={user.avatar} size="xs" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-surface-900 text-sm truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'primary' : 'warning'} 
                            size="sm"
                          >
                            {task.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-xs text-surface-500">
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${task.widthPercentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`
                        absolute h-6 rounded-md ${getStatusColor(task.status)}
                        shadow-sm
                      `}
                      style={{ left: `${task.leftPercentage}%` }}
                    >
                      <div className="absolute inset-0 flex items-center px-2">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className="h-1 bg-white rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Task duration label */}
                    <div 
                      className="absolute top-7 text-xs text-surface-500 whitespace-nowrap"
                      style={{ left: `${task.leftPercentage}%` }}
                    >
                      {task.duration} day{task.duration !== 1 ? 's' : ''}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-surface-50 border-t border-surface-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary"></div>
            <span className="text-surface-600">To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-surface-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success"></div>
            <span className="text-surface-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;