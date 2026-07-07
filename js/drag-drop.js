import { changeNodePosition, changeSectionsOrder, getBoard, getNode, getSection, users } from "./boards.js";

const mainContainer = document.querySelector('.main-content'),
  animation_duration = 210;

let mainContainerRect = mainContainer.getBoundingClientRect();

const observer = new MutationObserver(muts => {
  if (muts[0].type === 'childList') {
    console.log('mutated');
    console.trace();
    mainContainerRect = mainContainer.getBoundingClientRect();
  }
});

observer.observe(mainContainer, {
  childList: true,
  subtree: true
})

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
    document.querySelectorAll('.drop-zone-indicator').forEach(zone => zone.classList.add('active'));
  }
});

document.body.addEventListener('mousemove', e => {
  if (clonedSect || clonedNode) {
    if ((e.clientX <= mainContainerRect.right) &&
      (e.clientX >= mainContainerRect.left) &&
      (e.clientY <= mainContainerRect.bottom) &&
      (e.clientY >= mainContainerRect.top)
    ) {
      if (clonedSect) {
        updateClonedSectPos(e);
      }
      else if (clonedNode) {
        updateClonedNodePos(e);
      }

    } else {
      clonedSect?.remove();
      clonedNode?.remove();
      draggedNode ? draggedNode.style.cssText = '' : null;
      draggedSect ? draggedSect.style.cssText = '' : null;
      resetSect()
      resetSect(false)
    }
  }
});

document.body.addEventListener('mouseup', e => {
  document.querySelectorAll('.drop-zone-indicator').forEach(zone => zone.classList.remove('active'));

  if (draggedSect &&
    !(e.target.classList.contains('more-opt')
      || e.target.closest('.more-opt'))
    && !(e.target.closest('.tooltip')
      || e.target.classList.contains('tooltip'))
  ) {
    const closestSec = getClosestSect(clonedSect.getBoundingClientRect());

    clonedSect.remove();

    draggedSect.style.opacity = '1';
    draggedSect.style.pointerEvents = 'all';

    if (closestSec?.closest) {
      setTimeout(() => {
        requestAnimationFrame(() => {

          const closestRec = closestSec.closest.getBoundingClientRect(),
            draggedRec = draggedSect.getBoundingClientRect();

          // Change Order Visually
          const translateX = closestRec.left - draggedRec.left,
            translateY = closestRec.top - draggedRec.top;

          draggedSect.style.translate = `${translateX}px ${translateY}px`;
          closestSec.closest.style.translate = `${translateX * -1}px ${translateY * -1}px`;


          setTimeout(() => {
            const holder = document.createElement('div');

            // Change order In DOM
            draggedSect.replaceWith(holder);
            closestSec.closest.replaceWith(draggedSect);
            holder.replaceWith(closestSec.closest);

            // Reset Translate Property Value
            draggedSect.style.translate = '0px 0px';
            closestSec.closest.style.translate = '0px 0px';

            resetSect();
          }, animation_duration)

          // Change Order In The Array
          changeSectionsOrder(users.activeBoardId, +draggedSect.dataset.sectionId, +closestSec.closest.dataset.sectionId);
        })
      }, 30)
    } else resetSect();
  }

  else if (clonedNode) {
    const clonedNodeRect = clonedNode.getBoundingClientRect(),
      closestSect = getClosestSect(clonedNodeRect),
      closestNode = getClosestNode(clonedNodeRect),
      closestZone = getClosestZone(clonedNodeRect);

    document.body.classList.remove('grabbing');
    clonedNode.remove();
    if (draggedNode) {
      draggedNode.style.opacity = '1';
      draggedNode.style.pointerEvents = 'all';
    }

    console.log(draggedNode, closestNode, closestSect)

    // The Node Is The Closest
    if ((closestSect.distanceAway + 30) > closestNode.distanceAway && closestZone.distanceAway > closestNode.distanceAway) {

      const translateX = closestNode.closestLeft - closestNode.draggedLeft,
        translateY = closestNode.closestTop - closestNode.draggedTop;
      console.log(translateX, translateY)

      requestAnimationFrame(() => {

        // Swap Visually
        draggedNode.style.translate = `${translateX}px ${translateY}px`;
        closestNode.closestNode.style.translate = `${translateX * -1}px ${translateY * -1}px`;

        // Swap In Array
        const closestSecId = +closestNode.closestNode.dataset.sectionId,
          draggedSecId = +draggedNode.dataset.sectionId,
          draggedNodeId = +draggedNode.dataset.nodeId,
          closestNodeId = +closestNode.closestNode.dataset.nodeId;

        changeNodePosition(users.activeBoardId, closestSecId, draggedSecId, closestNodeId);

        changeNodePosition(users.activeBoardId, draggedSecId, closestSecId, draggedNodeId);

        closestNode.closestNode.dataset.sectionId = draggedSecId;
        draggedNode.dataset.sectionId = closestSecId;

        setTimeout(() => {
          draggedNode ? draggedNode.style.translate = `0px 0px` : console.error('no Dragged Node in 177');
          closestNode.closestNode.style.translate = `0px 0px`;

          // Swap In DOM
          const holder = document.createElement('div');
          holder.className = 'task backdrop-blur-md grid bg-emerald-500/30 p-3 rounded-md h-fit max-h-43 overflow-y-auto truncate max-w-full transition-colors outline-3 outline-transparent hover:outline-zinc-100';

          draggedNode.replaceWith(holder);
          closestNode.closestNode.replaceWith(draggedNode);
          holder.replaceWith(closestNode.closestNode);

          draggedNode.style.cssText = '';
          resetSect(false);
        }, animation_duration)
      })
    }

    // Section Is The Closest
    else {
      if (closestZone.closestZone) {

        const secTrello = closestSect.closest.querySelector('.trello'),
          holder = document.createElement('div');

        holder.className = 'task grid bg-emerald-500/30 p-3 rounded-md h-fit max-h-32 overflow-y-auto truncate cursor-pointer animate-grow transition duration-200 outline-3 outline-transparent hover:outline-zinc-100 scale-y-0 origin-top opacity-0';

        secTrello.append(holder);

        // Get Holder Div Rect For Animation
        const holderRect = holder.getBoundingClientRect();

        // Swap Visually
        const translateX = holderRect.left - closestNode.draggedLeft,
          translateY = holderRect.top - closestNode.draggedTop;

        requestAnimationFrame(() => {
          draggedNode.style.translate = `${translateX}px ${translateY}px`;

          setTimeout(() => {
            draggedNode.style.translate = '0px 0px';

            // Swap In DOM
            holder.replaceWith(draggedNode);

            // change Array
            changeNodePosition(users.activeBoardId, +draggedNode.dataset.sectionId, +closestSect.closest.dataset.sectionId, +draggedNode.dataset.nodeId);

            resetSect(false);
          }, animation_duration);
        })
      }
    }
  }
});

