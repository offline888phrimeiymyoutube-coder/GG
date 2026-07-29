import React, { useState } from 'react';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Task, OperationType } from '../types';
import { Plus, X, Tag, AlertCircle, Save } from 'lucide-react';

interface TaskFormProps {
  existingTask?: Task | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ existingTask, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(existingTask ? existingTask.title : '');
  const [description, setDescription] = useState(existingTask ? existingTask.description : '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    existingTask ? existingTask.priority : 'medium'
  );
  const [category, setCategory] = useState(existingTask ? existingTask.category : 'General');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to save tasks.');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    if (trimmedTitle.length > 200) {
      setError('Title cannot exceed 200 characters.');
      return;
    }

    if (description.length > 1000) {
      setError('Description cannot exceed 1000 characters.');
      return;
    }

    const trimmedCategory = category.trim() || 'General';
    if (trimmedCategory.length > 50) {
      setError('Category cannot exceed 50 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const path = 'tasks';
      if (existingTask) {
        // Update task
        const taskRef = doc(db, 'tasks', existingTask.id);
        await updateDoc(taskRef, {
          title: trimmedTitle,
          description: description.trim(),
          priority,
          category: trimmedCategory,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new task with alphanumeric ID matching isValidId regex
        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const taskRef = doc(db, 'tasks', taskId);

        await setDoc(taskRef, {
          userId: user.uid,
          title: trimmedTitle,
          description: description.trim(),
          completed: false,
          priority,
          category: trimmedCategory,
          createdAt: serverTimestamp(),
        });
      }

      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('General');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error saving task to Firestore:', err);
      try {
        handleFirestoreError(
          err,
          existingTask ? OperationType.UPDATE : OperationType.CREATE,
          'tasks'
        );
      } catch (formattedErr: any) {
        setError('Failed to save task: ' + (formattedErr.message || 'Permission denied'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
          {existingTask ? <Save className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
          <span>{existingTask ? 'Edit Firestore Task' : 'Add New Task'}</span>
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Title <span className="text-amber-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Configure Firebase Authentication"
          maxLength={200}
          required
          className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-colors"
        />
        <div className="text-[10px] text-slate-500 text-right mt-1">
          {title.length}/200
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed task notes or documentation..."
          rows={3}
          maxLength={1000}
          className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-colors"
        />
        <div className="text-[10px] text-slate-500 text-right mt-0.5">
          {description.length}/1000
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Priority Level
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Category
          </label>
          <div className="relative">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal"
              maxLength={50}
              className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-xs font-bold rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {submitting ? 'Saving to Firestore...' : existingTask ? 'Update Task' : 'Save to Firestore'}
        </button>
      </div>
    </form>
  );
};
