import { changeNodePosition, changeSectionsOrder, getBoard, getNode, getSection, swapNodesBetweenSections, swapNodesInSameSection, users } from "./boards.js";

const mainContainer = document.querySelector('.main-content'),
  animation_duration = 220;

let mainContainerRect = mainContainer.getBoundingClientRect();

const observer = new MutationObserver(muts => {
  if (muts[0].type === 'childList') {
    console.log('mutated');
    console.trace();
    mainContainerRect = mainContainer.getBoundingClientRect();
  }
});

observer.observe(mainContainer, {
  childList: true
})

let draggedSect, clonedSect, clonedNode, draggedNode;

const updateClonedSectPos = throttle(e => {
  if (!clonedSect) return;
  clonedSect.style.top = e.pageY - 40 + 'px';
  clonedSect.style.left = e.pageX - 10 + 'px';
});

const updateClonedNodePos = throttle(e => {
  if (!clonedNode) return;
  clonedNode.style.top = e.pageY - 40 + 'px';
  clonedNode.style.left = e.pageX - 10 + 'px';
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
    if ((e.pageX <= mainContainerRect.right) &&
      (e.pageX >= mainContainerRect.left) &&
      (e.pageY <= mainContainerRect.bottom) &&
      (e.pageY >= mainContainerRect.top)
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
    !(e.target.classList.contains('more-opt') || e.target.closest('.more-opt')) &&
    !(e.target.closest('.tooltip') || e.target.classList.contains('tooltip'))
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

          translateElements(closestRec.left, closestRec.top, draggedRec.left, draggedRec.top, closestSec.closest, draggedSect);
          changeSectionsOrder(users.activeBoardId, +draggedSect.dataset.sectionId, +closestSec.closest.dataset.sectionId);
          changeDOMPos('def', draggedSect, closestSec.closest);

          setTimeout(resetSect, animation_duration);
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

    const closestObj = getClosestObj(closestSect, closestZone, closestNode),
      draggedNodeSectId = +draggedNode.dataset.sectionId,
      draggedNodeId = +draggedNode.dataset.nodeId;

    if (closestObj.name === 'node') {
      console.log('%cNode Is Closest', 'font-size: 18px; color: red; font-weight:bold');

      const closestNodeSectId = +closestNode.closestNode.dataset.sectionId,
        closestNodeId = +closestNode.closestNode.dataset.nodeId;

      requestAnimationFrame(() => {
        if (closestNodeSectId === draggedNodeSectId) {
          swapNodesInSameSection(users.activeBoardId, draggedNodeSectId, draggedNodeId, closestNodeId);
        } else {
          swapNodesBetweenSections(users.activeBoardId, closestNodeSectId, closestNodeId, draggedNodeSectId, draggedNodeId);

          draggedNode.dataset.sectionId = closestNodeSectId;
          closestNode.closestNode.dataset.sectionId = draggedNodeSectId;
        }

        translateElements(closestNode.closestLeft, closestNode.closestTop, closestNode.draggedLeft, closestNode.draggedTop, closestNode.closestNode, draggedNode);
        changeDOMPos(closestObj.name, draggedNode, closestNode.closestNode, [closestSect, closestZone, closestNode]);

        setTimeout(resetSect, animation_duration, false);
      });

    }
    else {
      console.log(`%c${closestObj.name} Is Closest`, 'font-size: 18px; color: red; font-weight:bold');
      const closestSecId = +closestZone.closestZone.closest('.list').dataset.sectionId;


      const coords = { left: closestNode.draggedLeft || 0, top: closestNode.draggedTop || 0 };

      if (closestObj.name === 'zone') {

        changeNodePosition(users.activeBoardId, draggedNodeSectId, +closestZone.closestZone.closest('.list').dataset.sectionId, draggedNodeId);

        changeDOMPos(closestObj.name, draggedNode, closestZone.closestZone.closest('.list'), coords);

        draggedNode.dataset.sectionId = closestSecId;

      } else {
        changeNodePosition(users.activeBoardId, draggedNodeSectId, +closestSect.closest.dataset.sectionId, draggedNodeId);

        changeDOMPos(closestObj.name, draggedNode, closestSect.closest, coords);
        draggedNode.dataset.sectionId = +closestSect.closest.dataset.sectionId;
      }

      setTimeout(resetSect, animation_duration, false);
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
  if (!draggedNode) return { closestNode: null, closestLeft: null, closestTop: null, draggedLeft: 0, draggedTop: 0, distanceAway: Infinity };

  const nodes = [...document.querySelectorAll('.task')],
    draggedRect = draggedNode.getBoundingClientRect(),
    clonedCenterX = clonedDims.left + clonedDims.width / 2,
    clonedCenterY = clonedDims.top + clonedDims.height / 2,
    infoObj = {
      closestNode: null,
      closestLeft: null,
      closestTop: null,
      draggedLeft: draggedRect.left,
      draggedTop: draggedRect.top,
      distanceAway: Infinity
    };

  let minDistance = Infinity;

  for (const node of nodes) {
    if (node.dataset.nodeId === draggedNode.dataset.nodeId) continue;

    const nodeRect = node.getBoundingClientRect(),
      nodeCenterX = nodeRect.left + nodeRect.width / 2,
      nodeCenterY = nodeRect.top + nodeRect.height / 2,
      distance = Math.hypot(clonedCenterX - nodeCenterX, clonedCenterY - nodeCenterY);

    if (distance < minDistance) {
      minDistance = distance;
      infoObj.closestNode = node;
      infoObj.closestLeft = nodeRect.left;
      infoObj.closestTop = nodeRect.top;
      infoObj.distanceAway = distance;
    }
  }

  return infoObj;
}

function getClosestZone(clonedDims) {
  if (!draggedNode) return { closestZone: null, distanceAway: Infinity };

  const zones = [...document.querySelectorAll('.drop-zone-indicator')],
    clonedCenterX = clonedDims.left + clonedDims.width / 2,
    clonedCenterY = clonedDims.top + clonedDims.height / 2,
    infoObj = {
      closestZone: null,
      distanceAway: Infinity,
      rect: null
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
        infoObj.distanceAway = distance,
        infoObj.rect = zoneRect;
    }
  }

  return infoObj;
}

function translateElements(closestLeft, closestTop, draggedLeft, draggedTop, closest, dragged) {
  if (!(closestLeft && closestTop && draggedLeft && draggedTop))
    throw new Error(`Missing Dimension: ${closestLeft}, ${closestTop}, ${draggedLeft}, ${draggedTop}, ${dragged}, ${closest}`);

  const translateX = closestLeft - draggedLeft,
    translateY = closestTop - draggedTop;

  dragged.style.translate = `${translateX}px ${translateY}px`;
  if (closest) closest.style.translate = `${translateX * -1}px ${translateY * -1}px`;

  setTimeout(() => {
    // Reset Translate
    dragged.style.translate = '0px 0px';
    if (closest) closest.style.translate = '0px 0px';
  }, animation_duration);
}

function changeDOMPos(name = 'def', dragged, closest, rect = null) {
  // Section by section OR Node By Node
  if (name === 'def' || name === 'node') {
    const holder = document.createElement('div');

    setTimeout(() => {
      dragged.replaceWith(holder);
      closest.replaceWith(dragged);
      holder.replaceWith(closest);
    }, animation_duration);

    // Node To Zone | Node To Section
  }
  else {
    let section = closest.querySelector('.trello');
    const holder = document.createElement('div');

    holder.className = 'opacity-0 p-3 rounded-md max-h-43 overflow-y-auto truncate max-w-full scale-y-0';

    section.append(holder);

    const holderRect = holder.getBoundingClientRect();

    translateElements(holderRect.left, holderRect.top, rect.left, rect.top, null, dragged);

    holder.classList.replace('scale-y-0', 'scale-y-100');

    setTimeout(() => holder.replaceWith(dragged), animation_duration);
  }
}

function getClosestObj(section, zone, node) {
  let name = null

  // Node Is The Closest
  if ((section.distanceAway + 50) >= node.distanceAway && zone.distanceAway >= node.distanceAway) {
    name = 'node';

    // Zone Is Closest
  } else if ((section.distanceAway + 50) >= zone.distanceAway && node.distanceAway > zone.distanceAway) {
    name = 'zone';

    // Section Is the Closest
  } else {
    name = 'sec';
  }

  return {
    name
  }
}

function createClonedEle(ele, e) {
  const clonedEle = ele.cloneNode(true),
    draggedRect = ele.getBoundingClientRect();

  // Body Styling
  document.body.classList.add('grabbing');

  // Hide Dragged Ele
  ele.style.opacity = '0';
  ele.style.pointerEvents = 'none';

  // Cloned Element Styling
  clonedEle.style.position = 'absolute';
  clonedEle.style.top = e.pageY - e.offsetY + 'px';
  clonedEle.style.left = e.pageX - e.offsetX + 'px';
  clonedEle.style.width = draggedRect.width + 'px';
  clonedEle.style.height = draggedRect.height + 'px';

  // Replace Some Classes
  clonedEle.classList.replace('transition-all', 'transition-[translate,left,top,outline-color]');
  clonedEle.classList.add('ease-linear');

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
