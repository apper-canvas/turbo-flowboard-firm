import { motion } from "framer-motion";
import React, { useState } from "react";
import { addDays, format, isAfter, isBefore } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";

const TaskCard = ({ 
  task, 
  user, 
  onClick, 
  isDragging = false, 
  isSelectionMode = false,
  isSelected = false,
  onSelect 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDueDateStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const tomorrow = addDays(now, 1);

    if (isBefore(due, now)) return 'overdue';
    if (isBefore(due, tomorrow)) return 'due-soon';
    return 'normal';
  };

  const getDueDateVariant = (status) => {
    switch (status) {
      case 'overdue': return 'error';
      case 'due-soon': return 'warning';
      default: return 'default';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 25) return 'bg-warning';
    return 'bg-secondary';
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);

const handleCardClick = (e) => {
    if (isSelectionMode && e.target.type === 'checkbox') {
      return; // Let checkbox handle its own event
    }
    if (isSelectionMode) {
      onSelect && onSelect(!isSelected);
    } else {
      onClick && onClick();
    }
  };

  return (
    <motion.div
    layout
    whileHover={{
        scale: isDragging ? 1 : 1.02
    }}
    whileTap={{
        scale: isDragging ? 1 : 0.98
    }}
    onHoverStart={() => setIsHovered(true)}
    onHoverEnd={() => setIsHovered(false)}
    className={`
        bg-white rounded-lg border border-surface-200 p-4 cursor-pointer
        hover:shadow-md transition-all duration-200 relative
        ${isDragging ? "drag-ghost" : ""}
        ${isSelected ? "ring-2 ring-primary/50 border-primary" : ""}
      `}
    onClick={handleCardClick}>
    {/* Selection Checkbox */}
    {isSelectionMode && <div className="absolute top-2 left-2 z-10">
        <input
            type="checkbox"
            checked={isSelected}
            onChange={e => onSelect && onSelect(e.target.checked)}
            className="w-4 h-4 text-primary bg-white border-surface-300 rounded focus:ring-primary/50"
            onClick={e => e.stopPropagation()} />
    </div>}
    <div className={`space-y-3 ${isSelectionMode ? "ml-6" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
            <h4
                className="font-medium text-surface-900 text-sm leading-snug flex-1 min-w-0">
                {task.title}
            </h4>
            {task.attachments?.length > 0 && <div className="flex items-center gap-1">
                <ApperIcon name="Paperclip" size={12} className="text-surface-400" />
                <span className="text-xs text-surface-500">{task.attachments.length}</span>
            </div>}
            {task.dependencies?.length > 0 && <ApperIcon name="Link" size={14} className="text-surface-400 flex-shrink-0" />}
        </div>
    </div>
    {/* Description */}
    {task.description && <p className="text-surface-600 text-xs line-clamp-2">
        {task.description}
    </p>}
    {/* Progress bar */}
    {task.progress > 0 && <div className="space-y-1">
        <div className="flex justify-between items-center">
            <span className="text-xs text-surface-500">Progress</span>
            <span className="text-xs font-medium text-surface-700">{task.progress}%</span>
        </div>
        <div className="w-full bg-surface-200 rounded-full h-1.5">
            <motion.div
                className={`h-1.5 rounded-full ${getProgressColor(task.progress)}`}
                initial={{
                    width: 0
                }}
                animate={{
                    width: `${task.progress}%`
                }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut"
                }} />
        </div>
    </div>}
    {/* Footer */}
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {user && <Avatar name={user.name} color={user.avatar} size="xs" />}
            <Badge variant={getDueDateVariant(dueDateStatus)} size="sm">
                <ApperIcon name="Calendar" size={10} />
                {format(new Date(task.dueDate), "MMM d")}
            </Badge>
        </div>
        <motion.div
            animate={{
                x: isHovered ? 4 : 0
            }}
            transition={{
                duration: 0.2
            }}>
            <ApperIcon name="ChevronRight" size={14} className="text-surface-400" />
        </motion.div>
    </div>
</motion.div>
  );
};

export default TaskCard;