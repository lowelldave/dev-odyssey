import type { Tutorial } from '../../types';
import { q } from '../helpers';

export const TYPESCRIPT: Record<string, Tutorial> = {
  'ts-basics': {
    goal: 'Add TypeScript to a project, annotate functions, use unions and literal types, and narrow them safely.',
    steps: [
      {
        title: 'Set up a TypeScript project',
        body: `TypeScript is JavaScript plus types. The compiler (\`tsc\`) checks your code and outputs plain JavaScript. Always enable \`strict\` mode.`,
        code: {
          lang: 'shell',
          src: `npm init -y
npm install -D typescript
npx tsc --init          # creates tsconfig.json with "strict": true
npx tsc --noEmit        # type-check without writing files`,
        },
      },
      {
        title: 'Annotations and inference',
        body: `TypeScript infers most types from values. Annotate function parameters and return types; let inference handle the rest.`,
        code: {
          lang: 'ts',
          src: `let level = 1;                 // inferred as number
// level = 'two';              // error: string is not assignable to number

function expForLevel(level: number): number {
  return level * level * 50;
}

const names: string[] = ['Ada', 'Linus'];`,
        },
      },
      {
        title: 'Unions and literal types',
        body: `A union says "one of these types". Literal types restrict values to exact options, which is great for things like sizes or states.`,
        code: {
          lang: 'ts',
          src: `type Id = string | number;
type Size = 'sm' | 'md' | 'lg';

function badge(size: Size) { /* ... */ }
badge('md');
// badge('xl');   // error: not one of the allowed values`,
        },
      },
      {
        title: 'Narrowing',
        body: `When a value could be several types, check which one it is before using type-specific features. TypeScript tracks the check and narrows the type inside the branch.`,
        code: {
          lang: 'ts',
          src: `function formatId(id: string | number) {
  if (typeof id === 'string') {
    return id.toUpperCase();   // id is string here
  }
  return id.toFixed(0);        // id is number here
}

function parse(input: unknown) {
  // unknown forces you to check before use (safer than any)
  if (typeof input === 'string') return input.trim();
  return '';
}`,
        },
        tryIt: 'Convert one of your JavaScript files to `.ts` with strict mode on, and fix every error.',
      },
    ],
    mistakes: [
      'Using `any` to silence errors: it switches type checking off.',
      'Annotating everything, even obvious variables: let inference work.',
      'Turning off `strict` because it feels hard: that is where the value is.',
    ],
    recap: [
      '`strict` mode on; `tsc --noEmit` to type-check.',
      'Annotate parameters, infer the rest.',
      'Unions + literal types model choices; narrow with `typeof`/`in`.',
    ],
    quiz: [
      q('What is the safer alternative to `any` for values of unknown shape?', ['object', 'unknown', 'never', 'void'], 1),
      q('`type Size = "sm" | "md"` is a…', ['Enum', 'Union of literal types', 'Interface', 'Generic'], 1),
      q('How can you narrow `string | number` to string?', ['typeof x === "string"', 'JSON.parse(x)', 'You cannot', 'x as any'], 0),
      q('Which tsconfig option enables the full set of strict checks?', ['"noEmit"', '"strict": true', '"allowJs"', '"target"'], 1),
      q('What does TypeScript infer for `let level = 1`?', ['any', 'number', 'string', 'unknown'], 1),
    ],
  },

  'ts-objects': {
    goal: 'Model data with interfaces and types, write reusable generic functions, and use utility types.',
    steps: [
      {
        title: 'Describing objects',
        body: `\`interface\` and \`type\` both describe object shapes. Use \`?\` for optional properties and \`readonly\` for ones that must not change.`,
        code: {
          lang: 'ts',
          src: `interface Hero {
  readonly id: number;
  name: string;
  level: number;
  guild?: string;      // optional
}

const ada: Hero = { id: 1, name: 'Ada', level: 3 };
// ada.id = 2;        // error: readonly`,
        },
      },
      {
        title: 'Extending types',
        body: `Interfaces can extend each other; types combine with \`&\`. Pick whichever your team prefers and stay consistent.`,
        code: {
          lang: 'ts',
          src: `interface Mage extends Hero {
  mana: number;
}

type Timestamps = { createdAt: Date; updatedAt: Date };
type SavedHero = Hero & Timestamps;`,
        },
      },
      {
        title: 'Generics',
        body: `Generics are type parameters: they let one function work with many types while staying type-safe.`,
        code: {
          lang: 'ts',
          src: `function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([10, 20]);        // number | undefined
const h = first<Hero>([ada]);     // Hero | undefined

function groupBy<T, K extends string>(items: T[], key: (item: T) => K) {
  const out = {} as Record<K, T[]>;
  for (const item of items) (out[key(item)] ??= []).push(item);
  return out;
}`,
        },
        tryIt: 'Write a generic `last<T>(items: T[])` and a `pluck<T, K extends keyof T>(items: T[], key: K)` that returns `T[K][]`.',
      },
      {
        title: 'Utility types',
        body: `TypeScript ships helpers that transform types:

- \`Partial<T>\` makes every property optional, which suits update payloads.
- \`Pick<T, K>\` / \`Omit<T, K>\` keep or drop properties.
- \`Record<K, V>\` is an object with keys \`K\` and values \`V\`.
- \`ReturnType<F>\` is the return type of a function.`,
        code: {
          lang: 'ts',
          src: `type HeroUpdate = Partial<Omit<Hero, 'id'>>;
function updateHero(id: number, changes: HeroUpdate) { /* ... */ }
updateHero(1, { level: 4 });

type PublicHero = Pick<Hero, 'name' | 'level'>;
const expByLevel: Record<number, number> = { 1: 50, 2: 200 };`,
        },
      },
    ],
    mistakes: [
      'Copy-pasting near-identical types instead of deriving them with `Pick`/`Omit`.',
      'Overusing generics where a simple concrete type is clearer.',
    ],
    recap: [
      'Interfaces/types describe shapes; `?` optional, `readonly` immutable.',
      'Generics keep reusable functions type-safe.',
      'Utility types derive new types from existing ones.',
    ],
    quiz: [
      q('What does Partial<User> produce?', ['User with all properties required', 'User with all properties optional', 'An empty type', 'An array of User'], 1),
      q('What does Omit<User, "password"> do?', ['Adds password', 'Removes the password property', 'Makes password optional', 'Throws an error'], 1),
      q('In `function id<T>(x: T): T`, T is a…', ['Tuple', 'Type parameter', 'Template literal', 'Type assertion'], 1),
      q('Record<string, number> describes…', ['An array of numbers', 'An object with string keys and number values', 'A Map class', 'A tuple'], 1),
      q('How do you mark a property as optional in an interface?', ['name!: string', 'name?: string', 'optional name: string', 'name: string | optional'], 1),
    ],
  },

  'ts-advanced': {
    goal: 'Model app states with discriminated unions, write type guards, and validate untrusted data at runtime with Zod.',
    steps: [
      {
        title: 'Discriminated unions',
        body: `Give each variant a shared literal field (the discriminant). TypeScript then knows exactly which fields exist in each branch.`,
        code: {
          lang: 'ts',
          src: `type Request<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function render(r: Request<string[]>) {
  switch (r.status) {
    case 'success': return r.data.join(', ');   // data exists here
    case 'error':   return \`Error: \${r.message}\`;
    default:        return 'Loading…';
  }
}`,
        },
      },
      {
        title: 'Exhaustiveness with never',
        body: `If you forget a case, the \`never\` check makes the compiler complain, so new variants can't slip through.`,
        code: {
          lang: 'ts',
          src: `function assertNever(x: never): never {
  throw new Error(\`Unhandled: \${JSON.stringify(x)}\`);
}

// in a switch: default: return assertNever(r);`,
        },
      },
      {
        title: 'Type guards and satisfies',
        body: `A custom type guard returns \`value is Type\`, teaching TypeScript about your own checks. \`satisfies\` checks a value against a type without widening it.`,
        code: {
          lang: 'ts',
          src: `function isHero(x: unknown): x is Hero {
  return typeof x === 'object' && x !== null && 'name' in x && 'level' in x;
}

const theme = {
  primary: '#3450c4',
  gold: '#ffd34d',
} satisfies Record<string, string>;   // keys stay exact: theme.primary`,
        },
      },
      {
        title: 'Validate at the boundary with Zod',
        body: `Types disappear at runtime: \`fetch\` can return anything. Validate external data once, at the edge of your app, and get a typed value back.`,
        code: {
          lang: 'ts',
          src: `import { z } from 'zod';

const HeroSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  level: z.number().int().positive(),
});
type Hero = z.infer<typeof HeroSchema>;   // type derived from the schema

const res = await fetch('/api/hero/1');
const hero = HeroSchema.parse(await res.json());   // throws if invalid`,
        },
        tryIt: 'Model a quiz attempt as a discriminated union (`in-progress` | `passed` | `failed`) and write an exhaustive `describe()` function.',
      },
    ],
    mistakes: [
      'Using `as Hero` to "cast" API data: it lies to the compiler and validates nothing.',
      'Modelling states with many optional booleans (`isLoading`, `isError`…) instead of one union.',
    ],
    recap: [
      'Discriminated unions + `switch` model state cleanly.',
      '`never` makes switches exhaustive.',
      'Validate runtime data with Zod; infer types from schemas.',
    ],
    quiz: [
      q('Why validate API responses with Zod even in TypeScript?', ['TypeScript types do not exist at runtime', 'Zod makes code faster', 'TypeScript forbids fetch', 'npm requires it'], 0),
      q('A function with return type `x is User` is a…', ['Generic', 'Type guard', 'Decorator', 'Assertion error'], 1),
      q('What is the `never` type useful for here?', ['Optional values', 'Exhaustiveness checks', 'Numbers', 'Promises'], 1),
      q('What does `satisfies` do?', ['Casts to any', 'Checks a value matches a type while keeping its narrower inferred type', 'Creates a class', 'Exports a type'], 1),
      q('In a discriminated union, the discriminant is…', ['A shared literal field like `status`', 'A generic parameter', 'An optional property', 'A class name'], 0),
    ],
  },

  boss: {
    goal: 'Publish a strictly-typed TypeScript library with generics, a discriminated union, unit tests and a build: proof you can write production-grade typed code.',
    steps: [
      {
        title: 'Choose and scaffold',
        body: `Ideas: a tiny state machine, a type-safe event emitter, a validation helper library, or a typed API client. Set up TypeScript and Vitest.`,
        code: {
          lang: 'shell',
          src: `npm init -y
npm install -D typescript vitest
npx tsc --init
mkdir src`,
        },
      },
      {
        title: 'Configure strict compilation',
        body: `Make sure the important flags are on, and emit type declarations so users of your library get autocomplete.`,
        code: {
          lang: 'json',
          caption: 'tsconfig.json (key options)',
          src: `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"]
}`,
        },
      },
      {
        title: 'Write the typed core',
        body: `Use at least one generic and one discriminated union. A type-safe event emitter, for example:`,
        code: {
          lang: 'ts',
          caption: 'src/emitter.ts',
          src: `export function createEmitter<Events extends Record<string, unknown>>() {
  const listeners: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
  return {
    on<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
      (listeners[event] ??= []).push(fn);
    },
    emit<K extends keyof Events>(event: K, payload: Events[K]) {
      listeners[event]?.forEach((fn) => fn(payload));
    },
  };
}

// usage: const bus = createEmitter<{ levelUp: { level: number } }>();`,
        },
      },
      {
        title: 'Test it',
        body: `Write unit tests next to the code. Cover normal cases and edge cases.`,
        code: {
          lang: 'ts',
          caption: 'src/emitter.test.ts',
          src: `import { describe, expect, it, vi } from 'vitest';
import { createEmitter } from './emitter';

describe('createEmitter', () => {
  it('calls listeners with the payload', () => {
    const bus = createEmitter<{ levelUp: { level: number } }>();
    const fn = vi.fn();
    bus.on('levelUp', fn);
    bus.emit('levelUp', { level: 2 });
    expect(fn).toHaveBeenCalledWith({ level: 2 });
  });
});`,
        },
        tryIt: 'Add `"test": "vitest run"` and `"build": "tsc"` scripts and get both passing.',
      },
      {
        title: 'Document and submit',
        body: `Write a README with install and usage examples (show the autocomplete in a screenshot!), the design decisions, and how to run the tests. Commit in small steps, then submit the repo.`,
      },
    ],
    mistakes: [
      'Leaving `any` in public APIs: users lose all type safety.',
      'No tests for edge cases (empty input, unknown events…).',
    ],
    recap: [
      'Strict tsconfig with declarations.',
      'Generics + discriminated unions in a real API.',
      'Vitest unit tests and a documented README.',
    ],
  },
};
