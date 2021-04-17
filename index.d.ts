type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
type FixedLengthArray<T extends any[]> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> }

declare class Card {
  id: string;
  name: string;
  imgUrl: string;
  targetHash: string;
  activateHash: string;
  gyHash: string;
}

type Zones = FixedLengthArray<[Card, Card, Card, Card, Card]>

type Field = {
  monsters: Zones,
  backrom: Zones,
  gy: Card[]
}

type PlayerInfo = {
  lp: number,
  hand: Card[],
  field: Field
}

type GameState = {
  client: PlayerInfo,
  opp: PlayerInfo
}
