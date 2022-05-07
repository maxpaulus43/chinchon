import { ChinchonCard, ChinchonGameState } from "./Model";

export function canMeldWithCard(
  cards: ChinchonCard[],
  meldCard: ChinchonCard
): boolean {
  return getMeldablePermutationsForHand(cards, meldCard).length > 0;
}
function getMeldablePermutationsForHand(
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

  for (const permutation of getPermutations(cards.slice())) {
    if (canMeldPermutation(permutation)) {
      result.push(permutation);
    }
  }
  return result;
}

export function calculatePointsForHand(
  G: ChinchonGameState,
  hand: ChinchonCard[]
): [number, ChinchonCard[]] {
  let result = sumLastNCards(hand);
  let optimalPermutation = hand; // TODO do something with this hand

  for (const permutation of getPermutations(hand.slice())) {
    if (is7CardRun(permutation) || is4_3Combo(permutation)) {
      result = -10;
      
      break;
    } else if (is6CardRun(permutation) || is3_3Combo(permutation)) {
      result = Math.min(result, sumLastNCards(permutation, 1));
      optimalPermutation = permutation
    } else if (is5CardRun(permutation)) {
      result = Math.min(result, sumLastNCards(permutation, 2));
      optimalPermutation = permutation
    } else if (is4CardCombo(permutation)) {
      result = Math.min(result, sumLastNCards(permutation, 3));
      optimalPermutation = permutation
    } else if (is3CardCombo(permutation)) {
      result = Math.min(result, sumLastNCards(permutation, 4));
      optimalPermutation = permutation
    }
  }

  return [result, optimalPermutation];
}

/**
 * https://en.wikipedia.org/wiki/Heap%27s_algorithm#:~:text=as%20in%3A-,procedure%20generate(k%20%3A%20integer%2C%20A%20%3A%20array%20of%20any)%3A,-if%20k%20%3D%201
 *
 * Generates permutations for an array
 *
 * warning: modifies the array in place. pass a copy of the arrary to this method
 * @param arr the array for which to generate permutations
 * @param n the number of elements in each permutation, defaults to arr.length
 */
function* getPermutations<T>(arr: T[], n?: number): Generator<T[]> {
  n = n ?? arr.length;
  if (n === 1) {
    yield arr;
  } else {
    for (let i = 0; i < n; i++) {
      yield* getPermutations(arr, n - 1);
      if (i < n - 1) {
        if (n % 2 === 0) {
          [arr[n - 1], arr[i]] = [arr[i], arr[n - 1]];
        } else {
          [arr[n - 1], arr[0]] = [arr[0], arr[n - 1]];
        }
      }
    }
  }
}

function canMeldPermutation(cards: ChinchonCard[]): boolean {
  return (
    is7CardRun(cards) ||
    isMeldable6CardRun(cards) ||
    is4_3Combo(cards) ||
    isMeldable3_3Combo(cards)
  );
}

function isMeldable6CardRun(cards: ChinchonCard[]) {
  return is6CardRun(cards) && cards[cards.length - 1].pointValue <= 5;
}

function isMeldable3_3Combo(cards: ChinchonCard[]) {
  return is3_3Combo(cards) && cards[cards.length - 1].pointValue <= 5;
}

function is7CardRun(cards: ChinchonCard[]): boolean {
  return checkRun(cards);
}

function is6CardRun(cards: ChinchonCard[]): boolean {
  return checkRun(cards.slice(0, 6));
}

function is5CardRun(cards: ChinchonCard[]): boolean {
  return checkRun(cards.slice(0, 5));
}

function is4CardCombo(cards: ChinchonCard[]): boolean {
  return checkCombo(cards.slice(0, 4));
}

function is3CardCombo(cards: ChinchonCard[]): boolean {
  return checkCombo(cards.slice(0, 3));
}

function is4_3Combo(cards: ChinchonCard[]): boolean {
  return checkCombo(cards.slice(0, 4)) && checkCombo(cards.slice(4, 7));
}

function is3_3Combo(cards: ChinchonCard[]): boolean {
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
  // TODO allow Q,K,A at some point
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
export function removeJokersFromCards(cards: ChinchonCard[]): number {
  let jokerCount = 0;
  for (let i = cards.length - 1; i >= 0; i--) {
    if (cards[i].symbol === "Jo") {
      jokerCount++;
      cards.splice(i, 1);
    }
  }
  return jokerCount;
}

export function cardCompareFn(a: ChinchonCard, b: ChinchonCard): number {
  return a.ordinal - b.ordinal;
}

function sumLastNCards(cards: ChinchonCard[], n = cards.length): number {
  return cards.slice(-n).reduce((sum, curr) => sum + curr.pointValue, 0);
}
