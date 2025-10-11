import React, { useState, useMemo, useEffect } from "react";
import { Loading } from "../components";
import { 
  IoSearch,
  IoAdd,
  IoFilter,
  IoChevronDown,
  IoEllipsisHorizontal,
  IoSwapVertical,
  IoChevronBack,
  IoChevronForward,
  IoClose
} from "react-icons/io5";
import { AddTask } from "../components/tasks";

// Filter options
const FILTER_OPTIONS = [
  { value: "all", label: "All Tasks" },
  { value: "today", label: "Today's Tasks" },
  { value: "ongoing", label: "Ongoing Tasks" },
  { value: "overdue", label: "Overdue" },
  { value: "scheduled", label: "Scheduled" },
  { value: "complete", label: "Complete" },
  { value: "group", label: "Group Task" },
  { value: "review", label: "Review" },
  { value: "ongoing_issues", label: "Ongoing with Issues" },
  { value: "trashed", label: "Trashed" }
];

// API function to fetch tasks from MongoDB
const fetchTasks = async () => {
  try {
    console.log('Fetching tasks...');
    const response = await fetch('/api/task', {
      credentials: 'include',
    });
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Raw task data:', data);
      
      // Transform MongoDB tasks to match frontend format
      const transformedTasks = (data.tasks || []).map(task => {
        console.log('Processing task:', task);
        return {
          id: task._id,
          name: task.title,
          assignedTo: task.team?.map(user => user.name).join(', ') || 'Unassigned',
          category: 'General',
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          createdOn: new Date(task.createdAt).toLocaleString(),
          dueDate: new Date(task.date).toLocaleString(),
          createdBy: task.team?.[0]?.name || 'Unknown',
          status: task.stage === 'todo' ? 'Pending' : 
                  task.stage === 'in progress' ? 'Ongoing' : 
                  task.stage === 'completed' ? 'Done' : 'Pending',
          isOverdue: new Date(task.date) < new Date() && task.stage !== 'completed',
          isGroup: task.team?.length > 1,
          hasIssues: false,
          isTrashed: task.isTrashed,
        };
      });
      console.log('Transformed tasks:', transformedTasks);
      return transformedTasks;
    } else {
      console.error('Failed to fetch tasks:', response.status, response.statusText);
    }
    return [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch tasks on component mount and when modal closes
  const loadTasks = async () => {
    setLoading(true);
    const fetchedTasks = await fetchTasks();
    setTasks(fetchedTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!showCreateTask) {
      loadTasks(); // Refresh tasks when modal closes
    }
  }, [showCreateTask]);

  // Helper function to check if task is today's task
  const isToday = (dateString) => {
    const today = new Date();
    const taskDate = new Date(dateString);
    return taskDate.toDateString() === today.toDateString();
  };

  // Helper function to check if task is overdue
  const isOverdue = (dueDateString, status) => {
    if (status === "Done") return false;
    const today = new Date();
    const dueDate = new Date(dueDateString);
    return dueDate < today;
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Apply search filter
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Apply status filter
      switch (activeFilter) {
        case "all":
          return !task.isTrashed;
        case "today":
          return isToday(task.dueDate) && !task.isTrashed;
        case "ongoing":
          return task.status === "Ongoing" && !task.isTrashed;
        case "overdue":
          return isOverdue(task.dueDate, task.status) && !task.isTrashed;
        case "scheduled":
          return task.status === "Pending" && !task.isTrashed;
        case "complete":
          return task.status === "Done" && !task.isTrashed;
        case "group":
          return task.isGroup && !task.isTrashed;
        case "review":
          return task.status === "Done" && !task.isTrashed; // Assuming completed tasks need review
        case "ongoing_issues":
          return task.status === "Ongoing" && task.hasIssues && !task.isTrashed;
        case "trashed":
          return task.isTrashed;
        default:
          return !task.isTrashed;
      }
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [searchTerm, sortField, sortDirection, activeFilter, tasks]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done": return "bg-green-100 text-green-800";
      case "Ongoing": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status, task) => {
    if (task.isTrashed) return "bg-gray-400";
    if (isOverdue(task.dueDate, status)) return "bg-red-500";
    switch (status) {
      case "Done": return "bg-green-500";
      case "Ongoing": return "bg-orange-500";
      case "Pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const handleFilterSelect = (filterValue) => {
    setActiveFilter(filterValue);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <IoFilter className="w-4 h-4" />
                  {FILTER_OPTIONS.find(f => f.value === activeFilter)?.label || "Filter"}
                  <IoChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {FILTER_OPTIONS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterSelect(filter.value)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          activeFilter === filter.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <IoAdd className="w-4 h-4" />
                Create Task
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Tasks Overview</h2>
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length} results
              </p>
            </div>
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "name", label: "Task Name" },
                  { key: "assignedTo", label: "Assigned To" },
                  { key: "category", label: "Category" },
                  { key: "priority", label: "Priority" },
                  { key: "createdOn", label: "Created On" },
                  { key: "dueDate", label: "Due Date" },
                  { key: "createdBy", label: "Created By" },
                  { key: "status", label: "Status" },
                  { key: "actions", label: "Actions" }
                ].map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => column.key !== "actions" && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.key !== "actions" && <IoSwapVertical className="w-3 h-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${getStatusDot(task.status, task)}`}></div>
                      <div className="text-sm font-medium text-gray-900">
                        {task.name}
                        {task.isGroup && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Group</span>}
                        {task.hasIssues && <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">Issues</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.createdOn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <IoEllipsisHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoChevronBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoChevronForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create Task Modal */}
        <AddTask open={showCreateTask} setOpen={setShowCreateTask} />
      </div>
    </div>
  );
};

export default TasksPage;
