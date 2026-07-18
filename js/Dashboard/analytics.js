import { users, boards } from "../Data/boards.js";

export function createTasksAnalytics() {
  const userId = users.activeUserId,
    userBoards = boards.boardsData.filter(board => board.userId === userId);
  
  let highPriorityTasks = 0,
    normalPriorityTasks = 0,
    lowPriorityTasks = 0,
    totalTasks = 0,
    doneTasks = 0,
    inProgressTasks = 0,
    notStartedTasks = 0,
    othersStat = 0;

  // Count Tasks By Stat
  userBoards.forEach(board => board.content.forEach(sec => {
    if (sec.title === "Done") doneTasks += sec.nodes.length;
    else if (sec.title === "In Progress") inProgressTasks += sec.nodes.length;
    else if (sec.title === "Todo") notStartedTasks += sec.nodes.length;
    else othersStat += sec.length;
  }))

  // Count Tasks By Priority
  userBoards.forEach(board => board.content.forEach(sec => sec.nodes.forEach(node => {
    totalTasks++;
    if (node.priority === 'high') highPriorityTasks++;
    else if (node.priority === 'medium') normalPriorityTasks++;
    else lowPriorityTasks++;
  })));
  
  return {
    total: totalTasks,
    highPrioCount: highPriorityTasks,
    highPercent: +(highPriorityTasks / totalTasks * 100).toFixed(1),
    normalPrioCount: normalPriorityTasks,
    normalPercent: +(normalPriorityTasks / totalTasks * 100).toFixed(1),
    lowPrioCount: lowPriorityTasks,
    lowPercent: +(lowPriorityTasks / totalTasks * 100).toFixed(1),
    completedTasks: doneTasks,
    inProgTasks: inProgressTasks,
    notStartedTasks: notStartedTasks,
    othersStat: othersStat ? othersStat : 0,
    otherStatRate: othersStat ? +(othersStat / totalTasks * 100).toFixed(1) : 0
  }
}

export function createBoardAnalytics() {
  const boardsCount = boards.boardsData.length,
    userId = users.activeUserId,
    userBoards = boards.boardsData.filter(board => board.userId === userId);

  let eachBoardTasksCount = [];

  userBoards.forEach(board => {
    let count = 0;

    board.content.forEach(sec => count += sec.nodes.length);

    eachBoardTasksCount.push(count);
  });

  return {
    totalBoards: boardsCount,
    mostTasksPerBoard: Math.max(...eachBoardTasksCount)
  }
}

export function parseDueDate(dueDate) {
  if (!dueDate) return null;
  const parts = dueDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [month, day, year] = parts;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function createDateAnalytics() {
  const userId = users.activeUserId,
    userBoards = boards.boardsData.filter(board => board.userId === userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todayCount = 0,
    upcomingCount = 0;

  userBoards.forEach(board => board.content.forEach(sec => {
    if (sec.title === 'Done') return; // completed tasks shouldn't count as due
    sec.nodes.forEach(node => {
      const due = parseDueDate(node.dueDate);
      if (!due) return;

      if (due.getTime() === today.getTime()) todayCount++;
      else if (due.getTime() > today.getTime()) upcomingCount++;
    });
  }));

  return { todayCount, upcomingCount };
}

export function getTasksDueOn(date) {
  const userId = users.activeUserId,
    userBoards = boards.boardsData.filter(board => board.userId === userId);

  let count = 0;
  userBoards.forEach(board => board.content.forEach(sec => {
    sec.nodes.forEach(node => {
      const due = parseDueDate(node.dueDate);
      if (due && due.getTime() === date.getTime()) count++;
    });
  }));
  return count;
}