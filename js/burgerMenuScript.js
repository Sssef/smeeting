let burgerMenu = document.querySelector('.burger-menu')
let burgerButton = document.querySelector('.burger-button')
let burgerCloseButton = document.querySelector('.burger-close')

let changeBurger = () => {
  burgerCloseButton.classList.toggle('burger-button')
  burgerButton.classList.toggle('burger-button')
  burgerMenu.classList.toggle('burger-menu-opened')
}

burgerButton.addEventListener('click', changeBurger)
burgerCloseButton.addEventListener('click', changeBurger)
