import { boards as boardsData, users, saveBoard, saveUser, changeSectionsOrder, changeNodeOrderInSameSec, changeNodeSec } from "./boards.js";
import { addNode, addSection, addBoard, addUser } from "./boards.js";
import { deleteBoard, deleteNode, deleteSection, deleteUser } from "./boards.js";
import { getBoard, getNode, getSection, getUser } from "./boards.js";

const boards = document.querySelector('.boards'),
  accounts = document.querySelector('.account'),
  boardsList = boards.querySelector('.board-list'),
  boardsBtn = boards.querySelector('.toggle-boards'),
  profileBtn = accounts.querySelector('.profile-icon'),
  profileList = accounts.querySelector('.profile'),
  mainContainer = document.querySelector('.main-content'),
  h2 = document.querySelector('h2'),
  currentBoardName = document.querySelector('.current-board-name'),
  noAccBtn = document.querySelector('.no-acc'),
  logout = document.querySelector('.logout');



let activeBoardId;
window.onload = () => {
  if (users.activeUserId !== null) {

    activeBoardId = users.activeBoardId;
    profileBtn.textContent = users.usersData[users.activeUserId]?.userName[0];

    if (activeBoardId !== null) {

      showSkeletonLoading(loadContent, users.activeUserId, activeBoardId)
      const boardName = boardsData.boardsData[activeBoardId]?.title ?? null;

      if (boardName)
        currentBoardName.textContent = boardName;

    } else {
    noAccBtn.textContent = 'No boards to show. Please add or Select another one.';
    noAccBtn.style.display = 'block';
    noAccBtn.style.backgroundColor = 'transparent';
    noAccBtn.style.cursor = 'text';
    noAccBtn.onclick = null;
    h2.style.opacity = '0';
    }

  } else {
    noAccBtn.style.display = 'block';
    accounts.style.cssText += 'opacity:.6; pointer-events:none;';
    boards.style.cssText += 'opacity:.6; pointer-events:none;';
    h2.style.opacity = '0';
  }
}

document.body.addEventListener('click', e => {
  // Close Active Tooltips
  if (boardsList.classList.contains('active') && !e.target.closest('.boards')) {
    boardsList.classList.remove('active');
    boardsList.querySelectorAll('.tooltip.active').forEach(tooltip => tooltip.classList.remove('active'));
  }

  // Close Profile List
  else if (profileList.classList.contains('active') && !e.target.closest('.account')) {
    profileList.classList.remove('active');
  }

  // Delete Board
  else if (e.target.classList.contains('delete-board') || e.target.closest('.delete-board')) {
    const boardItem = e.target.closest('.boardItem'),
    {boardId} = e.target.closest('.boardItem').dataset;

    deleteBoard(boardId);
    boardsList.classList.remove('active');
    boardItem.remove();

    if (users.activeBoardId === boardId) {
      user.activeBoardId = null;
      saveUser();
    }

    if (!boards.boardsCount) {
      boardsList.innerHTML = '<li class="no-boards cursor-auto">No boards to show.</li>';
      mainContainer.innerHTML = '<p class="justify-self-center">No boards to show, please add one.</p>';
      h2.style.display = 'none';
    }
  }

  // Rename
  
})

boards.addEventListener('click', e => {
  if (e.target === boardsBtn || e.target.closest('.tracking-wide') === boardsBtn) {
    boardsList.classList.toggle('active');
  }
});

profileBtn.addEventListener('click', () => {
  profileList.classList.toggle('active');
});

boardsList.addEventListener('click', e => {
  const boardItem = e.target.closest('.boardItem') ? e.target.closest('.boardItem') : e.target.classList.contains('boardItem') ? e.target : null;
  if (boardItem) {

    if (!(e.target.classList.contains('more-setting') || e.target.closest('.more-setting'))) {

      const itemBoardId = +boardItem.dataset.boardId;
      if (itemBoardId === activeBoardId) return;
      else {
        users.activeBoardId = itemBoardId;
        saveUser();
        activeBoardId = itemBoardId;
        showSkeletonLoading(displayBoard, activeBoardId);
      }

    } else {
      e.target.closest('.more-setting') ? e.target.closest('.more-setting').nextElementSibling.classList.toggle('active') : e.target.nextElementSibling.classList.toggle('active');
    }
  }
});

document.body.addEventListener('click', e => {
  if( e.target === logout || e.target.closest('.logout')) logoutFromAcc();
});

function logoutFromAcc() {
  users.activeUserId = null;
  users.activeBoardId = null;
  saveUser();

  window.location.href = './sign-in.html?act=cr';
}

