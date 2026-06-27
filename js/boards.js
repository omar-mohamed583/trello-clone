export { users, saveUser, getUser, addUser, deleteUser } from "./users.js";
import { users } from "./users.js";

export const boards = JSON.parse(localStorage.getItem('boards')) ?? {
  boardsCount: 0,
  nextBoardId: 0,
  sectionsCount: 0,
  nodesCount: 0,
  boardsData: [
    // {
      // userId: ,
      // boardId: 123,
      // title: 'default',
      // content: [              // Sections
      //   {
      //     title: 'Todo',
      //     id: 1234,
      //     order: 0,
      //     nodes: [            // Nodes
      //       {
      //         nodeId: 1234,
      //         sectionId: 1234,
      //         order: 0,
      //         title: '',
      //         description: '',
      //         priority: 'high',
      //         dueDate: '5-3-2026',
      //         tags: ['Frontend', 'Backend', 'Data']
      //       }
      //     ]
      //   }
      // ],
    // }
  ]
}

if (boards.nextBoardId === undefined) {
  boards.nextBoardId = boards.boardsData.length
    ? Math.max(...boards.boardsData.map(board => board.boardId)) + 1
    : 0;
}

if (boards.boardsCount === undefined) {
  boards.boardsCount = boards.boardsData.length;
}

function getBoardIndex(boardId) {
  return boards.boardsData.findIndex(board => board.boardId === boardId);
}

function getBoardById(boardId) {
  const index = getBoardIndex(boardId);
  return index === -1 ? null : boards.boardsData[index];
}

export function addNode(boardId, sectionId, title, priority = 'low', desc = '', dueDate = '', ...tags) {
  const boardIndex = getBoardIndex(boardId);
  const section = boards.boardsData[boardIndex]?.content.find(sec => sec.id === sectionId);
  if (!section) return null;

  section.nodes.push({
    nodeId: boards.nodesCount++,
    sectionId,
    order: section.nodes.length + 1,
    title,
    description: desc,
    priority,
    dueDate,
    tags: [...tags]
  });
  saveBoard();
  return --boards.nodesCount;
}

export function deleteNode(boardId, sectionId, nodeId) {
  const boardIndex = getBoardIndex(boardId);
  const section = boards.boardsData[boardIndex]?.content.find(sec => sec.id === sectionId);
  if (!section) return;

  section.nodes = section.nodes.filter(node => node.nodeId !== nodeId);
  boards.nodesCount--;
  saveBoard();
}

export function getNode(boardId, sectionId, nodeId) {
  const boardIndex = getBoardIndex(boardId);
  const section = boards.boardsData[boardIndex]?.content.find(sec => sec.id === sectionId);
  return section?.nodes.find(node => node.nodeId === nodeId);
}

export function changeNodeOrderInSameSec(boardId, sectionId, replacedNodeId, replacedByNodeId) {
  const boardIndex = getBoardIndex(boardId);
  const section = boards.boardsData[boardIndex]?.content.find(sec => sec.id === sectionId);
  if (!section) return;

  let replacedByIndex, replacedIndex, replacedByNode, replacedNode;

  section.nodes.forEach((node, ind) => {
    if (replacedByNode && replacedNode) return;
    else if (node.nodeId === replacedByNodeId) {
      replacedByIndex = ind;
      replacedByNode = node;
    } else if (node.nodeId === replacedNodeId) {
      replacedIndex = ind;
      replacedNode = node;
    }
  });

  if (!replacedByNode || !replacedNode) return;

  const placeHolder = replacedByNode.order;
  replacedByNode.order = replacedNode.order;
  replacedNode.order = placeHolder;

  section.nodes.splice(replacedByIndex, 1, replacedNode);
  section.nodes.splice(replacedIndex, 1, replacedByNode);
}

export function changeNodeSec(boardId, oldSecId, newSecId, nodeId) {
  const boardIndex = getBoardIndex(boardId);
  const board = boards.boardsData[boardIndex];
  if (!board) return;

  const oldSection = board.content.find(sec => sec.id === oldSecId);
  const newSection = board.content.find(sec => sec.id === newSecId);
  if (!oldSection || !newSection) return;

  const draggedNode = oldSection.nodes.find(node => node.nodeId === nodeId);
  if (!draggedNode) return;

  oldSection.nodes = oldSection.nodes.filter(node => node.nodeId !== nodeId);
  newSection.nodes.push(draggedNode);
}

export function addSection(boardId, title) {
  const boardIndex = getBoardIndex(boardId);
  const board = boards.boardsData[boardIndex];
  if (!board) return null;

  board.content.push({
    title,
    id: boards.sectionsCount++,
    order: board.content.length + 1,
    nodes: []
  });
  saveBoard();
  return boards.sectionsCount - 1;
}

export function deleteSection(boardId, sectionId) {
  const boardIndex = getBoardIndex(boardId);
  const board = boards.boardsData[boardIndex];
  if (!board) return;

  const sectionIndex = board.content.findIndex(sec => sec.id === sectionId);
  if (sectionIndex === -1) return;

  boards.nodesCount -= board.content[sectionIndex].nodes.length;
  board.content.splice(sectionIndex, 1);
  boards.sectionsCount--;
  saveBoard();
}

export function getSection(boardId, sectionId) {
  const boardIndex = getBoardIndex(boardId);
  const board = boards.boardsData[boardIndex];
  return board?.content.find(sec => sec.id === sectionId);
}

export function changeSectionsOrder(boardId, replacedSectionId, replacedBySectionId) {
  const boardIndex = getBoardIndex(boardId),
    board = getBoardById(boardId)
  if (!board) return console.log('No Board From Change Sections.');

  let replacedByIndex, replacedIndex, replacedBySec, replacedSec;

  board.content.forEach((sec, ind) => {
    if (replacedBySec && replacedSec) return;
    else if (sec.id === +replacedBySectionId) {
      replacedByIndex = ind;
      replacedBySec = sec;
    } else if (sec.id === +replacedSectionId) {
      replacedIndex = ind;
      replacedSec = sec;
    }
  });

  if (!replacedBySec || !replacedSec) return console.log('no Sect From Ch Sections');

  const placeHolder = replacedBySec.order;
  replacedBySec.order = replacedSec.order;
  replacedSec.order = placeHolder;

  board.content.splice(replacedByIndex, 1, replacedSec);
  board.content.splice(replacedIndex, 1, replacedBySec);
  saveBoard();
}

export function addBoard(userId, title) {
  const boardId = boards.nextBoardId++;
  boards.boardsCount++;
  boards.boardsData.unshift({
    userId,
    boardId,
    title,
    content: []
  });
  saveBoard();
  addSection(boardId, 'Todo');
  addSection(boardId, 'In Progress');
  addSection(boardId, 'Done');
  return boardId;
}

export function deleteBoard(boardsId) {
  const boardIndex = getBoardIndex(boardsId);
  if (boardIndex === -1) return console.log('board not found To Delete');

  const sectionsCount = boards.boardsData.find(board => board.boardId === boardsId).content.length;
  boards.sectionsCount -= sectionsCount;
  boards.boardsData.splice(boardIndex, 1);
  boards.boardsCount--;
  if (users.activeBoardId === +boardsId) users.activeBoardId = null;
  saveBoard();
}

export function getBoard(boardId) {
  return getBoardById(boardId);
}

export function saveBoard() {
  localStorage.setItem('boards', JSON.stringify(boards));
}