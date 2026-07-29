import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError } from '../lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Task, OperationType } from '../types';
import { TaskStats } from './TaskStats';
import { TaskForm } from './TaskForm';
import {
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Tag,
  AlertCircle,
  Plus,
  ListFilter,
  Check,
  RefreshCw,
} from 'lucide-react';

export const TaskList: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Editing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFirestoreError(null);

    const path = 'tasks';
    const q = query(collection(db, path), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTasks: Task[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            title: data.title || '',
            description: data.description || '',
            completed: !!data.completed,
            priority: data.priority || 'medium',
            category: data.category || 'General',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Task;
        });

        // Client sort by creation time
        fetchedTasks.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        setTasks(fetchedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore onSnapshot subscription error:', error);
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (err: any) {
          setFirestoreError(err.message || 'Error listening to Firestore updates.');
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const toggleTaskCompletion = async (task: Task) => {
    if (!user) return;
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        completed: !task.completed,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error toggling task status:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
      } catch (formattedErr: any) {
        alert('Permission denied or error updating task status.');
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this task from Firestore?')) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (err) {
      console.error('Error deleting task:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
      } catch (formattedErr: any) {
        alert('Permission denied or error deleting task.');
      }
    }
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(tasks.map((t) => t.category || 'General')));

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? !task.completed
        : task.completed;

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    const matchesCategory =
      selectedCategory === 'all' || task.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <TaskStats tasks={tasks} />

      {/* Firestore Error Alert */}
      {firestoreError && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Firestore Access Error</p>
              <p className="text-[11px] opacity-80">{firestoreError}</p>
            </div>
          </div>
          <button
            onClick={() => setFirestoreError(null)}
            className="px-2 py-1 text-xs bg-red-900/50 hover:bg-red-800 rounded font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Filters, Add Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Firestore tasks..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tab */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'completed' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done
            </button>
          </div>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">Priority: All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Category Select */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="all">Category: All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* New Task Button */}
          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            New Task
          </button>
        </div>
      </div>

      {/* Task Creation / Editing Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <TaskForm
              existingTask={editingTask}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
              onSuccess={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Tasks List Content */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Syncing with Firestore database...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <ListFilter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">No tasks found in your Firestore collection</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tasks.length === 0
              ? "You haven't added any tasks yet. Click 'New Task' to create your first document."
              : 'No tasks match your active filter or search query.'}
          </p>
          {tasks.length === 0 && (
            <button
              onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              className="mt-2 inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isHigh = task.priority === 'high';
            const isMedium = task.priority === 'medium';

            return (
              <div
                key={task.id}
                className={`group bg-slate-900 border transition-all rounded-2xl p-4 flex items-start justify-between space-x-3 hover:border-slate-700 ${
                  task.completed ? 'opacity-65 border-slate-800/80 bg-slate-950/40' : 'border-slate-800'
                }`}
              >
                {/* Checkbox toggle & Task details */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskCompletion(task)}
                    className="mt-0.5 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold text-slate-100 truncate ${
                          task.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Priority Tag */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isHigh
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : isMedium
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Category Badge */}
                      <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-800/70 border border-slate-700/50 rounded-md px-2 py-0.5">
                        <Tag className="w-2.5 h-2.5 mr-1 text-slate-500" />
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: Edit & Delete */}
                <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete from Firestore"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
