// 遊戲中的五個狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  './images/spades.png', // 黑桃
  './images/heart.png', // 愛心
  './images/diamonds.png', // 方塊
  './images/clubs.png' // 梅花
]

const view = {
  //當物件的屬性與函式/變數名稱相同時，可以省略不寫
  //負責生成卡片外殼
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  //負責生成卡片內容，包括花色和數字
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  transformNumber (number) {
  switch (number) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default:
      return number
    }
  },
  //負責選出 #cards 並抽換內容
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  //翻牌動作
  flipCard (card) {
    // console.log(card)
    if (card.classList.contains('back')) {
      // 回傳正面
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index)) 
      return
    }
    // 回傳背面
    card.classList.add('back')
    card.innerHTML = null
  },
  //當翻牌成對時換色
  pairCard(card) {
    card.classList.add('paired')
  }
}

const model = {
  revealedCards: [],
  //判斷兩張牌是否一樣
  isRevealedCardsMatched() {
  return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,  // 初始狀態，等待翻第一張牌
  //匯出52張卡牌
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //遊戲過程中的各種階段判斷
  dispatchCardAction (card) {
    //若牌已翻正，不再做任何動作
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(model.revealedCards[0])
          view.pairCard(model.revealedCards[1])
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(() => {
            view.flipCard(model.revealedCards[0])
            view.flipCard(model.revealedCards[1])
            model.revealedCards = []
            this.currentState = GAME_STATE.FirstCardAwaits
          }, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))

  }
}

//洗牌
const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards() // 取代 view.displayCards()

//為每一張卡片設置監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})

