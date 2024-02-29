const UIQuestionsController = (function () {
  let storedQuestions = localStorage.getItem('questions') ? JSON.parse(localStorage.getItem('questions')) : null

  const DOMstrings = {
    // Parent element
    questionsList: '.questions-list',

    //Modal
    modalAddQuestion: '.add-question',
    modalAddQuestionButton: '.add-question-button',
    modalAddQuestionCloseButton: '.add-question .modal-close-button',
    showAddQuestionModalButton: '.addQuestion-button',

    // Questions Controls
    questionsInput: '#question-input',
    questionsToggler: '#questions-check',

    // Question Item elements
    questionItem: '.question-item',
    questionItemChecked: '.question-checked',
    questionRemoveButton: '.remove-question-button',

    // Questions Counter elements
    questionsCounter: '.questions-counter',
    questionsCounterChecked: '.questions-counter-checked',
  }

  const questionsCounter = {
    total: 0,
    checked: 0,
  }

  return {
    createQuestion(questionText) {
      let html = null
      let list = DOMstrings.questionsList
      let uid = crypto.randomUUID()

      html = `
      <div id="${uid}" class="question-item">
        ${questionText}
        <img src="./img/questionImage.svg" class="remove-question-button" alt="questionImage">
      </div>`

      document.querySelector(list).insertAdjacentHTML('afterbegin', html)
      questionsCounter.total += 1
    },

    showAddQuestionModal() {
      document.querySelector(DOMstrings.modalAddQuestion).classList.toggle('add-question-opened')
    },

    addQuestionToList(questionText) {
      this.createQuestion(questionText)
    },

    removeQuestion(selectorID) {
      let el = document.getElementById(selectorID)

      if (el.classList.contains('question-checked')) {
        questionsCounter.checked--
        this.displayCheckedQuestionsCounter()
      }

      el.parentNode.removeChild(el)
      this.saveQuestionsToLocalStorage()

      questionsCounter.total--
    },

    toggleQuestion(selectorID) {
      let el = document.getElementById(selectorID)
      el.classList.toggle('question-checked')

      let list = document.querySelectorAll(DOMstrings.questionItemChecked)
      questionsCounter.checked = list.length
      this.displayCheckedQuestionsCounter()
    },

    toggleAllQuestions() {
      let list = document.querySelectorAll(DOMstrings.questionItem)
      let questionsToggler = document.querySelector(DOMstrings.questionsToggler)

      if (questionsToggler.checked) {
        list.forEach((item) => {
          !item.classList.contains('question-checked') ? item.classList.add('question-checked') : null
          questionsCounter.checked = list.length
        })
      } else {
        list.forEach((item) => {
          item.classList.contains('question-checked') ? item.classList.remove('question-checked') : null
          questionsCounter.checked = 0
        })
      }

      questionsCounter.checked = document.querySelectorAll(DOMstrings.questionItemChecked).length
      document.querySelector(DOMstrings.questionsCounterChecked).innerText = questionsCounter.checked
    },

    displayQuestionsCounter() {
      document.querySelector(DOMstrings.questionsCounter).innerText = questionsCounter.total
    },

    displayCheckedQuestionsCounter() {
      document.querySelector(DOMstrings.questionsCounterChecked).innerText = questionsCounter.checked
    },

    displayQuestions(questionsList) {
      if (storedQuestions !== null) {
        storedQuestions.forEach((text) => this.createQuestion(text))
      } else {
        questionsList.forEach((text) => this.createQuestion(text))
      }
    },

    saveQuestionsToLocalStorage() {
      let questionsList = [...document.querySelectorAll(DOMstrings.questionItem)].map((item) => item.innerText)
      localStorage.setItem('questions', JSON.stringify(questionsList))
    },

    getDOMStrings() {
      return DOMstrings
    },
  }
})()

const UIMembersController = (function () {
  const DOMstrings = {
    // Modal
    modalAddMember: '.add-member',
    modalAddMemberInput: '#member-input',
    modalAddMemberButton: '.add-member-button',
    modalAddMemberCloseButton: '.add-member .modal-close-button',
    modalAddMemberRadioButtons: '[name="sex"]',

    // Member item elements
    membersList: '.members-list',
    memberItem: '.member-item',
    memberItemEmpty: '.member-item-empty',

    memberItemDeleteButton: '.member-delete-button',
    memberItemLinkInput: '.member-link-input',
    memberItemCopyLinkButton: '.link-button',
  }

  return {
    createMember(name, sex, id, link) {
      let html = null
      let parentNode = DOMstrings.membersList

      html = `
      <div class="member-item" id=${id}>
        <div class="member-item-header">
          <span class="member-name">${name}</span>
          <img src="./img/memberDeleteImage.svg" class="member-delete-button">
        </div>
        <span class="member-gender">${sex}</span>
        <div class="member-link">
          <input class="member-link-input" type="text" readonly placeholder="link" value=${link}>
          <button class="link-button">
            <img src="./img/icon-park-outline_copy-link.svg">
            Копировать ссылку
          </button>
        </div>
      </div>`

      document.querySelector(parentNode).insertAdjacentHTML('afterbegin', html)
    },

    removeMember(selectorID) {
      let el = document.getElementById(selectorID)
      el.remove(el)
    },

    async copyLink(link) {
      try {
        await navigator.clipboard.writeText(link)
      } catch (error) {
        console.error('::ERROR_COPY:', error)
      }
    },

    showAddMemberModal() {
      document.querySelector(DOMstrings.modalAddMember).classList.toggle('add-member-opened')
    },

    getDOMStrings() {
      return DOMstrings
    },
  }
})()