function showLoading(ele, fun) {
  const newSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="inline-block animate-spin" fill="#FFFFFF"><path d="M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480.5-80Q398-80 325-111.5Z"/></svg>',
    oldSvg = ele.querySelector('svg');

  oldSvg.replaceWith(newSvg);

  fun();

  newSvg.replaceWith(oldSvg)
}

function loadContent(userId, activeBoardId) {
  const userBoards = boardsData.boardsData.filter(board => board.userId === userId);
  if (!userBoards.length) return;

  const currentBoardId = activeBoardId;

  displayBoard(currentBoardId);
  displayBoardItems(userId, userBoards)
}

function displayBoard(boardId) {
  const board = boardsData.boardsData[boardId];
  let fullMainHTML = '';

  board.content.forEach(sect => {
    const defaultMainHTML = `
      <div
          class="list p-3 max-w-88 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] grid min-h-40 rounded-md border-2 border-green-100/20"
          data-section-id="${sect.id}"
        >
          <h3
            class="flex items-center justify-between cursor-grab border-b border-b-white pb-2 max-h-fit capitalize"
          >
            <div class="flex items-center">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#FFFFFF"
              >
                <path
                  d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z"
                />
              </svg>
              ${sect.title}
            </div>

            <button class="more-opt flex items-center cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
                aria-label="More Setting"
              >
                <path
                  d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"
                />
              </svg>
            </button>
          </h3>
          <ul class="items p-2">

          </ul>
          <button
            class="add-card flex items-center p-2 justify-center max-h-fit self-end cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#FFFFFF"
            >
              <path
                d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
              />
            </svg>
            Add a card
          </button>
        </div>`;
    fullMainHTML += defaultMainHTML;
  });

  fullMainHTML += `
      <button
        class="add-list flex items-center p-2 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] gap-1 max-h-fit rounded-md border-2 border-green-100/20 justify-center cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#FFFFFF"
        >
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
        </svg>
        Add new column
      </button>`;

  mainContainer.innerHTML = fullMainHTML;
}

function displayBoardItems(userId, boardsDa = '') {
  let fullBoards = '',
    boardsJson,
    boardsAlt;

  if (!boardsDa) boardsAlt = boardsData.boardsData.filter(board => board.userId === userId);

  boardsJson = boardsDa || boardsAlt;

  boardsJson.forEach(board => {
    const boardListItem = `
            <li data-board-id="${board.boardId}" class="boardItem" title="${board.title}">
              <span class="block max-w-45 truncate self-center">${board.title}</span>
              <button
                class="*:fill-white relative more-setting"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  aria-label="More Setting"
                  class="cursor-pointer"
                >
                  <path
                    d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"
                  />
                </svg>
                </button>
                <div class="tooltip p-1 grid bg-zinc-600 *:cursor-pointer *:p-3 *:transition-colors *:[:hover]:bg-zinc-300/20 min-w-max absolute top-full -right-1 rounded-md transition-transform scale-y-0 [&.active]:scale-y-100 origin-top">
                    <button class="rename-board flex items-center justify-between gap-1 min-w-30">
                    Rename
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                  </button>
                  <button class="delete-board flex items-center justify-between gap-1 min-w-30">
                    Delete
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                  </button>
                </div>
            </li>`;
    fullBoards += boardListItem;
  });

  boardsList.innerHTML = fullBoards;
}

function showSkeletonLoading(fn, ...args) {
  const cardHeights = ['h-14', 'h-11', 'h-16'];
  document.body.style.overflow = 'hidden';

  const skeletonSection = () => `
    <div class="list p-3 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] grid min-h-40 max-h-fit rounded-md border-2 border-green-100/20">

      <div class="flex items-center justify-between border-b border-b-white/10 pb-2">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-white/10 skeleton-shine"></div>
          <div class="h-3.5 w-24 rounded bg-white/10 skeleton-shine"></div>
        </div>
        <div class="w-6 h-6 rounded-full bg-white/10 skeleton-shine"></div>
      </div>

      <ul class="items p-2 flex flex-col gap-2">
        ${cardHeights.map(h => `
          <li class="${h} rounded-md bg-white/10 skeleton-shine"></li>
        `).join('')}
      </ul>

      <div class="h-9 mt-1 rounded-md bg-white/10 skeleton-shine self-end"></div>
    </div>`;

  mainContainer.innerHTML = Array.from({ length: 8 }, skeletonSection).join('');

  setTimeout(() => {
    fn(...args);
    document.body.style.overflow = 'visible';
  }, 1000)
}
