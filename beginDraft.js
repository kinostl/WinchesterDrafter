let boosterDeck = []
const boosterCalls = []

let currentPlayer = 0

const decks = [[], []]
const stacks = {
  stack_1: [],
  stack_2: [],
  stack_3: [],
  stack_4: []
}

function getDraftBooster (symbol) {
  // 10 Common
  // 3  Uncommon
  // 1 Rare or Mythic Rare
  // Rare is 1/8
  // Mythic is 7/8
  const isMythic = _.random(1, 8) === 8

  const urls = [
    `https://api.magicthegathering.io/v1/cards?set=${symbol}&rarity=common&random=true&pageSize=10&types=Creature|Instant|Sorcery|Enchantment|Artifact|Planeswalker`,
    `https://api.magicthegathering.io/v1/cards?set=${symbol}&rarity=uncommon&random=true&pageSize=3&types=Creature|Instant|Sorcery|Enchantment|Artifact|Planeswalker`,
    `https://api.magicthegathering.io/v1/cards?set=${symbol}&rarity=${
      isMythic ? 'mythic' : 'rare'
    }&random=true&pageSize=1&types=Creature|Instant|Sorcery|Enchantment|Artifact|Planeswalker`
  ]
  const calls = []
  for (const url of urls) {
    calls.push(
      Promise.resolve(res => setTimeout(res, 500))
        .then(() => fetch(url))
        .then(response => response.json())
        .then(res => {
          boosterDeck.push(...res.cards)
        })
    )
  }

  return calls
}

for (let i = 0; i < 6; i++) {
  boosterCalls.push(...getDraftBooster('C21'))
}

function startTurn () {
  const cards = [
    null,
    boosterDeck.pop(),
    boosterDeck.pop(),
    boosterDeck.pop(),
    boosterDeck.pop()
  ]
  for (let i = 1; i <= 4; i++) {
    if (cards[i]) {
      stacks[`stack_${i}`].push(cards[i])
      u(`#stack_${i}`).append(`<li><img src="${cards[i].imageUrl}"></li>`)
    }
  }
}

function getDek (deck) {
  let deckList = ''
  const cardCount = {}

  for (const card of deck) {
    if (!cardCount[card.name]) cardCount[card.name] = 1
    else cardCount[card.name]++
  }

  for (const card in cardCount) {
    deckList += `${cardCount[card]} ${card}\n`
  }

  return 'data:' + 'text/plain;' + 'base64,' + btoa(deckList)
}

function startDraft () {
  boosterDeck = _.shuffle(boosterDeck)
  startTurn()
}

Promise.all(boosterCalls).then(() => {
  startDraft()
})

u('button.stack_button').handle('click', e => {
  const stack = e.target.dataset.stack
  if (stacks[stack].length === 0) return

  for (const card of stacks[stack]) {
    if (card) {
      u(`#deck_${currentPlayer}`).append(`<li>${card.name}</li>`)
      decks[currentPlayer].push(card)
    }
  }

  stacks[stack] = []
  u(`#${stack}`).empty()

  u(`#player_${currentPlayer}`).removeClass('current_player')

  if (currentPlayer === 0) currentPlayer = 1
  else currentPlayer = 0

  u(`#player_${currentPlayer}`).addClass('current_player')

  if (
    boosterDeck.length === 0 &&
    stacks.stack_1.length === 0 &&
    stacks.stack_2.length === 0 &&
    stacks.stack_3.length === 0 &&
    stacks.stack_4.length === 0
  ) {
    u('#stacks').addClass('end_mode')
    u('#decks').addClass('end_mode')
    u('.dek_button').addClass('end_mode')
    u('#dek_button_0').attr({
      href: getDek(decks[0]),
      download: 'Player 1.dek'
    })
    u('#dek_button_1').attr({
      href: getDek(decks[1]),
      download: 'Player 2.dek'
    })
    u(`#player_${currentPlayer}`).removeClass('current_player')
  } else {
    startTurn()
  }
})
