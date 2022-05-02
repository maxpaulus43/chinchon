import { canMeldWithCard } from "./MeldLogic";
import { makeDeck } from "./Game";
import { ChinchonCard } from "./Model";

const deck = makeDeck();

/**
 * @param handStr @param handStr string representing a hand
 * 
 * e.g. "J♠️,Q♠️,5♣️,K♠️,10♠️,10♥️,Jo♥️,Jo♠️"
 * @returns ChinchonCard[]
 */
function makeHand(handStr: string): ChinchonCard[] {
  return handStr
    .split(",")
    .map((s) => s.trim())
    .map((id) => deck.find((c) => c.id === id)!);
}

/**
 * @param handStr string representing a hand and a meld card. meld card must be in the hand
 *
 * e.g. "J♠️,Q♠️,5♣️,K♠️,10♠️,10♥️,Jo♥️,Jo♠️ / K♠️"
 * @returns [hand: ChinchonCard[], meldCard: ChinchonCard]
 */
function makeMeldHand(handStr: string): [ChinchonCard[], ChinchonCard] {
  const [cardIds, meldCardId] = handStr.split("/").map((s) => s.trim());
  const hand = makeHand(cardIds);
  const meldCard = hand.find((c) => c.id === meldCardId)!;
  return [hand, meldCard];
}

function canMeldHand(handStr: string): boolean {
  const [hand, meldCard] = makeMeldHand(handStr);
  return canMeldWithCard(hand, meldCard);
}

describe("7-card runs", () => {
  test("7-card run is meldable: A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,8♥️ / 8♥️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,8♥️ / 8♥️")).toBe(true);
  });
  test("7-card run not meldable if not suited", () => {
    expect(canMeldHand("A♣️,2♥️,3♠️,4♥️,5♠️,6♥️,7♣️,8♥️ / 8♥️")).toBe(false);
  });
  test("7-card run is meldable: A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,Jo♥️ / A♥️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,Jo♥️ / A♥️")).toBe(true);
  });
  test("7-card run is meldable: A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,Jo♥️ / 5♥️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,Jo♥️ / 5♥️")).toBe(true);
  });
  test("7-card run is not meldable: A♥️,2♥️,3♥️,10♥️,5♥️,6♥️,Jo♠️,Jo♥️ / 5♥️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,10♥️,5♥️,6♥️,Jo♠️,Jo♥️ / 5♥️")).toBe(false);
  });
});

describe("6-card runs", () => {
  test("6-card run is meldable: 6♥️,7♥️,8♥️,9♥️,10♥️,J♥️,5♣️,K♦️ / K♦️", () => {
    expect(canMeldHand("6♥️,7♥️,8♥️,9♥️,10♥️,J♥️,5♣️,K♦️ / K♦️")).toBe(true);
  });
  test("6-card run is not meldable: 6♥️,7♥️,8♥️,9♥️,10♥️,J♥️,6♣️,K♦️ / K♦️", () => {
    expect(canMeldHand("6♥️,7♥️,8♥️,9♥️,10♥️,J♥️,6♣️,K♦️ / K♦️")).toBe(false);
  });
});

describe("3_4/4_3 combos", () => {
  test("3_4 combo is meldable: A♥️,2♥️,3♥️,4♠️,5♠️,6♠️,5♣️,K♦️ / K♦️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,4♠️,5♠️,6♠️,5♠️,K♦️ / K♦️")).toBe(true);
  });
  test("4_3 combo is meldable: A♥️,2♥️,3♥️,4♥️,5♠️,6♠️,5♠️,K♦️ / K♦️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,4♠️,5♠️,6♠️,5♠️,K♦️ / K♦️")).toBe(true);
  });
  test("4_3 combo is meldable: A♥️,A♠️,A♣️,A♦️,4♥️,5♥️,6♥️,K♦️ / K♦️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,4♠️,5♠️,6♠️,5♠️,K♦️ / K♦️")).toBe(true);
  });
});

describe("3_3 combos", () => {
  test("3_3 combo is meldable: A♥️,2♥️,3♥️,A♣️,4♠️,5♠️,6♠️,K♦️ / K♦️", () => {
    expect(canMeldHand("A♥️,2♥️,3♥️,A♣️,4♠️,6♠️,5♠️,K♦️ / K♦️")).toBe(true);
  });
  test("3_3 combo is meldable: 3♦️,3♣️,A♣️,4♠️,6♠️,5♠️,3♥️,K♦️ / K♦️", () => {
    expect(canMeldHand("3♦️,3♣️,A♣️,4♠️,6♠️,5♠️,3♥️,K♦️ / K♦️")).toBe(true);
  });
  test("3_3 combo is not meldable: 3♦️,3♣️,6♣️,4♠️,6♠️,5♠️,3♥️,K♦️ / K♦️", () => {
    expect(canMeldHand("3♦️,3♣️,6♣️,4♠️,6♠️,5♠️,3♥️,K♦️ / K♦️")).toBe(false);
  });
});

describe("points calulation", () => {
  
})

test("2_5 combo is not meldable: A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,8♥️ / 3♥️", () => {
  expect(canMeldHand("A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,8♥️ / 3♥️")).toBe(false);
});

test("Hand not meldable: A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,8♥️ / 9♥️", () => {
  const hand = makeHand("A♥️,2♥️,3♥️,4♥️,5♥️,6♥️,7♥️,8♥️");
  // choose a meld card which is not in the hand
  const meldCard = deck.find((c) => c.id === "9♥️")!;
  expect(canMeldWithCard(hand, meldCard)).toBe(false);
});
