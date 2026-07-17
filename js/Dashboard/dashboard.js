import { createTasksAnalytics, createBoardAnalytics, createDateAnalytics } from "./analytics.js";
import { initCalendar } from "./calendar.js";
import { users, saveUser } from "../Data/users.js";

const divs = document.querySelectorAll(".animate"),
  height = 12,
  width = height,
  statsDiv = document.querySelector('.stat-abs'),
  circleContainer = document.querySelector('.container-circle'),
  gradientCircle = document.querySelector('.grad-div'),
  profileBtn = document.querySelector('.profile-icon'),
  profileList = document.querySelector('.profile'),
  logoutBtn = document.querySelector('.logout');

window.onload = () => {
  if (!(users.activeUserId === 0 || !users.activeUserId)) window.location.href = './sign-in.html?act=cr';
  else profileBtn.textContent = users.usersData[users.activeUserId]?.userName[0];
}

let absDiv, circleRect = circleContainer.getBoundingClientRect(), timeout, percentages;

window.onscroll = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => circleRect = circleContainer.getBoundingClientRect(), 70);
};

document.body.addEventListener('click', e => {
  if (!(e.target.classList.contains('profile-icon') || e.target.closest('.profile-icon') || e.target.closest('.profile')))
    profileList.classList.remove('active');
});

// Open Profile
profileBtn.addEventListener('click', () => {
  profileList.classList.toggle('active');
});

logoutBtn.addEventListener('click', logoutFromAcc);

const updateAbsDivPosition = throttle(e => {
  if (absDiv) {
    const top = e.pageY - height / 2,
      left = e.pageX - width / 2;
    absDiv.style.top = `${top}px`;
    absDiv.style.left = `${left}px`;
  }
});

divs.forEach((div) => {
  div.addEventListener("mouseover", (e) => { if (!absDiv) createHighlightedDiv(div, e) });
  div.addEventListener("mousemove", updateAbsDivPosition);
  div.addEventListener("mouseleave", () => {
    const highlightedDiv = document.querySelector(".highlight-div");
    if (highlightedDiv) {
      highlightedDiv.remove();
      absDiv = null;
    }
  });
});

function logoutFromAcc() {
  users.activeUserId = null;
  users.activeBoardId = null;
  saveUser();

  window.location.href = './sign-in.html?act=cr';
}

function createHighlightedDiv(div, e) {
  if (window.matchMedia("prefer-reduced-motion: reduce").matches) return;
  const { bg } = div.dataset,
    top = e.pageY - height / 2,
    left = e.pageX - width / 2;

  absDiv = document.createElement("div");

  absDiv.style.position = "absolute";
  absDiv.style.top = `${top}px`;
  absDiv.style.left = `${left}px`;
  absDiv.style.backgroundColor = bg;
  absDiv.style.width = `${width}px`;
  absDiv.style.height = `${height}px`;
  absDiv.style.borderRadius = "50%";
  absDiv.style.zIndex = "9999";
  absDiv.style.filter = "saturate(1.5) brightness(1.5)";
  absDiv.style.backdropFilter = "saturate(1.5) brightness(1.5)";
  absDiv.style.pointerEvents = "none";
  absDiv.className = "highlight-div";
  document.body.appendChild(absDiv);
}

function throttle(func) {
  let lastEvent,
    isThrottled = false;
  return (e) => {
    lastEvent = e;
    if (isThrottled) return;
    else {
      isThrottled = true;
      requestAnimationFrame(() => {
        func(lastEvent || e);
        isThrottled = false;
      });
    }
  };
}

