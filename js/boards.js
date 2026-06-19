export { users, saveUser, getUser, addUser, deleteUser } from "./users.js";
import { users } from "./users.js";

export const boards = JSON.parse(localStorage.getItem('boards')) ?? {
  boardsCount: 0,
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

export function addNode(boardId, sectionId, title, priority = 'low', desc = '', dueDate = '', tags = '') {
  const section = boards.boardsData[boardId].content.find(sec => sec.id === sectionId);
  section.nodes.push({
    nodeId: boards.nodesCount,
    sectionId,
    order: boards.nodesCount++,
    title,
    description: desc,
    priority,
    dueDate,
    tags
  });
  saveBoard();
}

export function deleteNode(boardId, sectionId, nodeId) {
  const section = boards.boardsData[boardId].content.find(sec => sec.id === sectionId);
  section.nodes.filter(node => node.nodeId !== nodeId);
  boards.nodesCount--;
  saveBoard();
}

export function getNode(boardId, sectionId, nodeId) {
  const section = boards.boardsData[boardId].content.find(sec => sec.id === sectionId);
  return section.nodes.find(node => node.nodeId === nodeId);
}

export function changeNodeOrderInSameSec(boardId, sectionId, replacedNodeId, replacedByNodeId) {
  let replacedByIndex, replacedIndex, replacedByNode, replacedNode;
  const section = boards.boardsData[boardId].content.find(sec => sec.id === sectionId),
  placeHolder = replacedByNode.order;

  section.nodes.forEach((node, ind) => {
    if (replacedByNode && replacedNode) return;
    else if (node.nodeId === replacedByNodeId) {
      replacedByIndex = ind;
      replacedByNode = node;
    } else if (node.id === replacedNodeId) {
      replacedIndex = ind;
      replacedNode = node;
    }
  })

  // Change order property
  replacedByNode.order = replacedNode.order;
  replacedNode.order = placeHolder;

  // Change Real Positions In Array
  section.nodes.splice(replacedByIndex, 1, replacedNode);
  section.nodes.splice(replacedIndex, 1, replacedByNode);
}

export function changeNodeSec(boardId, oldSecId, newSecId, nodeId) {
  let oldSection, newSection;
  boards.boardsData[boardId].content.forEach(sec => {
    if (oldSection && newSection) return;
    else if (sec.id === oldSecId) oldSection = sec;
    else if (sec.id === newSecId) newSection = sec;
  });
  const draggedNode = oldSection.find(node => node.id === nodeId)

  // Remove Node From The Old Section
  oldSection.nodes.filter(node => node !== draggedNode);
  newSection.push(draggedNode);
}

export function addSection(boardId, title) {
  boards.boardsData[boardId].content.push({
    title,
    id: boards.sectionsCount,
    order: boards.sectionsCount++,
    nodes: []
  });
  saveBoard();
}

export function deleteSection(boardId, sectionId) {
  const sectionIndex = boards.boardsData[boardId].content.forEach((sec, ind) =>{
    if (sec.id === sectionId) return ind;
  });
  boards.boardsData[boardId].content.splice(sectionIndex, 1);
  boards.sectionsCount--;
  saveBoard();
}

export function getSection(boardId, sectionId) {
  return boards.boardsData[boardId].content.find(sec => sec.id === sectionId);
}

export function changeSectionsOrder(boardId, replacedSectionId, replacedBySectionId) {
  let replacedByIndex, replacedIndex, replacedBySec, replacedSec;
  const placeHolder = replacedBySec.order;

  boards.boardsData[boardId].content.forEach((sec, ind) => {
    if (replacedBySec && replacedSec) return;
    else if (sec.id === replacedBySectionId) {
      replacedByIndex = ind;
      replacedBySec = sec;
    } else if (sec.id === replacedSectionId) {
      replacedIndex = ind;
      replacedSec = sec;
    }
  });

  // Change order property
  replacedBySec.order = replacedSec.order;
  replacedSec.order = placeHolder;

  // Change Real Positions In Array
  boards.boardsData[boardId].content.splice(replacedByIndex, 1, replacedSec);
  boards.boardsData[boardId].content.splice(replacedIndex, 1, replacedBySec);
  saveBoard();
}

export function addBoard(userId, title) {
  boards.boardsData.unshift({
    userId,
    boardId: boards.boardsCount,
    title,
    content: []
  });
  saveBoard();
  addSection(boards.boardsCount, 'Todo');
  addSection(boards.boardsCount, 'In Progress');
  addSection(boards.boardsCount++, 'Done');
}

export function deleteBoard(boardsId) {
  boards.boardsData.splice(boardsId, 1);
  boards.boardsCount--;
  if (users.activeBoardId === boardsId) users.activeBoardId = null;
  saveBoard();
}

export function getBoard(boardId) {
  return boards.boardsData[boardId];
}

export function saveBoard() {
  localStorage.setItem('boards', JSON.stringify(boards));
}