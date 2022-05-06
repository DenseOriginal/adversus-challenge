# Forklaring af min tankegang

## State management

Efter at have læst README synes jeg at der var et stort problem, som skulle blive løst for at have et solidt produkt. Dette problem var hvordan jeg skulle håndtere state i programmet. Hvis dette havde været et større program, så ville jeg nok have brugt et mere robust state management library, såsom Redux eller lignende.
Men da et stort library ville være for komplekst for dette simple program var min næst bedste ide selv at implementere et lille stykke kode der kunne gøre det for mig. Dette gjorde jeg i form af en singleton klasse, som ligger ovenpå de to medfølgende services. Klassen er implementeret som en singleton da dette giver et single source of truth, som jeg kan bygge resten af projektet ovenpå.

Services er blevet lavet til en singletion ved at gøre constructoren privat `private constructor() {}`, hvilket gør at man ikke kan instantiate et nyt objekt ved hjælp af `new`. Måden man så for en instance af servicen, er ved brug af den statiske metode `BackendService.Instance` som returnerer en instance af klassen.
Hvis der er første gang at noget prøver at få fat på instancen så opretter den en ny, og gemmer den i en privat statisk variable, som så herefter vil blive returneret.

`src/services/backend.ts`

```ts
// Singleton statics
private static singletonInstance?: BackendService;
public static get Instance(): BackendService {
  // If the class hasn't been instantiated, then do it
  if (!this.singletonInstance) this.singletonInstance = new this();
  return this.singletonInstance;
}
```

Da jeg nu havde en service der stod for alt dataen i programmet, betød det at jeg også kunne cache statisk data. Jeg har taget den antaglese at hverken brugeren aller produktet ændrer sig i lifetime af dette program, og har derfor cached brugeren og produktet. Dette betyder at respsonse bliver væsentlig hurtige efter at en bruger/produkt er blevet fetched første gang.

Herunder ses `getUser()` metoden som returnerer en given bruger ud fra et id. Metoden rammer kun API'en hvis brugeren ikke findes i cachen.

`src/services/backend.ts`

```typescript
private userCache = new Map<number, User>();
public async getUser(id: number): Promise<User> {
  // Try to find the User from the cache, and return if found
  const cachedUser = this.userCache.get(id);
  if(cachedUser) return cachedUser;

  // Otherwise fetch the User, save it to the cache, and return it
  const fetchedUser = await this.entityStore.getUser(id);
  this.userCache.set(id, fetchedUser);
  return fetchedUser;
}
```

## "Fejl" i programmet

Jeg var i tvivl om jeg måtte ændre eller tilføje til de allerede skrevne services, `messages.ts` og `meta-store.ts`, jeg valgte og lave være med at pille ved dem, og istedet for skrive `backend.ts` som et lag ovenpå. Dog var der ting som jeg hellere ville have tilføjet til de originale services, og som jeg valgte at lade være med at implementere selv. Den største af dem var, at man ikke kan unregister fra `messages.ts` efter at man har kaldt `registerSalesEventListener`.
Eftersom jeg registrerer en ny listener i hver sales view (for at undgå en masse props), betyder det at der opstår memory leaks, som react også skriver i consolen. Nedenunder har jeg dog giver mit forslag til hvordan man simpelt kunne gøre det muligt at unregister.
Dette gør jeg ved at returnere en anonymous function i `registerSalesEventListener` som unsubscriber listeneren når den bliver kaldt.

```typescript
export class SalesEventHub {
  private observers = [];

 registerSalesEventListener(callback: SaleEventCallback): () => void {
    this.observers.push(callback);

    return () => {
      const indexOf = this.observers.indexOf(callback);
      if (indexOf == -1) throw new Error('Unknown observer, it might already be unregistered');
      this.observers.splice(indexOf, 1);
    }
  }
}
```

Dette betyder at du kan unregister ved at kalde den returnerede function, eksempel på dette herunder:

```tsx
export class SplashModal extends React.Component<Props> {
  observerHandle?: () => {};
  backendService = BackendService.Instance;

  componentDidMount() {
    this.observerHandle = backendService.registerSalesEventListener(() => {});
  }

  componentWillUnmount() {
    this.obserHandle();
  }

  render() { ... }
}
```

## Afslutning

Det var mit bud på hvordan man kunne løse jeres lille opgave. Jeg håber at jeg fik det hele, og at den er blevet løst ordenligt.