function animateGradient(element, highPercent, normalPercent, duration = 2000) {
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for smoother animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentHigh = highPercent * easeProgress;
    const currentNormal = normalPercent * easeProgress;

    element.style.background = `conic-gradient(
      #ef4444 0% ${currentHigh}%,
      #eab308 ${currentHigh}% ${currentHigh + currentNormal}%,
      #22c55e ${currentHigh + currentNormal}% 100%
    )`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function createStatDom() {
  const { completedTasks, inProgTasks, notStartedTasks, othersStat, otherStatRate, total } = percentages,
    doneEle = document.querySelectorAll('.done-tasks'),
    doneRateEle = document.querySelector('.complete-rate'),
    inProgEle = document.querySelectorAll('.in-progress-tasks'),
    inProgRateEle = document.querySelector('.in-prog-rate'),
    notStartedEle = document.querySelectorAll('.not-start'),
    notStartedRateEle = document.querySelector('.not-start-rate'),
    otherStatEle = document.querySelector('.others'),
    otherStatRateEle = document.querySelector('.others-rate');

  doneEle?.forEach(ele => ele?.setAttribute('data-num', completedTasks));
  doneRateEle?.setAttribute('data-num', Math.trunc(completedTasks / total * 100));

  inProgEle?.forEach(ele => ele?.setAttribute('data-num', inProgTasks));
  inProgRateEle?.setAttribute('data-num', Math.trunc(inProgTasks / total * 100));

  notStartedEle?.forEach(ele => ele?.setAttribute('data-num', notStartedTasks));
  notStartedRateEle?.setAttribute('data-num', Math.trunc(notStartedTasks / total * 100));
  
  otherStatEle?.setAttribute('data-num', othersStat);
  otherStatRateEle?.setAttribute('data-num', otherStatRate);
}

function createPriorityDom() {
  percentages = createTasksAnalytics();
  const { total, highPrioCount, normalPrioCount, lowPrioCount } = percentages,
    lowPrioDOM = document.querySelectorAll('.low-priority'),
    normalPrioDOM = document.querySelectorAll('.normal-priority'),
    highPrioDOM = document.querySelectorAll('.high-priority'),
    totalPrioDOM = document.querySelectorAll('.total');

  console.log(percentages);

  highPrioDOM.forEach(dom => dom.setAttribute('data-num', highPrioCount));

  lowPrioDOM.forEach(dom => dom.setAttribute('data-num', lowPrioCount));

  normalPrioDOM.forEach(dom => dom.setAttribute('data-num', normalPrioCount));

  totalPrioDOM.forEach(dom => dom.setAttribute('data-num', total));
}

createPriorityDom();
createStatDom();

function createBoardDom() {
  const { totalBoards, mostTasksPerBoard } = createBoardAnalytics(),
    mostTasksPerBoardDom = document.querySelector('.largest-board-count'),
    avgTasksPerBoard = document.querySelector('.avg-tasks-per-board'),
    totalBoardsDom = document.querySelector('.total-boards');

  mostTasksPerBoardDom.setAttribute('data-num', mostTasksPerBoard);
  totalBoardsDom.setAttribute('data-num', totalBoards);
  avgTasksPerBoard.setAttribute('data-num', Math.trunc(percentages.total / totalBoards));
}

function createDateDom() {
  const { todayCount, upcomingCount } = createDateAnalytics(),
    tasksTodayEle = document.querySelector('.tasks-today'),
    upcomingEle = document.querySelector('.upcoming-tasks');

  tasksTodayEle.textContent = todayCount;
  upcomingEle.setAttribute('data-num', upcomingCount);
}

createDateDom();
initCalendar();


createBoardDom();

let time, animatedEle = new WeakSet();

const intObserver = new IntersectionObserver(ents => {
  ents.forEach(ent => {
    if (animatedEle.has(ent.target) || !ent.isIntersecting) return;

    animatedEle.add(ent.target);
    if (ent.target === gradientCircle) {

      if (time) clearTimeout(time);
      time = setTimeout(() => {
        animateGradient(gradientCircle, percentages.highPercent, percentages.normalPercent);
      });

    } else {
      const { num } = ent.target.dataset;
      animateNums(+num, ent.target);
    }
  });
}, {threshold: .4});

intObserver.observe(gradientCircle)

const updateStatsDiv = throttle(e => {
  statsDiv.style.translate = `${(e.clientX - circleRect.left) / 2}px ${e.clientY - circleRect.top}px`;
});

circleContainer.addEventListener('mouseenter', e => {
  updateStatsDiv(e);
  statsDiv.style.opacity = '1';
});

circleContainer.addEventListener('mousemove', e => {
  updateStatsDiv(e);
});

circleContainer.addEventListener('mouseleave', e => {
  statsDiv.style.opacity = '0';
});

const numsEle = document.querySelectorAll('.animate-num');

numsEle.forEach(ele => intObserver.observe(ele));

function animateNums(num, ele) {
  num = +num;
  const nowTime = performance.now(),
    duration = 1200;

  function update(updatedTime) {
    const progress = updatedTime - nowTime,
      currentNum = Math.min(Math.floor(num * (progress / duration)), num);

    ele.textContent = currentNum;

    if (currentNum < num) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}