import { getTasksDueOn } from "./analytics.js";

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let viewYear, viewMonth;

const monthLabel = document.querySelector('.month'),
  daysContainer = document.querySelector('.days'),
  prevBtn = document.querySelector('[aria-label="Last Month"]'),
  nextBtn = document.querySelector('[aria-label="Next Month"]');

export function initCalendar() {
  const now = new Date();
  viewYear = now.getFullYear();
  viewMonth = now.getMonth();

  renderCalendar();

  prevBtn.addEventListener('click', () => changeMonth(-1));
  nextBtn.addEventListener('click', () => changeMonth(1));
}

function changeMonth(delta) {
  viewMonth += delta;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  } else if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar();
}

function renderCalendar() {
  monthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate(),
    firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  daysContainer.innerHTML = '';

  for (let col = 0; col < 7; col++) {
    const weekdayIndex = (firstWeekday + col) % 7;

    const colLi = document.createElement('li');
    colLi.className = 'flex flex-col gap-2';

    const label = document.createElement('span');
    label.className = 'text-sm text-gray-300 text-center';
    label.textContent = WEEKDAY_NAMES[weekdayIndex];
    colLi.appendChild(label);

    const dateList = document.createElement('ul');
    dateList.className = 'grid *:flex *:py-1 *:place-content-center *:rounded-md *:cursor-pointer *:text-center [&>li:hover]:bg-purple-400/80 [&>li]:transition-colors *:text-sm *:leading-[normal]';

    for (let day = col + 1; day <= daysInMonth; day += 7) {
      const dateLi = document.createElement('li');
      dateLi.textContent = day;

      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);

      if (isCurrentMonth && day === today.getDate()) {
        dateLi.classList.add('active');
      }

      dateList.appendChild(dateLi);
    }

    colLi.appendChild(dateList);
    daysContainer.appendChild(colLi);
  }
}