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
  currentBoardName = document.querySelector('h2'),
  noAccBtn = document.querySelector('.no-acc');

window.onload = () => {
  if (getUser(JSON.parse(localStorage.getItem('userId')))) loadContent();
  else {
    noAccBtn.style.display = 'block';
    accounts.style.cssText += 'opacity:.6; pointer-events:none;';
    boards.style.cssText += 'opacity:.6; pointer-events:none;';
    currentBoardName.style.opacity = '0';
  }
}

document.body.addEventListener('click', e => {
  if (boardsList.classList.contains('active') && !e.target.closest('.boards')) {
    boardsList.classList.remove('active');
  }
  if (profileList.classList.contains('active') && !e.target.closest('.account')) {
    profileList.classList.remove('active');
  }
})

boards.addEventListener('click', e => {
  if (e.target === boardsBtn || e.target.closest('.tracking-wide') === boardsBtn) {
    boardsList.classList.toggle('active');
  }
});

profileBtn.addEventListener('click', () => {
  profileList.classList.toggle('active');
});

function showLoading(ele, fun) {
  const newSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="inline-block animate-spin" fill="#FFFFFF"><path d="M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480.5-80Q398-80 325-111.5Z"/></svg>',
    oldSvg = ele.querySelector('svg');

  oldSvg.replaceWith(newSvg);

  fun();

  newSvg.replaceWith(oldSvg)
}

function loadContent() {
  const defaultMainHTML = `
    <div
        class="list p-3 bg-[hsl(from_var(--clr-accent-400)_h_s_l_/_.2)] grid min-h-[10rem] max-h-fit rounded-md border-2 border-green-100/20"
      >
        <h3
          class="flex items-center self-start cursor-grab border-b border-b-white pb-2"
        >
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
          Todo
        </h3>
        <ul class="items">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <button
          class="add-card flex items-center p-2 justify-center max-h-fit self-end"
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
      </div>

      <div
        class="list p-3 bg-[hsl(from_var(--clr-accent-400)_h_s_l_/_.2)] grid min-h-[10rem] max-h-fit rounded-md border-2 border-green-100/20"
      >
        <h3
          class="flex items-center self-start cursor-grab border-b border-b-white pb-2"
        >
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
          In Progress
        </h3>
        <ul class="items">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <button
          class="add-card flex items-center p-2 justify-center max-h-fit self-end"
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
      </div>

      <div
        class="list p-3 bg-[hsl(from_var(--clr-accent-400)_h_s_l_/_.2)] grid min-h-[10rem] max-h-fit rounded-md border-2 border-green-100/20"
      >
        <h3
          class="flex items-center self-start cursor-grab border-b border-b-white pb-2"
        >
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
          Done
        </h3>
        <ul class="items">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <button
          class="add-card flex items-center p-2 justify-center max-h-fit self-end"
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
      </div>

      <button
        class="add-list flex items-center p-2 bg-[hsl(from_var(--clr-accent-400)_h_s_l_/_.2)] gap-1 max-h-fit rounded-md border-2 border-green-100/20 justify-center"
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
      </button>`,
    boardListItem = `            <li>
              <span class="block max-w-[180px] truncate">Default Board</span>
              <button
                class="*:fill-white transition-colors hover:*:fill-zinc-300 relative more-setting"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  aria-label="More Setting"
                >
                  <path
                    d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"
                  />
                </svg>
              </button>
            </li>`;
  mainContainer.innerHTML = defaultMainHTML;
}