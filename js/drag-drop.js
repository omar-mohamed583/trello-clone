import { changeNodeOrderInSameSec, changeNodeSec, changeSectionsOrder, getBoard, getNode, getSection, users } from "./boards.js";
const mainContainer = document.querySelector('.main-content');

let draggedSection, clonedSection, frameId, lastCursorX = 0, lastCursorY = 0, cancelTime;

document.body.addEventListener('mousedown', e => {
  if ((e.target.classList.contains('drag') || e.target.closest('.drag')) && (!e.target.classList.contains('more-opt') && !e.target.closest('.more-opt')) && !(e.target.closest('.tooltip') || e.target.classList.contains('tooltip'))) {
    draggedSection = e.target.closest('.list');
    clonedSection = draggedSection.cloneNode(true);
    const draggedRec = draggedSection.getBoundingClientRect(),
      draggedSectionWidth = draggedRec.width,
      draggedSectionHeight = draggedRec.height;

    requestAnimationFrame(() => {
      draggedSection.style.opacity = '0';
      document.body.classList.add('grabbing');
      clonedSection.classList.add('absolute');

      clonedSection.style.pointerEvents = 'none';
      clonedSection.style.height = draggedSectionHeight + 'px';
      clonedSection.style.width = draggedSectionWidth + 'px';
      clonedSection.style.top = e.pageY + 'px';
      clonedSection.style.left = e.pageX + 'px';
      clonedSection.style.translate = '-50% 0';
      document.body.appendChild(clonedSection);
    })
  }
});

document.body.addEventListener('mousemove', e => {
  if (draggedSection) {
    lastCursorX = e.pageX;
    lastCursorY = e.pageY;

    if (frameId) cancelAnimationFrame(frameId);

    if (!clonedSection) return;
    frameId = requestAnimationFrame(() => {
      clonedSection.style.top = lastCursorY + 'px';
      clonedSection.style.left = lastCursorX + 'px';
      clonedSection.style.translate = '-50% 0';
      frameId = null;
    })
  }
});

let time;

document.body.addEventListener('mouseup', e => {
  if (draggedSection) {
    const closestSection = getClosestSect(clonedSection.getBoundingClientRect(), e);

    if (frameId) cancelAnimationFrame(frameId);

    requestAnimationFrame(() => {
      draggedSection.style.opacity = '1';
      document.body.classList.remove('grabbing');
      clonedSection.remove();
    })

    if (closestSection) {
      console.log(closestSection.dataset.sectionId);
      changeSectionsOrder(users.activeBoardId, closestSection.dataset.sectionId, draggedSection.dataset.sectionId);

      const closestRec = closestSection.getBoundingClientRect(),
        draggedRec = draggedSection.getBoundingClientRect(),
        translateXAmount = draggedRec.left - closestRec.left,
        translateYAmount = draggedRec.top - closestRec.top;

      requestAnimationFrame(() => {
        closestSection.style.pointerEvents = 'none';
        draggedSection.style.pointerEvents = 'none';
        closestSection.style.translate = `${translateXAmount}px ${translateYAmount}px`;
        draggedSection.style.translate = `${translateXAmount * -1}px ${translateYAmount * -1}px`;
      })

      const holder = document.createElement('div');

      if (time) clearTimeout(time);
      time = setTimeout(() => {
        requestAnimationFrame(() => {
          closestSection.replaceWith(holder);
          draggedSection.replaceWith(closestSection);
          holder.replaceWith(draggedSection);
          closestSection.style.translate = '0px 0px';
          draggedSection.style.translate = '0px 0px';
          closestSection.style.pointerEvents = 'all';
          draggedSection.style.pointerEvents = 'all';

          clonedSection = null;
          draggedSection = null;
        })
      }, 200);
    }
  }
});


function getClosestSect(eleDimensions, event) {
  const ele = event.target.classList.contains('list') ?
    event.target : event.target.closest('.list');

  if (ele?.dataset.sectionId !== draggedSection.dataset.sectionId) return ele;

  const leftSearchArea = clonedSection.getBoundingClientRect().left,
    rightSearchArea = clonedSection.getBoundingClientRect().right,
    topSearchArea = clonedSection.getBoundingClientRect().top,
    bottomSearchArea = clonedSection.getBoundingClientRect().bottom,
    lists = Array.from(document.querySelectorAll('.list'));
  let closest = null;

  for (const list of lists) {
    if (list.dataset.sectionId === draggedSection.dataset.sectionId) continue;

    const listRec = list.getBoundingClientRect();

    if (
      ((listRec.left >= leftSearchArea && listRec.left <= rightSearchArea) ||
        (listRec.right >= leftSearchArea && listRec.right <= rightSearchArea)) &&

      ((listRec.top >= topSearchArea && listRec.top <= bottomSearchArea) ||
        (listRec.bottom >= topSearchArea && listRec.bottom <= bottomSearchArea))) {
      closest = list;
    }
  }

  return closest;
}