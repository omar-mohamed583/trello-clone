import { changeNodeOrderInSameSec, changeNodeSec, changeSectionsOrder, getBoard, getNode, getSection, users } from "./boards.js";
const mainContainer = document.querySelector('.main-content');

let draggedSect, clonedSect, clonedNode, draggedNode, offset;

const updateClonedSectPos = throttle(e => {
  if (!clonedSect) return;
  clonedSect.style.top = e.pageY - offset.y + 'px';
  clonedSect.style.left = e.pageX - offset.x + 'px';
});

const updateClonedNodePos = throttle(e => {
  if (!clonedNode) return;
  clonedNode.style.top = e.pageY - offset.y + 'px';
  clonedNode.style.left = e.pageX - offset.x + 'px';
});

document.body.addEventListener('mousedown', e => {
  draggedSect = e.target.classList.contains('drag') ?
    e.target.closest('.list') : e.target.closest('.drag') ? e.target.closest('.list') : null,
    draggedNode = e.target.classList.contains('grab-node') ?
      e.target.closest('.task') : e.target.closest('.grab-node') ? e.target.closest('.task') : null;

  if (draggedSect &&
    !(e.target.classList.contains('more-opt')
      || e.target.closest('.more-opt'))
    && !(e.target.closest('.tooltip')
      || e.target.classList.contains('tooltip'))
  ) {
    clonedSect = createClonedEle(draggedSect, e);
  }

  else if (draggedNode) {
    clonedNode = createClonedEle(draggedNode, e);
    clonedNode.style.pointerEvents = 'none';
  }
});

document.body.addEventListener('mousemove', e => {
  if (clonedSect) updateClonedSectPos(e);
  else if (clonedNode) updateClonedNodePos(e);
});

document.body.addEventListener('mouseup', e => {

  if (draggedSect &&
    !(e.target.classList.contains('more-opt')
      || e.target.closest('.more-opt'))
    && !(e.target.closest('.tooltip')
      || e.target.classList.contains('tooltip'))
  ) {
    const closestSec = getClosest(clonedSect.getBoundingClientRect(), e);

    clonedSect.remove();

    draggedSect.style.opacity = '1';
    draggedSect.style.pointerEvents = 'all';

    if (closestSec) {
      setTimeout(() => {
        requestAnimationFrame(() => {

          const closestRec = closestSec.getBoundingClientRect(),
            draggedRec = draggedSect.getBoundingClientRect();

          // Change Order Visually
          const translateX = closestRec.left - draggedRec.left,
            translateY = closestRec.top - draggedRec.top;

          draggedSect.style.translate = `${translateX}px ${translateY}px`;
          closestSec.style.translate = `${translateX * -1}px ${translateY * -1}px`;


          setTimeout(() => {
            const holder = document.createElement('div');
            // Change order In DOM

            draggedSect.replaceWith(holder);
            closestSec.replaceWith(draggedSect);
            holder.replaceWith(closestSec);

            // Reset Translate Property Value
            draggedSect.style.translate = '0px 0px';
            closestSec.style.translate = '0px 0px';

            resetSect();
          }, 210)

          // Change Order In The Array
          changeSectionsOrder(users.activeBoardId, draggedSect.dataset.sectionId, closestSec.dataset.sectionId);
        })
      }, 20)
    } else resetSect();
  }

  else if (clonedNode) {
    clonedNode.remove();

    // Dragged Node Styling
    draggedNode.style.opacity = '1';
    draggedNode.style.pointerEvents = 'all';

    resetSect(false);
  }
});

function getClosest(eleDimensions, event) {
  const targetedSect = event.target.classList.contains('list') ?
    event.target : event.target.closest('.list');

  if (targetedSect?.dataset.sectionId !== draggedSect.dataset.sectionId) return targetedSect;

  const lists = [...document.querySelectorAll('.list')];
  let closest = null,
    minDistance = Infinity;

  const centerX = eleDimensions.left + eleDimensions.width / 2,
    centerY = eleDimensions.top + eleDimensions.height / 2;

  for (const list of lists) {
    if (list.dataset.sectionId === draggedSect.dataset.sectionId) continue;

    const listRec = list.getBoundingClientRect(),
      listCenterX = listRec.left + listRec.width / 2,
      listCenterY = listRec.top + listRec.height / 2,
      distance = Math.hypot(listCenterX - centerX, listCenterY - centerY);

    if (distance < minDistance) {
      minDistance = distance;
      closest = list;
    }
  }

  return closest;
}

function createClonedEle(ele, e) {
  const clonedEle = ele.cloneNode(true),
    draggedRect = ele.getBoundingClientRect();

  // Body Styling
  document.body.classList.add('grabbing');

  // Hide Dragged Ele
  ele.style.opacity = '0';
  ele.style.pointerEvents = 'none';

  // Update Offset Var
  offset = {
    x: e.offsetX,
    y: e.offsetY
  }

  // Cloned Element Styling
  clonedEle.style.position = 'absolute';
  clonedEle.style.top = e.pageY - e.offsetY + 'px';
  clonedEle.style.left = e.pageX - e.offsetX + 'px';
  clonedEle.style.minWidth = draggedRect.width + 'px';
  clonedEle.style.minHeight = draggedRect.height + 'px';

  // Append Cloned Ele To Body
  document.body.append(clonedEle);

  return clonedEle;
}

function resetSect(sect = true) {
  document.body.classList.remove('grabbing');

  if (sect) {
    clonedSect = null;
    draggedSect = null;
  } else {
    clonedNode = null;
    draggedNode = null;
  }
}

function throttle(fn) {
  let frameId = null;
  let latestEvent;

  return (e) => {
    latestEvent = e;
    if (frameId) return;

    frameId = requestAnimationFrame(() => {
      fn(latestEvent);
      frameId = null;
    });
  }
}