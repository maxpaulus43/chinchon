import { ChinchonCard } from "./Model";

export function canMeldWithCard(
  cards: ChinchonCard[],
  meldCard: ChinchonCard
): boolean {
  const meldCardIdx = cards.findIndex((c) => c.id === meldCard.id);
  if (meldCardIdx < 0 || cards.length !== 8) {
    return false;
  }
  cards = cards.slice();
  cards.splice(meldCardIdx, 1);

  if (is7CardRun(cards)) {
    return true;
  }
  for (const permutation of getPermutations(cards.slice())) {
    if (canMeldPermutation(permutation)) {
      return true;
    }
  }
  return false;
}
export function getMeldablePermutationsForHand(
  cards: ChinchonCard[],
  meldCard: ChinchonCard
): ChinchonCard[][] {
  const result: ChinchonCard[][] = [];
  const meldCardIdx = cards.findIndex((c) => c.id === meldCard.id);
  if (meldCardIdx < 0 || cards.length !== 8) {
    return result;
  }
  cards = cards.slice();
  cards.splice(meldCardIdx, 1);

  if (is7CardRun(cards)) {
    result.push(cards);
  }
  for (const permutation of getPermutations(cards.slice())) {
    if (canMeldPermutation(permutation)) {
      result.push(permutation);
    }
  }
  return result;
}

// https://en.wikipedia.org/wiki/Heap%27s_algorithm
function* getPermutations(arr: any[], n?: number): any {
  n = n ?? arr.length;
  if (n <= 1) {
    yield arr;
  } else {
    for (let i = 0; i < n - 1; i++) {
      yield* getPermutations(arr, n - 1);
      if (n % 2 === 0) {
        [arr[n - 1], arr[i]] = [arr[i], arr[n - 1]];
      } else {
        [arr[n - 1], arr[0]] = [arr[0], arr[n - 1]];
      }
    }
  }
}

function canMeldPermutation(cards: ChinchonCard[]): boolean {
  return is6CardRun(cards) || is4_3Combo(cards) || is3_3Combo(cards);
}

function is7CardRun(cards: ChinchonCard[]): boolean {
  return checkRun(cards);
}

function is6CardRun(cards: ChinchonCard[]): boolean {
  if (cards[cards.length - 1].pointValue > 5) {
    return false;
  }
  return checkRun(cards.slice(0, 6));
}

function is4_3Combo(cards: ChinchonCard[]): boolean {
  return checkCombo(cards.slice(0, 4)) && checkCombo(cards.slice(4, 7));
}

function is3_3Combo(cards: ChinchonCard[]): boolean {
  if (cards[cards.length - 1].pointValue > 5) {
    return false;
  }
  return checkCombo(cards.slice(0, 3)) && checkCombo(cards.slice(3, 6));
}

function checkCombo(cards: ChinchonCard[]): boolean {
  return checkSet(cards) || checkRun(cards);
}

function checkSet(cards: ChinchonCard[]): boolean {
  cards = cards.slice();
  removeJokersFromCards(cards);
  for (let i = 1; i < cards.length; i++) {
    const prevCard = cards[i - 1];
    const currCard = cards[i];
    if (currCard.symbol !== prevCard.symbol) {
      return false;
    }
  }
  return true;
}

function checkRun(cards: ChinchonCard[]): boolean {
  cards = cards.slice().sort(cardCompareFn);
  const jokerCount = removeJokersFromCards(cards);
  // check that all cards have the same suit
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].suit !== cards[0].suit) {
      return false;
    }
  }
  const lowestOrdinal = cards[0].ordinal;
  const highestOrdinal = cards[cards.length - 1].ordinal;
  const expectedCardsLength = highestOrdinal - lowestOrdinal + 1;
  return cards.length + jokerCount >= expectedCardsLength;
}

/**
 * removed jokers in place
 * @returns the count of jokers that were removed
 */
function removeJokersFromCards(cards: ChinchonCard[]): number {
  let jokerCount = 0;
  for (let i = cards.length - 1; i >= 0; i--) {
    if (cards[i].symbol === "Jo") {
      jokerCount++;
      cards.splice(i, 1);
    }
  }
  return jokerCount;
}

function cardCompareFn(a: ChinchonCard, b: ChinchonCard): number {
  return a.ordinal - b.ordinal;
}
