const slidesContainer = document.querySelector('.slider')
const slide = document.querySelector('.slide')
const prevButton = document.getElementById('slide-arrow-prev')
const nextButton = document.getElementById('slide-arrow-next')
const questionNumber = document.querySelector('.question-number')
const currentNumber = document.querySelector('.current-question')
const totalNumber = document.querySelector('.question-count')
const slidesCounter = document.querySelectorAll('.slide').length

let currentSlide = 1
totalNumber.textContent = slidesCounter

nextButton.addEventListener('click', (e) => {
  const currentTarget = e.currentTarget
  const slideWidth = slide.clientWidth
  currentTarget.classList.toggle('disabled')
  slidesContainer.scrollLeft += slideWidth

  setTimeout(() => {
    currentTarget.classList.toggle('disabled')
  }, 300)

  if (slidesContainer.scrollLeft < slidesContainer.scrollWidth - slideWidth && currentSlide < slidesCounter) {
    currentNumber.textContent = ++currentSlide
  }
})

prevButton.addEventListener('click', (e) => {
  const currentTarget = e.currentTarget
  const slideWidth = slide.clientWidth
  currentTarget.classList.toggle('disabled')
  slidesContainer.scrollLeft -= slideWidth

  setTimeout(() => {
    currentTarget.classList.toggle('disabled')
  }, 300)

  if (slidesContainer.scrollLeft > 0 && currentSlide > 1) {
    currentNumber.textContent = --currentSlide
  }
})
