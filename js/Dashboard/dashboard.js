import * as boards from "../Data/boards.js";

const divs = document.querySelectorAll(".animate"),
height = 12,
  width = height;

let absDiv;

const updateAbsDivPosition = throttle((e) => {
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
