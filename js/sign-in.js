

const showPass = document.querySelector('.show-pass'),
  passInp = document.querySelector('[type="password"]'),
  emailInp = document.querySelector('[type="email"]'),
  nameInp = document.querySelector('[type="text"]'),
  createAccBtn = document.querySelector('.create-acc'),
  createAccBtn = document.querySelector('.sign-in');


showPass.addEventListener('click', () => {
  showPass.classList.toggle('active');
  passInp.type = passInp.type === 'text' ? 'password' : 'text';
});