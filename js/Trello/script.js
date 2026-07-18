import { boards as boardsData, users, saveBoard, saveUser } from "../Data/boards.js";
import { addNode, addSection, addBoard, addUser } from "../Data/boards.js";
import { deleteBoard, deleteNode, deleteSection, deleteUser } from "../Data/boards.js";
import { getBoard, getNode, getSection } from "../Data/boards.js";

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
  logout = document.querySelector('.logout'),
  addBoardBtn = document.querySelector('.add-board');

let activeBoardId = users.activeBoardId;
window.onload = () => {
  if (users.activeUserId !== null) {

    profileBtn.textContent = users.usersData[users.activeUserId]?.userName[0];

    if (activeBoardId !== null) {

      showSkeletonLoading(loadContent, users.activeUserId, activeBoardId)
      const boardName = getBoard(activeBoardId)?.title ?? null;

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
    e.stopPropagation();

    const boardItem = e.target.closest('.boardItem'),
      { boardId } = boardItem.dataset,
      currentActiveBoardId = users.activeBoardId;

    deleteBoard(+boardId);
    boardsList.classList.remove('active');
    boardItem.remove();

    if (currentActiveBoardId === +boardId) {

      const anotherUserBoard = boardsData.boardsData.find(board => board.userId === users.activeUserId);

      if (anotherUserBoard) {
        users.activeBoardId = anotherUserBoard.boardId;
        activeBoardId = anotherUserBoard.boardId;
        displayBoard(anotherUserBoard.boardId, anotherUserBoard);
        currentBoardName.textContent = anotherUserBoard.title;

      } else {

        mainContainer.innerHTML = '<p class="justify-self-center">No boards to show, please add one.</p>';
        currentBoardName.textContent = '';
        users.activeBoardId = null;
        activeBoardId = null;
      }

      saveUser();
    }

    if (!boardsData.boardsData.length) {
      boardsList.innerHTML = '<li class="no-boards cursor-auto">No boards to show.</li>';
      mainContainer.innerHTML = '<p class="justify-self-center">No boards to show, please add one.</p>';
    }
  }

  // Rename
  else if (e.target.classList.contains('rename-board') || e.target.closest('.rename-board')) {
    const boardItem = e.target.closest('.boardItem'),
      { boardId } = boardItem.dataset,
      boardName = boardItem.querySelector('.truncate');

    document.querySelector('.tooltip.active').classList.toggle('active');
    boardName.contentEditable = 'true';
    boardName.focus();

    boardName.addEventListener('blur', () => {
      if (/[\p{L}\p{N}\s]+$/gu.test(boardName.textContent)) {
        const newName = boardName.textContent.trim();

        boardsData.boardsData.find(board => board.boardId === +boardId).title = newName;
        saveBoard();
        boardName.contentEditable = 'false';
        currentBoardName.textContent = newName;
      } else boardName.focus();
    });

    boardName.addEventListener('keydown', e => {
      if (e.key === "Enter" && /[\p{L}\p{N}\s]+$/gu.test(boardName.textContent)) {
        const newName = boardName.textContent.trim();

        boardsData.boardsData.find(board => board.boardId === +boardId).title = newName;
        saveBoard();
        boardName.contentEditable = 'false';

        currentBoardName.textContent = newName;
      }
    });
  }

  // Open Add Board Dialog
  else if (e.target === addBoardBtn || e.target.closest('.add-board')) {
    addingBoard.showModal();
  }

  // Add Section Name Field
  else if (e.target.classList.contains('add-field') || e.target.closest('.add-field')) {
    const sectsFieldsCont = document.getElementById('section-fields'),
      sectFieldHTML = `<div class="flex items-center gap-2">
              <input
                name="section"
                type="text"
                class="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                placeholder="Section name"
              />
              <button
                onclick="this.parentElement.remove()"
                type="button"
                class="remove-section h-8 flex items-center justify-center w-8 rounded-full bg-red-600 text-white transition hover:bg-red-500"
                aria-label="Remove section"
              >
                ×
              </button>`;

    sectsFieldsCont.insertAdjacentHTML('beforeend', sectFieldHTML);
  }

  // Create Board
  else if (e.target.classList.contains('submit-board')) {
    const addedBoardName = document.getElementById('board-name').value,
      sectionsNames = document.querySelectorAll('input[name="section"]'),
      namesArray = sectionsNames.length ? Array.from(sectionsNames).map(sect => sect.value) : null;

    if (addedBoardName) {
      if (namesArray.length > 1 || namesArray[0]) addBoardToMain(addedBoardName, ...namesArray);

      else addBoardToMain(addedBoardName);
      h2.style.opacity = '1';
    }
  }

  // Sections More Options
  else if (e.target.closest('.more-opt') || e.target.classList.contains('more-opt')) {
    const sectMoreOpt = e.target.closest('.more-opt') ? e.target.closest('.more-opt') : e.target;
    sectMoreOpt.nextElementSibling.classList.toggle('active');
  }

  // rename Sections
  else if (e.target.classList.contains('rename-section') || e.target.closest('.rename-section')) {
    const section = e.target.closest('.list'),
      { sectionId } = section.dataset,
      sectionName = section.querySelector('.sec-name');

    // Don't allow renaming pinned sections
    const sectData = boardsData.boardsData.find(board => board.boardId === activeBoardId)?.content.find(sect => sect.id === +sectionId);
    if (sectData?.pinned) return;

    requestAnimationFrame(() => {
      sectionName.contentEditable = 'true';
      sectionName.focus();
    })

    sectionName.addEventListener('blur', e => {
      if (/[\p{L}\p{N}\s]+$/gu.test(sectionName.textContent)) {
        boardsData.boardsData.find(board => board.boardId === activeBoardId).content.find(sect => sect.id === +sectionId).title = sectionName.textContent.trim();
        sectionName.contentEditable = 'false';
      }
    });

    sectionName.addEventListener('keydown', e => {
      if (e.key === 'Enter' && /[\p{L}\p{N}\s]+$/gu.test(sectionName.textContent)) {
        boardsData.boardsData.find(board => board.boardId === activeBoardId).content.find(sect => sect.id === +sectionId).title = sectionName.textContent.trim();

        sectionName.contentEditable = 'false';
      }
    });

  }

  // Delete Section
  else if (e.target.classList.contains('delete-section') || e.target.closest('.delete-section')) {
    const section = e.target.closest('.list'),
      { sectionId } = section.dataset;

    // Don't allow deleting pinned sections
    const sectData = boardsData.boardsData.find(board => board.boardId === activeBoardId)?.content.find(sect => sect.id === +sectionId);
    if (sectData?.pinned) return;

    deleteSection(activeBoardId, +sectionId);
    document.startViewTransition(() => section.remove());
  }

  // Add task
  else if (e.target.classList.contains('add-card') || e.target.closest('.add-card')) {
    const btn = e.target.classList.contains('add-card') ? e.target : e.target.closest('.add-card'),
      trello = btn.parentElement.querySelector('.trello'),
      { sectionId } = btn.closest('.list').dataset;

    showLoading(btn, () => {
      const nodeId = addNode(activeBoardId, +sectionId, 'Add title', 'low', 'Add description', new Date().toISOString().slice(0, 10), 'Add tag');

      trello.insertAdjacentHTML('afterbegin', `
              <div
                data-section-id="${sectionId}"
                data-node-id="${nodeId}"
                tabindex="0"
                class="task backdrop-blur-md grid bg-emerald-500/30 p-3 rounded-md h-fit max-h-43 overflow-y-auto truncate max-w-full transition-all duration-200 outline-3 outline-transparent hover:outline-zinc-100 animate-grow focus-visible:outline-zinc-100">

            <div class="flex justify-between grab-node cursor-grab">
              <h4 class="max-w-27 flex content-center items-center">Add title</h4>
              <span class="priority inline-block leading-[normal] content-center text-sm p-1 rounded-sm bg-yellow-400">low</span>
            </div>

            <hr class="mt-1.5 mb-2.5">

            <p class="truncate max-w-full node-details">Add description</p>

            <div class="flex self-end justify-between mt-2.5">
              <ul class="flex truncate max-w-3/5 *:lowercase *:p-1 *:rounded-sm gap-1 last:mr-2">
                <li class="flex items-center bg-zinc-500 p-1 rounded-sm content-center text-sm leading-[normal]">Add tag</li>
              </ul>
              <span class="due-date flex items-center content-center text-zinc-200 text-sm leading-[normal]">${formatDate(new Date().toISOString().slice(0, 10))}</span>
            </div>
          </div>`);

      setTimeout(() => {
        document.querySelector(`[data-node-id="${nodeId}"]`)?.classList.remove('animate-grow');
      }, 300)
    })

  }

  // Node Click behavior
  else if (e.target.classList.contains('task') || e.target.closest('.task')) {
    const taskDiv = e.target.classList.contains('task') ? e.target : e.target.closest('.task'),
      { sectionId, nodeId } = taskDiv.dataset;

    showNodeDetails(+sectionId, +nodeId);
  }

  // Add New Section
  else if (e.target.classList.contains('add-list') || e.target.closest('.add-list')) {
    const secId = showLoading(e.target.closest('.add-list') || e.target, addSection, users.activeBoardId, 'Untitled'),
      sect = getSection(users.activeBoardId, secId),
      secHtml = `<div
          draggable="false"
          class="list p-3 max-w-155 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] grid min-h-40 rounded-md border-2 border-green-100/20 transition-[translate,left,top,outline-color] duration-200 ease-linear self-start outline-2 outline-offset-2 outline-transparent"
          data-section-id="${sect.id}"
        >
          <h3
            class="flex items-center justify-between cursor-grab border-b border-b-white pb-2 max-h-fit capitalize drag relative"
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
              <span class="sec-name">
                ${sect.title}
              </span>
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

            <div class="tooltip p-1 grid bg-zinc-600/20 *:cursor-pointer *:p-3 *:transition-colors *:[:hover]:bg-zinc-300/40 min-w-max absolute top-full -right-1 rounded-md transition-transform -rotate-x-90 [&.active]:rotate-x-0 origin-top z-10 backdrop-blur-lg border border-zinc-600/60">
                    <button class="rename-section flex items-center justify-between gap-1 min-w-30">
                    Rename
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                  </button>
                  <button class="delete-section flex items-center justify-between gap-1 min-w-30">
                    Delete
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                  </button>
            </div>
          </h3>
          <ul class="trello p-2 grid gap-2  ">
            ${displayNodes(sect.nodes)}
          </ul>
          <div class="drop-zone-indicator w-full max-w-155 h-14 rounded-md bg-zinc-600/20 border-2 border-dashed mt-5 border-purple-400/50 backdrop-blur-lg scale-y-0 opacity-0 transition-all duration-200 origin-top [&.active]:scale-y-100 [&.active]:opacity-100 flex items-center justify-center">
            <span class="text-zinc-300 text-sm font-medium tracking-wide">Drop Here</span>
          </div>
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
        </div>

        <button
          class="add-list flex items-center p-2 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] gap-1 max-h-fit rounded-md border-2 border-green-100/20 justify-center cursor-pointer max-w-155"
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

    document.startViewTransition(() => {
      mainContainer.lastElementChild.remove();
      mainContainer.insertAdjacentHTML('beforeend', secHtml);
    })
  }
})

// Open Boards List
boards.addEventListener('click', e => {
  if (e.target === boardsBtn || e.target.closest('.tracking-wide') === boardsBtn) {
    boardsList.classList.toggle('active');
  }
});

// Open Profile
profileBtn.addEventListener('click', () => {
  profileList.classList.toggle('active');
});

// Board Items Btns
boardsList.addEventListener('click', e => {
  const boardItem = e.target.closest('.boardItem') ? e.target.closest('.boardItem') : e.target.classList.contains('boardItem') ? e.target : null;
  if (boardItem && (!e.target.classList.contains('delete-board') || !e.target.closest('.delete-board'))) {

    if (!(e.target.classList.contains('more-setting') || e.target.closest('.more-setting'))) {

      const itemBoardId = +boardItem.dataset.boardId;
      if (itemBoardId === activeBoardId) return;
      else {
        users.activeBoardId = itemBoardId;
        activeBoardId = itemBoardId;
        saveUser();
        showSkeletonLoading(displayBoard, activeBoardId);
      }

    } else {
      e.target.closest('.more-setting') ? e.target.closest('.more-setting').nextElementSibling.classList.toggle('active') : e.target.nextElementSibling.classList.toggle('active');
    }
  }
});

document.body.addEventListener('click', e => {
  if (e.target === logout || e.target.closest('.logout')) logoutFromAcc();
});

const nodeDetailsDialog = document.querySelector('dialog.node-details');
const nodeDetailsForm = document.getElementById('node-details-form');

function setNodeFormError(dialog, message = '') {
  const errorBox = dialog?.querySelector('#node-form-error');
  if (errorBox) errorBox.textContent = message;
}

function getDialogTags(dialog) {
  try {
    return JSON.parse(dialog?.dataset.tags || '[]');
  } catch {
    return [];
  }
}

function renderTagChips(dialog, tags = []) {
  const chipList = dialog?.querySelector('#tag-chip-list');
  if (!chipList) return;

  dialog.dataset.tags = JSON.stringify(tags);
  chipList.innerHTML = tags.length
    ? tags.map(tag => `
        <span class="inline-flex max-w-fit items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-100">
          <span class="min-w-0 break-all">${tag}</span>
          <button type="button" class="remove-tag text-sm text-rose-300 transition hover:text-rose-200" data-tag="${tag}">×</button>
        </span>
      `).join('')
    : '';
}

function addTagToDialog(dialog, rawValue) {
  const tagInput = dialog?.querySelector('#tag-input');
  if (!dialog || !tagInput) return;

  const value = rawValue.trim();
  if (!value) return;

  const tags = getDialogTags(dialog);
  if (!tags.includes(value)) {
    tags.push(value);
    renderTagChips(dialog, tags);
    tagInput.value = '';
    setNodeFormError(dialog);
  }
}

function removeTagFromDialog(dialog, tagToRemove) {
  if (!dialog) return;
  const tags = getDialogTags(dialog).filter(tag => tag !== tagToRemove);
  renderTagChips(dialog, tags);
}

nodeDetailsForm?.addEventListener('submit', e => {
  e.preventDefault();
  saveNodeDetails(nodeDetailsDialog);
});

nodeDetailsDialog?.addEventListener('click', e => {
  if (e.target.closest('.back')) {
    e.preventDefault();
    nodeDetailsDialog.close();
  }

  if (e.target.closest('.remove-tag')) {
    e.preventDefault();
    removeTagFromDialog(nodeDetailsDialog, e.target.closest('.remove-tag').dataset.tag);
  }

  if (!e.target.closest('.prio-picker')) {
    closePriorityPicker(nodeDetailsDialog);
  }
});

nodeDetailsDialog?.querySelector('#tag-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTagToDialog(nodeDetailsDialog, e.target.value);
  }
});

nodeDetailsDialog?.querySelector('#add-tag-btn')?.addEventListener('click', () => {
  addTagToDialog(nodeDetailsDialog, nodeDetailsDialog.querySelector('#tag-input').value);
});

function openPriorityPicker(dialog) {
  const picker = dialog?.querySelector('.prio-picker'),
    list = picker?.querySelector('.priority'),
    icon = picker?.querySelector('svg');

  if (!picker || !list) return;

  list.classList.remove('hidden');
  list.classList.add('grid');
  icon?.classList.add('rotate-180');
}

function closePriorityPicker(dialog) {
  const picker = dialog?.querySelector('.prio-picker');
  const list = picker?.querySelector('.priority');
  const icon = picker?.querySelector('svg');

  if (!picker || !list) return;

  list.classList.add('hidden');
  list.classList.remove('grid');
  icon?.classList.remove('rotate-180');
}

function setPriorityValue(dialog, value, label) {
  const picker = dialog?.querySelector('.prio-picker');
  const prioLabel = picker?.querySelector('.prio');
  if (!picker || !prioLabel) return;

  prioLabel.dataset.value = value;
  prioLabel.querySelector('span').textContent = label;
  closePriorityPicker(dialog);
}

function showNodeDetails(sectionId, nodeId) {
  const node = getNode(users.activeBoardId, sectionId, nodeId),
    dialog = nodeDetailsDialog,
    dialogTextArea = dialog?.querySelector('textarea[name="description"]'),
    dialogTitleInp = dialog?.querySelector('input[name="title"]'),
    dialogPrioritySel = dialog?.querySelector('.prio'),
    dialogDueDateInp = dialog?.querySelector('input[name="dueDate"]');

  if (!node || !dialog) return;

  dialogTitleInp.value = node.title ?? '';
  dialogTextArea.value = node.description ?? '';
  dialogPrioritySel.dataset.value = node.priority ?? 'low';

  const priorityLabel = dialogPrioritySel.querySelector('span');
  if (priorityLabel) {
    priorityLabel.textContent = node.priority ? node.priority[0].toUpperCase() + node.priority.slice(1) : 'Priority';
  } else {
    dialogPrioritySel.textContent = node.priority ? node.priority[0].toUpperCase() + node.priority.slice(1) : 'Priority';
  }

  dialogDueDateInp.value = node.dueDate ?? '';
  renderTagChips(dialog, Array.isArray(node.tags) ? node.tags : []);
  setNodeFormError(dialog);
  closePriorityPicker(dialog);

  dialog.setAttribute('data-section-id', node.sectionId);
  dialog.setAttribute('data-node-id', node.nodeId);

  dialog.showModal();
}

nodeDetailsDialog?.querySelector('.prio-picker')?.addEventListener('click', e => {
  const picker = e.target.closest('.prio-picker');
  const option = e.target.closest('.prio-option');

  if (option) {
    setPriorityValue(nodeDetailsDialog, option.dataset.value, option.textContent.trim());
    return;
  }

  if (picker) {
    const list = picker.querySelector('.priority');
    if (list?.classList.contains('hidden')) openPriorityPicker(nodeDetailsDialog);
    else closePriorityPicker(nodeDetailsDialog);
  }
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}, ${d.toLocaleString('en-US', { month: 'short' })}`;
}

function validateNodeDetails(dialog) {
  const titleInput = dialog?.querySelector('input[name="title"]');
  const descriptionInput = dialog?.querySelector('textarea[name="description"]');
  const dueDateInput = dialog?.querySelector('input[name="dueDate"]');
  const title = titleInput?.value.trim() || '';
  const description = descriptionInput?.value.trim() || '';
  const dueDate = dueDateInput?.value;
  const tags = getDialogTags(dialog);

  if (!title) return 'Task title is required.';
  if (title.length < 2) return 'Task title must be at least 2 characters long.';
  if (description.length > 500) return 'Description is too long.';
  if (dueDate) {
    const parsedDueDate = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(parsedDueDate.getTime())) return 'Due date is invalid.';
  }
  if (tags.some(tag => tag.length > 25)) return 'Each tag must be 25 characters or less.';

  return '';
}

function saveNodeDetails(dialog) {
  const sectionId = +dialog.dataset.sectionId,
    nodeId = +dialog.dataset.nodeId,
    titleInput = dialog.querySelector('input[name="title"]'),
    descriptionInput = dialog.querySelector('textarea[name="description"]'),
    priorityInput = dialog.querySelector('.prio'),
    dueDateInput = dialog.querySelector('input[name="dueDate"]'),
    node = getNode(users.activeBoardId, sectionId, nodeId);

  if (!node || !dialog) return;

  const validationMessage = validateNodeDetails(dialog);
  if (validationMessage) {
    setNodeFormError(dialog, validationMessage);
    return;
  }

  const newTitle = titleInput.value.trim(),
    newDescription = descriptionInput.value.trim(),
    newPriority = priorityInput.dataset.value || 'low',
    newDueDate = dueDateInput.value,
    newTags = getDialogTags(dialog);

  node.title = newTitle;
  node.description = newDescription;
  node.priority = newPriority;
  node.dueDate = newDueDate;
  node.tags = newTags;

  saveBoard();

  const taskCard = document.querySelector(`.task[data-section-id="${sectionId}"][data-node-id="${nodeId}"]`);
  if (taskCard) {
    const taskTitle = taskCard.querySelector('h4');
    const taskDesc = taskCard.querySelector('.node-details');
    const taskPriority = taskCard.querySelector('.priority');
    const taskDueDate = taskCard.querySelector('.due-date');
    const taskTags = taskCard.querySelector('ul');

    if (taskTitle) taskTitle.textContent = node.title;
    if (taskDesc) taskDesc.textContent = node.description;
    if (taskPriority) {
      taskPriority.textContent = node.priority;
      taskPriority.className = `priority inline-block leading-[normal] content-center text-sm p-1 rounded-sm ${node.priority === 'high' ? 'bg-rose-400' : node.priority === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'}`;
    }
    if (taskDueDate) taskDueDate.textContent = formatDate(node.dueDate);
    if (taskTags) {
      taskTags.innerHTML = node.tags && node.tags.length
        ? node.tags.map(tag => `<li class="flex max-w-full items-center break-all rounded-sm bg-zinc-500 p-1 text-sm leading-[normal]">${tag}</li>`).join('')
        : '';
    }
  }

  setNodeFormError(dialog);
  dialog.close();
}

// To Be Exposed To Inline onclick
window.saveNodeDetails = saveNodeDetails;

function logoutFromAcc() {
  users.activeUserId = null;
  users.activeBoardId = null;
  saveUser();

  window.location.href = './sign-in.html?act=cr';
}

function showLoading(btn, fun, ...args) {
  const oldSvg = btn.querySelector('svg'),
    newSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" class="animate-spin"><path d="M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480.5-80Q398-80 325-111.5Z"/></svg>`;

  oldSvg.remove();
  btn.insertAdjacentHTML('afterbegin', newSvg);

  btn.disabled = 'true';
  btn.style.opacity = '.5';
  const funcValue = fun(...args);


  btn.lastElementChild.remove();
  btn.insertAdjacentElement('afterbegin', oldSvg);
  btn.removeAttribute('disabled');
  btn.style.opacity = '1';
  return funcValue;
}

function loadContent(userId, activeBoardId) {
  const userBoards = boardsData.boardsData.filter(board => board.userId === userId);
  if (!userBoards.length) return;

  const currentBoardId = activeBoardId;

  displayBoard(currentBoardId);
  displayBoardItems(userId, userBoards)
}

function displayBoard(boardId, board = '') {
  if (!board) board = getBoard(boardId);
  let fullMainHTML = '';

  board?.content?.forEach(sect => {
    const defaultMainHTML = `
      <div
          draggable="false"
          class="list p-3 max-w-155 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] grid min-h-40 rounded-md border-2 border-green-100/20 transition-[translate,left,top,outline-color] duration-200 ease-linear self-start outline-2 outline-offset-2 outline-transparent"
          data-section-id="${sect.id}"
        >
          <h3
            class="flex items-center justify-between cursor-grab border-b border-b-white pb-2 max-h-fit capitalize drag relative"
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
              <span class="sec-name">
                ${sect.title}
              </span>
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

            <div class="tooltip p-1 grid bg-zinc-600/20 *:cursor-pointer *:p-3 *:transition-colors *:[:hover]:bg-zinc-300/40 min-w-max absolute top-full -right-1 rounded-md transition-transform -rotate-x-90 [&.active]:rotate-x-0 origin-top z-10 backdrop-blur-lg border border-zinc-600/60">
                    ${sect.pinned ? '<span class="text-sm text-rose-300">This Section Is Pinned, Cant Change Its Info</span>' : `<button class="rename-section flex items-center justify-between gap-1 min-w-30">
                    Rename
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                  </button>
                  <button class="delete-section flex items-center justify-between gap-1 min-w-30">
                    Delete
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                  </button>`}
            </div>
          </h3>
          <ul class="trello p-2 grid gap-2  ">
            ${displayNodes(sect.nodes)}
          </ul>
          <div class="drop-zone-indicator w-full max-w-155 h-14 rounded-md bg-zinc-600/20 border-2 border-dashed mt-5 border-purple-400/50 backdrop-blur-lg scale-y-0 opacity-0 transition-all duration-200 origin-top [&.active]:scale-y-100 [&.active]:opacity-100 flex items-center justify-center">
            <span class="text-zinc-300 text-sm font-medium tracking-wide">Drop Here</span>
          </div>
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
        class="add-list flex items-center p-2 bg-[hsl(from_var(--clr-accent-400)_h_s_l/.2)] gap-1 max-h-fit rounded-md border-2 border-green-100/20 justify-center cursor-pointer max-w-155"
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

  currentBoardName.textContent = board?.title;
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
            <li data-board-id="${board.boardId}" class="boardItem relative" title="${board.title}" tabindex="0">
              <span class="block p-1 max-w-45 truncate self-center">${board.title}</span>
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
                <div class="tooltip p-1 grid bg-zinc-600/80 border border-zinc-600/90 backdrop-blur-xl *:cursor-pointer *:p-3 *:transition-colors *:[:hover]:bg-zinc-300/20 min-w-max absolute top-full -right-1 rounded-md transition-transform scale-y-0 [&.active]:scale-y-100 origin-top z-10">
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

function displayNodes(nodes) {
  if (!nodes.length) return '';
  let fullHTML = '';
  nodes.forEach(node => {
    fullHTML += `
    <div
      data-section-id="${node.sectionId}"
      data-node-id="${node.nodeId}"
      tabindex="0"
      class="task backdrop-blur-md grid bg-emerald-500/30 p-3 rounded-md h-fit max-h-43 overflow-y-auto truncate max-w-full transition-all duration-200 outline-3 outline-transparent hover:outline-zinc-100 focus-visible:outline-zinc-100">

      <div class="flex justify-between grab-node cursor-grab">
        <h4 class="max-w-27 truncate flex content-center items-center">${node.title}</h4>
        <span class="priority inline-block leading-[normal] content-center text-sm p-1 rounded-sm ${node.priority === 'high' ? 'bg-rose-400' : node.priority === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'}">${node.priority}</span>
      </div>

      <hr class="mt-1.5 mb-2.5">

      <p class="truncate max-w-full node-details">${node.description}</p>

      <div class="flex self-end justify-between mt-2.5">
        <ul class="flex max-w-[70%] *:lowercase *:p-1 *:rounded-sm last:mr-1 gap-1">
          <p class="truncate max-w-full">
            ${node.tags && node.tags.length ? node.tags.map(tag => `<li class="flex items-center text-sm leading-[normal] bg-zinc-500 p-1 rounded-sm content-center"><span class="truncate max-w-16">${tag}</span></li>`).join('') : ''}
          </p>
        </ul>
        <span class="due-date flex items-center content-center text-zinc-200 text-sm leading-[normal]">${formatDate(node.dueDate)}</span>
      </div>
    </div>`
  });

  return fullHTML;
}

function showSkeletonLoading(fn, ...args) {
  const cardHeights = ['h-14', 'h-11', 'h-16'];
  document.body.style.overflowY = 'hidden';

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
    document.body.style.overflowY = 'visible';
  }, 500)
}

function addBoardToMain(name, ...sects) {
  const ID = addBoard(users.activeUserId, name);
  users.activeBoardId = ID;
  activeBoardId = ID;
  saveUser();

  if (sects) {
    sects.forEach(sectionName => {
      addSection(ID, sectionName);
    })
  }

  noAccBtn.style.display = 'none';
  mainContainer.innerHTML = '';
  showSkeletonLoading(displayBoard, ID);
  displayBoardItems(users.activeUserId);
  currentBoardName.textContent = name;
}