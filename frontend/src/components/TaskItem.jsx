import React, { useEffect, useState, useCallback } from "react";
import {
  getPriorityBadgeColor,
  getPriorityColor,
  MENU_OPTIONS,
  TI_CLASSES,
} from "../assets/dummy";
import { Calendar, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import axios from "axios";
import { format, isToday } from "date-fns";
import TaskModal from "./TaskModal";

const API_BASE = "https://taskflow-vbfj.onrender.com/api/tasks";

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  showCompleteCheckbox = true,
  onEdit,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [showEditModal, setShowEditModal] = useState(false); // ✅ missing
  const [taskData, setTaskData] = useState(task); // ✅ manage internal task state

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const handleComplete = async () => {
    const newStatus = isCompleted ? "No" : "Yes";
    try {
      await axios.put(
        `${API_BASE}/${task._id || task.id}`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (err) {
      console.error("Error completing task:", err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (err) {
      console.error("Error deleting task:", err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") {
      setShowEditModal(true); // ✅ Show modal on edit
    } else if (action === "delete") {
      handleDelete();
    }
  };

  const handleSave = async (updatedTask) => {
    try {
      const payload = {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        completed: updatedTask.completed,
      };

      await axios.put(`${API_BASE}/${task._id || task.id}/gp`, payload, {
        headers: getAuthHeaders(),
      });

      setShowEditModal(false); // ✅ hide modal after save
      onRefresh?.(); // ✅ refresh tasks
    } catch (err) {
      console.error("Error saving task:", err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const borderColor = isCompleted
    ? "border-green-500"
    : getPriorityColor(task.priority).split(" ")[0];
  const progress = subtasks.length
    ? (subtasks.filter((st) => st.completed).length / subtasks.length) * 100
    : 0;

  return (
    <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
      <div className={TI_CLASSES.leftContainer}>
        {showCompleteCheckbox && (
          <button
            onClick={handleComplete}
            className={`${TI_CLASSES.completeBtn} ${
              isCompleted ? "text-green-500" : "text-gray-300"
            }`}
          >
            <CheckCircle2
              size={18}
              className={`${TI_CLASSES.checkboxIconBase} ${
                isCompleted ? "fill-green-500" : ""
              }`}
            />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <h3
              className={`${TI_CLASSES.titleBase} ${
                isCompleted ? "text-gray-400 line-through" : "text-gray-800"
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className={TI_CLASSES.description}>{task.description}</p>
          )}
        </div>
      </div>

      <div className={TI_CLASSES.rightContainer}>
  <div className="relative">
    <button
      onClick={() => setShowMenu(!showMenu)}
      className={TI_CLASSES.menuButton} // ✅ changed
    >
      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>

    {showMenu && (
      <div className={TI_CLASSES.dropdownMenu}> {/* ✅ changed */}
        {MENU_OPTIONS.map((opt) => (
          <button
            key={opt.action}
            onClick={() => handleAction(opt.action)}
            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors duration-200"
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Date and created info (unchanged) */}
  <div>
    <div
      className={`${TI_CLASSES.dateRow} ${
        task.dueDate && isToday(new Date(task.dueDate))
          ? "text-fuchsia-600"
          : "text-gray-500"
      }`}
    >
      <Calendar className="w-3.5 h-3.5" />
      {task.dueDate
        ? isToday(new Date(task.dueDate))
          ? "Today"
          : format(new Date(task.dueDate), "MMM dd")
        : "-"}
    </div>
    <div className={TI_CLASSES.createdRow}>
      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      {task.createdAt
        ? `Created ${format(new Date(task.createdAt), "MMM dd")}`
        : "No date"}
    </div>
  </div>
</div>


      {/* ✅ Edit Modal */}
      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        taskToEdit={task}
        onSave={handleSave}
      />
    </div>
  );
};

export default TaskItem;
