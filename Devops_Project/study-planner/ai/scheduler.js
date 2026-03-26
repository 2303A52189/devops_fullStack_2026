/**
 * AI Study Planner Engine
 * Implements priority-based intelligent scheduling using:
 * - Weighted scoring (deadline urgency, difficulty, priority)
 * - Cognitive load balancing
 * - Spaced repetition recommendations
 * - Dynamic rescheduling for missed/delayed tasks
 */

const PRIORITY_WEIGHTS = { critical: 4, high: 3, medium: 2, low: 1 };
const DIFFICULTY_WEIGHTS = { expert: 4, hard: 3, medium: 2, easy: 1 };
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Calculate AI priority score for a task
 * Score = (deadline_urgency * 0.4) + (priority_weight * 0.3) + (difficulty_weight * 0.2) + (estimated_hours_factor * 0.1)
 */
function calculateAIScore(task) {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const daysLeft = Math.max(0.5, (deadline - now) / (1000 * 60 * 60 * 24));

  const urgencyScore = Math.min(10, 10 / daysLeft); // Higher score = more urgent
  const priorityScore = (PRIORITY_WEIGHTS[task.priority] || 2) * 2.5;
  const difficultyScore = (DIFFICULTY_WEIGHTS[task.difficulty] || 2) * 2.5;
  const hoursScore = Math.min(10, task.estimatedHours / 2);

  const totalScore = (urgencyScore * 0.4) + (priorityScore * 0.3) + (difficultyScore * 0.2) + (hoursScore * 0.1);
  return Math.round(totalScore * 10) / 10;
}

/**
 * Generate personalized timetable
 * @param {Object} params - { subjects, deadlines, dailyHours, difficulty, startDate }
 * @returns {Array} - Array of scheduled study blocks
 */
function generateTimetable(params) {
  const { subjects, dailyHours, startDate } = params;
  const schedule = [];
  const start = startDate ? new Date(startDate) : new Date();

  // Sort subjects by AI score (deadline urgency + difficulty)
  const scoredSubjects = subjects.map(s => ({
    ...s,
    score: calculateAIScore(s)
  })).sort((a, b) => b.score - a.score);

  let currentDate = new Date(start);
  let remainingHoursToday = dailyHours;
  let dayIndex = 0;

  for (const subject of scoredSubjects) {
    let hoursLeft = subject.estimatedHours;

    while (hoursLeft > 0) {
      // Skip weekends if study hours are low (optional: configurable)
      const dayOfWeek = currentDate.getDay();

      const sessionHours = Math.min(hoursLeft, remainingHoursToday, 3); // Max 3hr per session
      if (sessionHours <= 0) {
        dayIndex++;
        currentDate = new Date(start);
        currentDate.setDate(start.getDate() + dayIndex);
        remainingHoursToday = dailyHours;
        continue;
      }

      const sessionStart = new Date(currentDate);
      sessionStart.setHours(9 + (dailyHours - remainingHoursToday)); // Start from 9 AM

      schedule.push({
        date: new Date(currentDate),
        dayName: DAY_NAMES[dayOfWeek],
        subject: subject.subject,
        topic: subject.topic || subject.subject,
        startTime: formatTime(sessionStart.getHours(), 0),
        endTime: formatTime(sessionStart.getHours() + Math.ceil(sessionHours), 0),
        duration: sessionHours,
        priority: subject.priority || 'medium',
        difficulty: subject.difficulty || 'medium',
        aiScore: subject.score,
        type: getSessionType(subject, hoursLeft, subject.estimatedHours),
        tips: getStudyTips(subject)
      });

      hoursLeft -= sessionHours;
      remainingHoursToday -= sessionHours;

      if (remainingHoursToday <= 0) {
        dayIndex++;
        currentDate = new Date(start);
        currentDate.setDate(start.getDate() + dayIndex);
        remainingHoursToday = dailyHours;
      }
    }
  }

  return schedule.sort((a, b) => a.date - b.date);
}

/**
 * Determine session type based on progress
 */
function getSessionType(subject, hoursLeft, totalHours) {
  const progress = 1 - (hoursLeft / totalHours);
  if (progress === 0) return 'Introduction';
  if (progress < 0.3) return 'Core Learning';
  if (progress < 0.7) return 'Practice';
  if (progress < 0.9) return 'Review';
  return 'Revision';
}

/**
 * Get AI study tips based on subject/difficulty
 */
