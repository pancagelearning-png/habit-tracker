import { withAuth, withoutAuth } from './_lib/adapter.js';
import * as authController from '../backend/controllers/authController.js';
import * as habitController from '../backend/controllers/habitsController.js';
import * as habitLogController from '../backend/controllers/habitLogsController.js';
import * as taskController from '../backend/controllers/tasksController.js';
import * as taskLogController from '../backend/controllers/taskLogsController.js';
import * as categoryController from '../backend/controllers/categoriesController.js';

export default async function handler(req, res) {
  const url = req.url.replace(/^\/api/, '');
  const method = req.method;

  // Auth routes
  if (url === '/v1/auth/signup' && method === 'POST') return withoutAuth(authController.signup)(req, res);
  if (url === '/v1/auth/login' && method === 'POST') return withoutAuth(authController.login)(req, res);
  if (url === '/v1/auth/logout' && method === 'POST') return withAuth(authController.logout)(req, res);
  if (url === '/v1/auth/me' && method === 'GET') return withAuth(authController.me)(req, res);
  if (url === '/v1/auth/change-password' && method === 'POST') return withAuth(authController.changePassword)(req, res);

  // Category routes
  if (url === '/v1/categories' && method === 'GET') return withAuth(categoryController.getCategories)(req, res);
  if (url === '/v1/categories' && method === 'POST') return withAuth(categoryController.createCategory)(req, res);
  if (url.match(/^\/v1\/categories\/[\w-]+$/) && method === 'GET') return withAuth(categoryController.getCategory)(req, res);
  if (url.match(/^\/v1\/categories\/[\w-]+$/) && method === 'PUT') return withAuth(categoryController.updateCategory)(req, res);
  if (url.match(/^\/v1\/categories\/[\w-]+$/) && method === 'DELETE') return withAuth(categoryController.deleteCategory)(req, res);

  // Habit routes
  if (url === '/v1/habits' && method === 'GET') return withAuth(habitController.getHabits)(req, res);
  if (url === '/v1/habits' && method === 'POST') return withAuth(habitController.createHabit)(req, res);
  if (url === '/v1/habits/today' && method === 'GET') return withAuth(habitController.getTodayHabits)(req, res);
  if (url.match(/^\/v1\/habits\/date\/[\w-]+$/) && method === 'GET') return withAuth(habitController.getHabitsByDate)(req, res);
  if (url.match(/^\/v1\/habits\/[\w-]+$/) && method === 'GET') return withAuth(habitController.getHabit)(req, res);
  if (url.match(/^\/v1\/habits\/[\w-]+$/) && method === 'PUT') return withAuth(habitController.updateHabit)(req, res);
  if (url.match(/^\/v1\/habits\/[\w-]+$/) && method === 'DELETE') return withAuth(habitController.deleteHabit)(req, res);
  if (url.match(/^\/v1\/habits\/[\w-]+\/archive$/) && method === 'PUT') return withAuth(habitController.archiveHabit)(req, res);
  if (url.match(/^\/v1\/habits\/[\w-]+\/stats$/) && method === 'GET') return withAuth(habitController.getHabitStats)(req, res);

  // Habit log routes
  if (url === '/v1/habit-logs' && method === 'GET') return withAuth(habitLogController.getHabitLogs)(req, res);
  if (url === '/v1/habit-logs' && method === 'POST') return withAuth(habitLogController.createHabitLog)(req, res);
  if (url.match(/^\/v1\/habit-logs\/date\/[\w-]+$/) && method === 'GET') return withAuth(habitLogController.getHabitLogsByDate)(req, res);
  if (url.match(/^\/v1\/habit-logs\/[\w-]+$/) && method === 'PUT') return withAuth(habitLogController.updateHabitLog)(req, res);
  if (url.match(/^\/v1\/habit-logs\/[\w-]+$/) && method === 'DELETE') return withAuth(habitLogController.deleteHabitLog)(req, res);

  // Task routes
  if (url === '/v1/tasks' && method === 'GET') return withAuth(taskController.getTasks)(req, res);
  if (url === '/v1/tasks' && method === 'POST') return withAuth(taskController.createTask)(req, res);
  if (url.match(/^\/v1\/tasks\/[\w-]+$/) && method === 'GET') return withAuth(taskController.getTask)(req, res);
  if (url.match(/^\/v1\/tasks\/[\w-]+$/) && method === 'PUT') return withAuth(taskController.updateTask)(req, res);
  if (url.match(/^\/v1\/tasks\/[\w-]+$/) && method === 'DELETE') return withAuth(taskController.deleteTask)(req, res);
  if (url.match(/^\/v1\/tasks\/[\w-]+\/archive$/) && method === 'PUT') return withAuth(taskController.archiveTask)(req, res);

  // Task log routes
  if (url === '/v1/task-logs' && method === 'GET') return withAuth(taskLogController.getTaskLogs)(req, res);
  if (url === '/v1/task-logs' && method === 'POST') return withAuth(taskLogController.createTaskLog)(req, res);
  if (url.match(/^\/v1\/task-logs\/date\/[\w-]+$/) && method === 'GET') return withAuth(taskLogController.getTaskLogsByDate)(req, res);
  if (url.match(/^\/v1\/task-logs\/[\w-]+$/) && method === 'PUT') return withAuth(taskLogController.updateTaskLog)(req, res);
  if (url.match(/^\/v1\/task-logs\/[\w-]+$/) && method === 'DELETE') return withAuth(taskLogController.deleteTaskLog)(req, res);

  // 404
  res.status(404).json({ error: 'Not found' });
}
