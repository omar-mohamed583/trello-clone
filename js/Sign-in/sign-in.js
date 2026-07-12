import * as usersFile from '../Data/users.js';
import { addBoard, addSection, boards, saveBoard } from '../Data/boards.js';

const createAccBtn = document.querySelector('.create-acc-act'),
  createAccCh = document.querySelector('.create-acc-ch'),
  signInCh = document.querySelector('.sign-in-ch'),
  signInBtn = document.querySelector('.sign-in-act'),
  otpInp = document.querySelector('dialog [type="text"]'),
  submitOtpBtn = document.querySelector('[type="submit"]'),
  activeFormAnimationEle = document.querySelectorAll('.active-form .ch'),
  inActiveFormAnimationEle = document.querySelectorAll('form:not(.active-form) .ch');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

window.onload = () => {
  const url = new URL(window.location.href),
  actionParam = url.searchParams.get('act');
  if (actionParam === 'si') document.querySelectorAll('form').forEach(form => form.classList.toggle('active-form'));

//   Array.from(activeFormAnimationEle).reverse().forEach((ele, ind) => {
//     ele.setAttribute('style', `--delay:${Math.ceil((ind + 1) * 120)}ms`);
//   });

//   Array.from(inActiveFormAnimationEle).reverse().forEach((ele, ind) => {
//     ele.setAttribute('style', `--delay:${Math.ceil((ind + 1) * 120)}ms`);
//   })
}


let OTP = JSON.parse(localStorage.getItem('OTP')) ?? null;
let isTrans = false;

document.body.addEventListener('click', e => {
  if (e.target.closest('.show-pass') || e.target.classList.contains('show-pass')) {
    const showPass = document.querySelector('.active-form .show-pass'),
      passInp = showPass.previousElementSibling;
    showPass.classList.toggle('active');
    passInp.type = passInp.type === 'text' ? 'password' : 'text';
  }
  else if (e.target === signInCh || e.target === createAccCh && !isTrans) {
    isTrans = true;
    if (e.target === signInCh) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('act') === 'cr') {
        url.searchParams.set('act', 'si');
        window.history.pushState({}, "", url);
      }
    }
    else if (e.target === createAccCh) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('act') === 'si') {
        url.searchParams.set('act', 'cr');
        window.history.pushState({}, "", url);
      }
    }

    const activeForm = document.querySelector('form.active-form'),
      inactiveForm = document.querySelector('form:not(.active-form)'),
      fallAnimationEle = activeForm?.querySelectorAll('.ch') ?? [],
      riseAnimationEle = inactiveForm?.querySelectorAll('.ch') ?? [];



    Array.from(fallAnimationEle).reverse().forEach(ele => {
      ele.classList.remove('rise', 'fall');
      ele.classList.add('fall');
    });

    Array.from(riseAnimationEle).reverse().forEach(ele => {
      ele.classList.remove('rise', 'fall');
      ele.classList.add('rise');
    });

    setTimeout(() => {

      if (activeForm) {
        activeForm.style.zIndex = '0';
        activeForm.style.opacity = '0';
        activeForm.style.pointerEvents = 'none';
        activeForm.classList.remove('active-form');
      }

      if (inactiveForm) {
        inactiveForm.style.zIndex = '1';
        inactiveForm.style.opacity = '1';
        inactiveForm.style.pointerEvents = 'all';
        inactiveForm.classList.add('active-form');
      }

      isTrans = false;
    }, 510);
  }
});

signInBtn.addEventListener('click', e => {
  e.preventDefault();

  const passInp = document.querySelector('#pass1'),
    emailInp = document.querySelector('#email1');

  if (!emailInp.value) showErr('Please Enter Your Email');
  else if (passInp.value < 8) showErr('The password should be at least 8 characters long');
  else if (!emailPattern.test(emailInp.value)) showErr('Invalid Email');
  else {
    const email = emailInp.value,
      password = passInp.value;

    const user = usersFile.getUser(email, password);
    if (user) {
      usersFile.users.activeUserId = user.userId;
      usersFile.saveUser();
      const userBoard = boards.boardsData.find(board => board.userId === user.userId);
      usersFile.users.activeBoardId = userBoard?.boardId ?? null;
      usersFile.saveUser();
      window.location.href = './index.html';
    } else if (usersFile.users.usersData.find(user => user.email === email)) {
      if (!usersFile.users.usersData.find(user => user.password === password)) {
        showErr('Incorrect Password');
      }
    } else if (usersFile.users.usersData.find(user => user.password === password)) {
      if (!usersFile.users.usersData.find(user => user.email === email)) {
        showErr('Incorrect Email');
      }
    } else {
      showErr('No user found with this credentials');
    }
  }
});

createAccBtn.addEventListener('click', e => {
  const passInp = document.querySelector('.active-form #pass'),
    emailInp = document.querySelector('.active-form [type="email"]'),
    nameInp = document.querySelector('.active-form [type="text"]');

  e.preventDefault();

  if (!nameInp.value || !emailInp.value || !passInp.value) showErr('Please complete your credentials');
  else if (/\W/.test(nameInp.value)) showErr('The Name Contains Invalid Characters');
  else if (!emailPattern.test(emailInp.value)) showErr('Invalid Email');
  else if (passInp.value.length < 8) showErr('The Password Is Too Short');
  else if (usersFile.users.usersData.find(user => user.email === emailInp.value)) showErr('Account With Same Email Already Exists!')
  else {
    const email = emailInp.value,
      name = nameInp.value,
      password = passInp.value,
      sentTo = document.querySelector('.sent-to');

    sentTo.textContent = email;
    dia.showModal();

    if (!OTP) {
      generateAndSendOtp(email, name);
    }
  }
});

async function generateAndSendOtp(email, name) {
  let otp = '';
  for (let i = 0; i < 8; i++) {
    otp += `${Math.trunc(Math.random() * (i + 1 + Math.random()) * Math.random() * Math.random() * 2 * 1.5 + (Math.random() + 3))}`
  }

  if (otp.length > 8) otp = otp.slice(0, 9);

  try {
    emailjs.init("vOAGW35Tu6be7P3jC");
    const resp = await emailjs.send("service_rzjzneu", "template_r8l59vk", {
      to_name: name,
      otp_code: +otp,
      to_email: email,
    });
    console.log('Email Sent');
    OTP = otp;
    localStorage.setItem('otp', JSON.stringify(OTP));
  } catch (err) {
    throw new Error('Cant Send OTP! Try Again Later', { cause: err });
  }
}

submitOtpBtn.addEventListener('click', () => {
  const nameInp = document.querySelector('[type="text"]'),
  passInp = document.querySelector('.active-form #pass'),
  emailInp = document.querySelector('.active-form [type="email"]');
  if (otpInp.value === OTP) {

    usersFile.addUser(nameInp.value, passInp.value, emailInp.value);

    const activeUserId = usersFile.users.activeUserId;

    addBoard(activeUserId, 'Default Board');

    const boardId = boards.boardsData.find(bo => bo.userId === activeUserId).boardId;

    usersFile.users.activeBoardId = boardId;

    usersFile.saveUser();

    dia.close();

    window.location.href = './index.html';
  } else {
    showErr('Incorrect OTP');
  }
});

export default function showErr(msg) {
  const oldErrDiv = document.querySelector('.err');
  if (oldErrDiv) return;
  const errDiv = document.createElement('div');
  errDiv.textContent = msg;
  errDiv.className = 'err p-3 bg-red-500 text-white rounded-md text-center fixed -right-1 top-16 z-20';
  document.body.appendChild(errDiv);
  setTimeout(() => {
    errDiv.remove();
  }, 3000);
}