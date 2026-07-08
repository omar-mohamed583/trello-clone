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

  const newNodeId = boards.nodesCount++;
  section.nodes.push({
    nodeId: newNodeId,
    sectionId,
    order: section.nodes.length + 1,
    title,
    description: desc,
    priority,
    dueDate,
    tags: [...tags]
  });
  saveBoard();
  return newNodeId;
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

export function changeNodePosition(boardId, oldSecId, newSecId, nodeId) {
  const boardIndex = getBoardIndex(boardId);
  const board = boards.boardsData[boardIndex];
  if (!board) return;

  const oldSection = board.content.find(sec => sec.id === oldSecId);
  const newSection = board.content.find(sec => sec.id === newSecId);
  if (!oldSection || !newSection) return console.error(`no Old Section: ${oldSection} Or New Section ${newSection}`);

  const draggedNode = oldSection.nodes.find(node => node.nodeId === nodeId);
  if (!draggedNode) return console.log('didnt Find Dragged Node In Boards!');

  oldSection.nodes = oldSection.nodes.filter(node => node.nodeId !== nodeId);
  draggedNode.sectionId = newSecId;
  draggedNode.order = newSection.nodes.length + 1;
  newSection.nodes.push(draggedNode);

  saveBoard();
}

export function swapNodesInSameSection(boardId, sectionId, nodeId1, nodeId2) {
  const board = getBoardById(boardId);
  if (!board) return;

  const section = board.content.find(sec => sec.id === sectionId);
  if (!section) return;

  const index1 = section.nodes.findIndex(n => n.nodeId === nodeId1);
  const index2 = section.nodes.findIndex(n => n.nodeId === nodeId2);

  if (index1 === -1 || index2 === -1) return;

  [section.nodes[index1], section.nodes[index2]] = [section.nodes[index2], section.nodes[index1]];

  saveBoard();
}

export function swapNodesBetweenSections(boardId, sec1Id, node1Id, sec2Id, node2Id) {
  const board = getBoardById(boardId);
  if (!board) return;

  const sec1 = board.content.find(s => s.id === sec1Id);
  const sec2 = board.content.find(s => s.id === sec2Id);
  if (!sec1 || !sec2) return;

  const node1 = sec1.nodes.find(n => n.nodeId === node1Id);
  const node2 = sec2.nodes.find(n => n.nodeId === node2Id);

  if (!node1 || !node2) return;

  sec1.nodes = sec1.nodes.filter(n => n.nodeId !== node1Id);
  sec2.nodes = sec2.nodes.filter(n => n.nodeId !== node2Id);

  node1.sectionId = sec2Id;
  node2.sectionId = sec1Id;

  sec2.nodes.push(node1);
  sec1.nodes.push(node2);

  saveBoard();
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