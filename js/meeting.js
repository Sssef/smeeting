// UI Questions controller
const UIQuestionsController = (function () {
  let storedQuestions = localStorage.getItem('questions') ? JSON.parse(localStorage.getItem('questions')) : null

  const DOMstrings = {
    //Modal
    showAddQuestionModalButton: '.addQuestion-button',
    modalAddQuestion: '.add-question',
    modalAddQuestionButton: '.add-question-button',
    modalAddQuestionCloseButton: '.add-question .modal-close-button',
    modalAddQuestionLabel: '#input-label',
    // Questions Controls
    questionsInput: '#question-input',
    questionsToggler: '#questions-check',
    // Question Item elements
    questionsList: '.questions-list',
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
      }

      el.parentNode.removeChild(el)
      this.saveQuestionsToLocalStorage()

      questionsCounter.total -= 1

      this.displayQuestionsCounter()
      this.displayCheckedQuestionsCounter()
    },

    toggleQuestion(selectorID) {
      let el = document.getElementById(selectorID)
      let questionsToggler = document.querySelector(DOMstrings.questionsToggler)
      el.classList.toggle('question-checked')

      let list = document.querySelectorAll(DOMstrings.questionItemChecked)
      questionsCounter.checked = list.length

      this.displayCheckedQuestionsCounter()

      if (list.length < document.querySelectorAll(DOMstrings.questionItem).length) {
        questionsToggler.checked = false
      }
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

    displayInputSymbolsCounter(valueLength) {
      document.querySelector(DOMstrings.modalAddQuestionLabel).innerText = `(${valueLength}/200)`
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

    clearInput() {
      document.querySelector(DOMstrings.questionsInput).value = ''
    },

    getInputValue() {
      return document.querySelector(DOMstrings.questionsInput).value
    },

    getDOMStrings() {
      return DOMstrings
    },
  }
})()

// UI Members controller
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
          <button class="link-button" data-tooltip="Ссылка скопирована">
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

    clearInput() {
      document.querySelector(DOMstrings.modalAddMemberInput).value = ''
    },

    showAddMemberModal() {
      document.querySelector(DOMstrings.modalAddMember).classList.toggle('add-member-opened')
    },

    getInputValue() {
      return document.querySelector(DOMstrings.modalAddMemberInput).value
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
    // Modal input symbols counter
    document.querySelector(DOM.questionsInput).addEventListener('input', (event) => {
      UIQuestionsController.displayInputSymbolsCounter(event.target.value.length)
    })
    // Add question
    document.querySelector(DOM.modalAddQuestionButton).addEventListener('click', addQuestion)
    // Close question modal
    document.querySelector(DOM.modalAddQuestionCloseButton).addEventListener('click', () => {
      UIQuestionsController.showAddQuestionModal()
      UIQuestionsController.clearInput()
      UIQuestionsController.displayInputSymbolsCounter(0)
    })
    // Remove question
    document.querySelector(DOM.questionsList).addEventListener('click', (event) => removeQuestion(event))
    // Send data: members.id & questions
    document.querySelector('.send-question-button').addEventListener('click', () => {
      XHR('POST', POST_URL, { members: meeting.members, questions: meeting.questions })
        .then((response) => {
          meeting = { ...meeting, id: response.id, link: response.link }
          window.location.replace('./successFullMeeting.html')
        })
        .catch((error) => console.error('::ERROR:', error))
      // __FOR_REDIRECTION_TEST_ONLY__
      // .finally(() => {
      //   window.location.replace('./successFullMeeting.html')
      // })
    })
    // Toggle member modal
    document.querySelector(DOM.memberItemEmpty).addEventListener('click', UIMembersController.showAddMemberModal)
    document.querySelector(DOM.modalAddMemberCloseButton).addEventListener('click', () => {
      UIMembersController.showAddMemberModal()
      UIMembersController.clearInput()
    })
    // Add member
    document.querySelector(DOM.modalAddMemberButton).addEventListener('click', addMember)
    // Remove member
    document.querySelector(DOM.membersList).addEventListener('click', (event) => {
      removeMember(event)
      copyMemberLink(event)
    })
  }

  const addMember = () => {
    if (UIMembersController.getInputValue() !== '') {
      let radio = document.querySelectorAll(DOM.modalAddMemberRadioButtons)

      let newMember = {
        name: UIMembersController.getInputValue(),
        sex: [...radio].find((sex) => sex.checked).value,
      }

      // __MOCK_TEST__
      newMember = { ...newMember, id: '123abc', link: 'https://test.com' }
      meeting.members.push(newMember.id)
      UIMembersController.createMember(newMember.name, newMember.sex, newMember.id, newMember.link)
      UIMembersController.clearInput()
      //

      //__PRODUCTION_VERSION__
      // XHR('POST', POST_URL, newMember)
      //   .then((response) => {
      //     newMember = { ...newMember, id: response.id, link: response.link }
      //     meeting.members.push(newMember.id)
      //     UIMembersController.createMember(newMember.name, newMember.sex, newMember.id, newMember.link)
      //   })
      //   .catch((error) => {
      //     console.error('::ERROR_MEMBER_REQUEST:', error)
      //   })
      //   .finally(() => {
      //     UIMembersController.clearInput()
      //   })
    }
  }

  const removeMember = (event) => {
    const target = event.target
    if (target.classList.contains('member-delete-button')) {
      const targetParentID = target.parentNode.parentNode.id
      UIMembersController.removeMember(targetParentID)
    }
  }

  const copyMemberLink = (event) => {
    const target = event.target
    if (target.classList.contains('link-button')) {
      const link = target.parentNode.querySelector(DOM.memberItemLinkInput)
      target.classList.add('copied')
      UIMembersController.copyLink(link.value)

      setTimeout(() => target.classList.remove('copied'), 850)
    }
  }

  const addQuestion = () => {
    if (UIQuestionsController.getInputValue() !== '') {
      UIQuestionsController.addQuestionToList(UIQuestionsController.getInputValue())
      meeting.questions = [...meeting.questions, UIQuestionsController.getInputValue()]

      UIQuestionsController.clearInput()
      UIQuestionsController.displayInputSymbolsCounter(0)
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