function getStudyTips(subject) {
  const tips = {
    easy: ['Use active recall', 'Create summary notes', 'Quiz yourself'],
    medium: ['Break into smaller chunks', 'Use the Pomodoro technique', 'Draw concept maps'],
    hard: ['Spaced repetition is key', 'Teach to learn (Feynman technique)', 'Focus on fundamentals first'],
    expert: ['Dedicate uninterrupted blocks', 'Solve practice problems', 'Seek peer review']
  };
  const difficulty = subject.difficulty || 'medium';
  const allTips = tips[difficulty] || tips.medium;
  return allTips[Math.floor(Math.random() * allTips.length)];
}

/**
 * Smart rescheduling: redistribute missed/delayed tasks
 */
function rescheduleOverdueTasks(tasks, dailyHours) {
  const now = new Date();
  const overdue = tasks.filter(t => t.status === 'pending' && new Date(t.deadline) < now);
  const upcoming = tasks.filter(t => t.status === 'pending' && new Date(t.deadline) >= now);

  // Re-score all tasks with new urgency
  const allTasks = [...overdue, ...upcoming].map(t => ({
    ...t.toObject(),
    aiScore: calculateAIScore(t),
    isOverdue: new Date(t.deadline) < now
  })).sort((a, b) => b.aiScore - a.aiScore);

  return allTasks;
}

/**
 * Recommend next task to study
 */
function getNextRecommendation(tasks) {
  if (!tasks || tasks.length === 0) return null;

  const pending = tasks
    .filter(t => t.status === 'pending' || t.status === 'in-progress')
    .map(t => ({ ...t.toObject ? t.toObject() : t, aiScore: calculateAIScore(t) }))
    .sort((a, b) => b.aiScore - a.aiScore);

  if (pending.length === 0) return null;

  const top = pending[0];
  return {
    task: top,
    reason: getRecommendationReason(top),
    suggestion: getStudyTips(top),
    estimatedFocusTime: Math.min(top.estimatedHours, 2) // Max 2 hours recommended
  };
}

/**
 * Get human-readable recommendation reason
 */
function getRecommendationReason(task) {
  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return '🚨 This task is overdue! Prioritize immediately.';
  if (daysLeft === 1) return '⏰ Due tomorrow — start now to finish on time!';
  if (daysLeft <= 3) return `📅 Only ${daysLeft} days left — high urgency.`;
  if (task.priority === 'critical') return '🔴 Critical priority task assigned.';
  if (task.priority === 'high') return '🟠 High priority — schedule soon.';
  if (task.difficulty === 'expert' || task.difficulty === 'hard') return '🧠 Complex topic — give it focused attention.';
  return `📚 Balanced recommendation based on your schedule.`;
}

/**
 * Calculate spaced repetition intervals (Leitner system simplified)
 */
function getSpacedRepetitionSchedule(completedTasks) {
  const intervals = [1, 3, 7, 14, 30]; // days
  return completedTasks.map(task => {
    const completedAt = new Date(task.completedAt || task.updatedAt);
    const reviewLevel = task.reviewCount || 0;
    const nextReview = new Date(completedAt);
    nextReview.setDate(completedAt.getDate() + (intervals[Math.min(reviewLevel, intervals.length - 1)]));
    return {
      task: task,
      nextReview,
      isDue: nextReview <= new Date(),
      interval: intervals[Math.min(reviewLevel, intervals.length - 1)]
    };
  }).filter(r => r.isDue);
}

/**
 * Generate weekly study plan
 */
function generateWeeklyPlan(tasks, dailyHours) {
  const week = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));

    // Get tasks due this week, prioritized by AI score
    const dayTasks = tasks
      .filter(t => t.status !== 'completed')
      .map(t => ({ ...t.toObject ? t.toObject() : t, aiScore: calculateAIScore(t) }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3); // Max 3 tasks per day

    week.push({
      date: new Date(day),
      dayName: DAY_NAMES[day.getDay()],
      dateStr: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: i === 0,
      tasks: dayTasks,
      totalHours: dailyHours,
      allocatedHours: dayTasks.reduce((sum, t) => sum + Math.min(t.estimatedHours / 7, 2), 0).toFixed(1)
    });
  }

  return week;
}

/**
 * Format time helper
 */
function formatTime(hours, minutes) {
  const h = hours % 24;
  const ampm = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  return `${displayH}:${m} ${ampm}`;
}

module.exports = {
  calculateAIScore,
  generateTimetable,
  rescheduleOverdueTasks,
  getNextRecommendation,
  getSpacedRepetitionSchedule,
  generateWeeklyPlan,
  getStudyTips,
  getRecommendationReason
};