function getClosestSect(eleDimensions) {
  const lists = [...document.querySelectorAll('.list')];
  let closest = null,
    minDistance = Infinity;

  const centerX = eleDimensions.left + eleDimensions.width / 2,
    centerY = eleDimensions.top + eleDimensions.height / 2;

  for (const list of lists) {
    if (list?.dataset?.sectionId === draggedSect?.dataset?.sectionId) continue;

    const listRec = list.getBoundingClientRect(),
      listCenterX = listRec.left + listRec.width / 2,
      listCenterY = listRec.top + listRec.height / 2,
      distance = Math.hypot(listCenterX - centerX, listCenterY - centerY);

    if (distance < minDistance) {
      minDistance = distance;
      closest = list;
    }
  }

  return { closest, distanceAway: minDistance };
}

function getClosestNode(clonedDims) {
  if (!draggedNode) return { closestNode: null, closestLeft: null, closestTop: null, draggedLeft: 0, draggedTop: 0 };


  const nodes = [...document.querySelectorAll('.task')],
    draggedRect = draggedNode?.getBoundingClientRect(),
    clonedCenterX = clonedDims.left + clonedDims.width / 2,
    clonedCenterY = clonedDims.top + clonedDims.height / 2,
    infoObj = {
      closestNode: null,
      closestLeft: null,
      closestTop: null,
      draggedLeft: draggedRect.left,
      draggedTop: draggedRect.top,
      distanceAway: null
    };

  let minDistance = Infinity;

  for (const node of nodes) {
    if (node.dataset.nodeId === draggedNode.dataset.nodeId) continue;

    const nodeRect = node.getBoundingClientRect(),
      nodeCenterX = nodeRect.left + nodeRect.width / 2,
      nodeCenterY = nodeRect.top + nodeRect.height / 2,
      distance = Math.hypot(
        clonedCenterX - nodeCenterX,
        clonedCenterY - nodeCenterY
      );

    if (distance < minDistance) {
      minDistance = distance,
        infoObj.closestNode = node,
        infoObj.closestLeft = nodeRect.left,
        infoObj.closestTop = nodeRect.top,
        infoObj.distanceAway = distance;
    }
  }

  return infoObj;
}

function getClosestZone(clonedDims) {
  if (!draggedNode) return { closestZone: null, distanceAway: null };

  const zones = [...document.querySelectorAll('.drop-zone-indicator')],
    clonedCenterX = clonedDims.left + clonedDims.width / 2,
    clonedCenterY = clonedDims.top + clonedDims.height / 2,
    infoObj = {
      closestZone: null,
      distanceAway: null
    };

  let minDistance = Infinity;

  for (const zone of zones) {
    if (zone.closest('.list').dataset.sectionId === draggedNode.dataset.sectionId) continue;

    const zoneRect = zone.getBoundingClientRect(),
      zoneCenterX = zoneRect.left + zoneRect.width / 2,
      zoneCenterY = zoneRect.top + 28,
      distance = Math.hypot(
        clonedCenterX - zoneCenterX,
        clonedCenterY - zoneCenterY
      );

    if (distance < minDistance) {
      minDistance = distance,
        infoObj.closestZone = zone,
        infoObj.distanceAway = distance;
    }
  }

  return infoObj;
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
  clonedEle.style.width = draggedRect.width + 'px';
  clonedEle.style.height = draggedRect.height + 'px';

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