// Global Controller
const controller = (function (UIQuestionsController, UIMembersController) {
  const POST_URL = 'https://smeeting.ru/member'

  const DOM = { ...UIQuestionsController.getDOMStrings(), ...UIMembersController.getDOMStrings() }

  const meeting = {
    members: [],

    // Default questions
    questions: [
      'Вы бы хотели чаще учавствовать в подобных встречах без обязательтв и ограничений?',
      'Вас что-нибудь удивило в данном месте?',
      'Вы бы хотели встретиться в непринужденной обстановке?',
    ],

    id: '',
    link: '',
  }

  const setupEventListeners = () => {
    // All questions check-toggler
    document.querySelector(DOM.questionsToggler).addEventListener('click', UIQuestionsController.toggleAllQuestions)

    // Show question modal
    document
      .querySelector(DOM.showAddQuestionModalButton)
      .addEventListener('click', UIQuestionsController.showAddQuestionModal)

    // Add question
    document.querySelector(DOM.modalAddQuestionButton).addEventListener('click', addQuestion)

    // Close question modal
    document.querySelector(DOM.modalAddQuestionCloseButton).addEventListener('click', () => {
      let input = document.querySelector(DOM.questionsInput)

      UIQuestionsController.showAddQuestionModal()
      input.value = ''
    })

    // Remove question
    document.querySelector(DOM.questionsList).addEventListener('click', (event) => removeQuestion(event))

    // Send
    document.querySelector('.send-question-button').addEventListener('click', () => {
      XHR('POST', POST_URL, { members: meeting.members, questions: meeting.questions })
        .then((response) => {
          meeting = { ...meeting, id: response.id, link: response.link }
        })
        .catch((error) => console.error('::ERROR:', error))
    })

    // Toggle member modal
    document.querySelector(DOM.memberItemEmpty).addEventListener('click', UIMembersController.showAddMemberModal)
    document.querySelector(DOM.modalAddMemberCloseButton).addEventListener('click', () => {
      let input = document.querySelector(DOM.modalAddMemberInput)

      UIMembersController.showAddMemberModal()
      input.value = ''
    })

    // Add member
    document.querySelector(DOM.modalAddMemberButton).addEventListener('click', addMember)

    // Remove member
    document.querySelector(DOM.membersList).addEventListener('click', (event) => removeMember(event))
  }

  const addMember = () => {
    let input = document.querySelector(DOM.modalAddMemberInput)

    if (input.value !== '') {
      let radio = document.querySelectorAll(DOM.modalAddMemberRadioButtons)

      let newMember = {
        name: input.value,
        sex: [...radio].find((sex) => sex.checked).value,
      }

      XHR('POST', POST_URL, newMember)
        .then((response) => {
          newMember = { ...newMember, id: response.id || '123abc', link: response.link || 'https://test.com' }
          meeting.members.push(newMember.id)
          UIMembersController.createMember(newMember.name, newMember.sex, newMember.id, newMember.link)
        })
        .catch((error) => {
          console.error('::ERROR_MEMBER_REQUEST:', error)
        })
        .finally(() => {
          input.value = ''
        })
    }
  }

  const removeMember = (event) => {
    const target = event.target

    if (target.classList.contains('member-delete-button')) {
      const targetParentID = target.parentNode.parentNode.id
      UIMembersController.removeMember(targetParentID)
    } else if (target.classList.contains('link-button')) {
      const link = target.parentNode.querySelector('.member-link-input')
      UIMembersController.copyLink(link.value)
    }
  }

  const addQuestion = () => {
    let input = document.querySelector(DOM.questionsInput)

    if (input.value !== '') {
      UIQuestionsController.addQuestionToList(input.value)
      meeting.questions = [...meeting.questions, input.value]

      input.value = ''

      UIQuestionsController.displayQuestionsCounter()
      UIQuestionsController.saveQuestionsToLocalStorage()
    }
  }

  const removeQuestion = (event) => {
    const target = event.target

    if (target.classList.contains('remove-question-button')) {
      const targetParentID = target.parentNode.id
      UIQuestionsController.removeQuestion(targetParentID)
    } else if (target.classList.contains('question-item')) {
      const targetID = target.id
      UIQuestionsController.toggleQuestion(targetID)
    }
  }

  const updateMeeting = (props) => {
    meeting = { ...meeting, ...props }
  }

  return {
    init() {
      console.log('App has started.')
      UIQuestionsController.displayQuestions(meeting.questions)
      UIQuestionsController.displayQuestionsCounter()
      UIQuestionsController.displayCheckedQuestionsCounter()

      setupEventListeners()
    },
  }
})(UIQuestionsController, UIMembersController)

function XHR(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    xhr.open(method, url, true)

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
    xhr.responseType = 'json'

    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(xhr.response)
      } else {
        resolve(xhr.response)
      }
    }

    xhr.onerror = () => {
      reject(xhr.response)
    }

    xhr.send(data)
  })
}

controller.init()
