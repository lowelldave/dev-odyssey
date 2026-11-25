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
      q('What is the safer alternative to `any` for values of unknown shape?', ['unknown', 'object', 'never', 'void'], 0, '`unknown` accepts any value but forces you to narrow it before use, whereas `any` switches off checking.', 'One type forces you to check before you use it.'),
      q('`type Size = "sm" | "md"` is a…', ['Enum', 'Interface or type alias', 'Union of literal types', 'Generic'], 2, 'Each member is a literal type and the `|` combines them, so only those exact strings are allowed.', 'It lists the exact allowed values.'),
      q('How can you narrow `string | number` to string?', ['JSON.parse(x) on the value', 'typeof x === "string"', 'You cannot', 'x as any'], 1, 'A `typeof` check inside an `if` narrows the type within that branch.', 'Use a check the compiler understands.'),
      q('Which tsconfig option enables the full set of strict checks?', ['"noEmit"', '"target"', '"allowJs": true', '"strict": true'], 3, '`strict` turns on a family of checks including `strictNullChecks` and `noImplicitAny`.', 'The option is named after the mode itself.'),
      q('What does TypeScript infer for `let level = 1`?', ['any', 'string', 'number', 'unknown'], 2, 'Inference widens the literal 1 to `number` because a `let` can be reassigned.', 'The compiler looks at the initial value.'),
      q('What type does TypeScript infer for `const mode = "dark"`?', ['The literal type "dark"', 'string', 'any', 'A wide string type that allows any text'], 0, 'A `const` cannot change, so the narrowest type is kept: the literal `"dark"`.', 'A constant can never hold another value.'),
      q('Which annotation describes a pair of a string followed by a number?', ['Array<string, number>', 'string | number', '(string, number)', '[string, number]'], 3, 'A tuple type fixes the length and the type at each position.', 'Square brackets with a fixed order.'),
      q('What does annotating a value as `any` do?', ['Makes it immutable', 'Turns off type checking for that value', 'Makes it nullable', 'Converts the value into a string at compile time'], 1, '`any` opts out of type safety and spreads silently, so prefer `unknown` and narrowing.', 'It is an escape hatch.'),
      q('You pass a `number` to `function f(s: string)`. When does TypeScript complain?', ['At runtime when the function runs', 'At compile (type-check) time', 'Only in production', 'Never'], 1, 'Type errors are reported by the compiler or editor before the code runs.', 'Types are checked before execution.'),
      q('What happens to type annotations when TypeScript is compiled to JavaScript?', ['They become runtime checks', 'They are sent to the server', 'They become comments in the output', 'They are erased'], 3, 'Types exist only at compile time, which is why external data needs runtime validation.', 'The running program does not know about them.'),
      q('What does `strictNullChecks` change?', ['`null` and `undefined` are not assignable to other types unless included in the union', 'null becomes an alias for 0 in all arithmetic', 'Null values are automatically stripped out of objects at runtime, so they never appear', 'Strings are no longer allowed to be empty'], 0, 'With it on, `string` does not accept `null` or `undefined`, catching a whole class of runtime errors.', 'It is about which values are allowed into a type.'),
      q('Given `x: string | number`, what is `x` after `if (typeof x === "string") { return x.toUpperCase(); }`?', ['string', 'string | number', 'number', 'never'], 2, 'The `string` case has returned, so control flow analysis narrows the remaining type to `number`.', 'The compiler tracks which cases already returned.'),
      q('What does `"error" in result` do for narrowing?', ['Throws an error whenever that key is missing from the object', 'Converts the result to a string', 'Adds an error property to the object', 'Narrows to union members that have an `error` property'], 3, 'The `in` operator is a type guard that selects union members containing that key.', 'It tests whether a key exists.'),
      q('What does `value as string` do?', ['Converts the value into a real string at runtime, using String() behind the scenes', 'Tells the compiler to treat the value as a string with no runtime check', 'Throws if it is not a string', 'Declares a new variable'], 1, 'A type assertion overrides inference only; if you are wrong, the bug appears at runtime.', 'It affects the compiler, not the running code.'),
      q('What return type does a function with no `return` value have?', ['null', 'never', 'void', 'unknown'], 2, '`void` means the function’s return value is not meant to be used.', 'It returns nothing useful.'),
      q('What does the non-null assertion `user!.name` do?', ['Tells the compiler `user` is not null or undefined, without any runtime check', 'Throws an exception at runtime when `user` turns out to be null or undefined, always', 'Makes the `name` property optional', 'Converts `user` into a string first'], 0, 'The `!` removes `null` and `undefined` from the type only at compile time, so it can hide real bugs.', 'It silences the compiler but changes nothing at runtime.'),
      q('What must you do before using a value of type `unknown`?', ['Narrow or check its type first', 'Nothing, it behaves like any type', 'Cast it with `!`', 'Declare it with `var`'], 0, 'The compiler only allows operations after a type guard such as `typeof` or `instanceof` proves the type.', 'The compiler wants proof first.'),
      q('What does `readonly string[]` mean?', ['An array you cannot reassign', 'An array whose items are readonly strings only, but the array itself can change', 'An array you cannot mutate (no push or index assignment)', 'A tuple'], 2, 'The compiler rejects mutating methods such as `push` on a `readonly` array type.', 'It blocks methods that change the array.'),
      q('Which file configures the TypeScript compiler for a project?', ['typescript.config', 'tsconfig.json', 'package-lock.json', '.tsrc'], 1, '`tsconfig.json` sets compiler options and which files are included.', 'The file is named after the tool.'),
      q('What does `tsc --noEmit` do?', ['Compiles the code to JavaScript but skips the type checking step entirely', 'Runs the compiled program once', 'Deletes previously compiled files', 'Type-checks the project without writing any JavaScript output'], 3, 'It is common in Vite projects, where the bundler transpiles and `tsc` is used only for type checking.', 'The flag stops output files.'),
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
      q('What does Partial<User> produce?', ['User with all properties required', 'An empty type', 'User with all properties optional', 'An array of User'], 2, '`Partial<T>` makes every property optional, which is useful for update payloads.', 'The name says only part of it needs to be present.'),
      q('What does Omit<User, "password"> do?', ['Removes the password property', 'Adds password', 'Makes the password property optional', 'Throws an error'], 0, '`Omit<T, K>` creates a type with the listed keys removed.', 'Think of leaving something out.'),
      q('In `function id<T>(x: T): T`, T is a…', ['Tuple', 'Type assertion', 'Template literal', 'Type parameter'], 3, 'Generics declare placeholders for types that the caller (or inference) fills in.', 'It is a placeholder for a type.'),
      q('Record<string, number> describes…', ['An array whose elements are all numbers', 'An object with string keys and number values', 'A built-in Map class with numeric values only', 'A tuple with a fixed number of elements'], 1, '`Record<K, V>` is an object type whose keys are `K` and values are `V`.', 'It is a dictionary-style object.'),
      q('How do you mark a property as optional in an interface?', ['name!: string', 'name?: string', 'optional name: string', 'name: string | optional'], 1, 'A question mark after the property name makes it optional, so its type includes `undefined`.', 'Look for punctuation after the name.'),
      q('What does `Pick<User, "id" | "name">` produce?', ['User without the id and name properties at all', 'A function', 'A union of id and name', 'A type with only the id and name properties'], 3, '`Pick<T, K>` keeps only the listed keys, the inverse of `Omit`.', 'It selects a subset of properties.'),
      q('What happens if you assign to a `readonly` property?', ['A compile-time error', 'Nothing', 'A runtime exception', 'It is silently ignored at runtime and compile time'], 0, '`readonly` is enforced by the compiler only; at runtime the assignment would still work.', 'Where is `readonly` enforced?'),
      q('Which can be extended later by declaring it again with the same name (declaration merging)?', ['type alias', 'enum member', 'interface', 'union'], 2, 'Repeated `interface` declarations merge, which is how libraries add to global types. Type aliases cannot be redeclared.', 'One of the two ways to describe objects supports this.'),
      q('What does `interface Admin extends User { role: "admin" }` mean?', ['Admin must have a field called extends, of type User', 'Admin is optional', 'Admin replaces User', 'Admin has all of User’s properties plus role'], 3, 'Extending builds a more specific type from an existing one.', 'It builds on something that already exists.'),
      q('What does `type AdminUser = User & { role: "admin" }` create?', ['A union that can be either one of the types, not both', 'An intersection that has the members of both types', 'A deep copy of the User type', 'A generic type with a hidden parameter'], 1, 'An intersection combines types: a value must satisfy both.', 'The ampersand means “and”.'),
      q('What does `keyof User` produce?', ['The first key declared on the type', 'An array containing the property values', 'A union of User’s property names as string literal types', 'A boolean saying whether the type has any keys at all'], 2, 'For `{ id: number; name: string }`, `keyof` gives `"id" | "name"`.', 'It gives names, not values.'),
      q('With `function first<T>(arr: T[]): T | undefined`, what does `first([1, 2, 3])` have as its type?', ['number | undefined', 'T', 'number[] | undefined', 'unknown'], 0, 'T is inferred as `number`, so the return type is `number | undefined`.', 'Substitute the inferred T.'),
      q('What does the constraint in `<T extends { id: number }>` mean?', ['T must have an `id` property of type number', 'T is always the number type', 'T extends the number prototype in JavaScript', 'T is optional'], 0, 'Constraints limit which types can be passed while still allowing richer ones.', 'It sets a minimum requirement on T.'),
      q('What does `ReturnType<typeof fn>` give you?', ['The parameters of fn', 'The type of fn’s own name', 'The type that fn returns', 'A Promise'], 2, 'It extracts the return type of a function type, useful when the function is the source of truth.', 'The utility’s name says it.'),
      q('Which utility type makes every property required, the opposite of `Partial`?', ['Complete<T>', 'Required<T>', 'Mandatory<T>', 'Strict<T>'], 1, '`Required<T>` removes the optional modifier from all properties.', 'The name matches the opposite of optional.'),
      q('What does `Readonly<User>` do?', ['Makes them optional', 'Freezes the object at runtime with Object.freeze', 'Removes all properties', 'Makes every property read-only to the compiler'], 3, 'It is a compile-time modifier only, unlike `Object.freeze`.', 'Is the protection enforced at compile time or runtime?'),
      q('What does `type Config = typeof config` do when `config` is a value?', ['Imports the value of config from another module file', 'Creates a runtime copy of the value', 'Captures the type of that value for use as a type', 'Checks whether two types are equal'], 2, 'In a type position `typeof` extracts the inferred type of an existing value.', 'It takes a value and gives back a type.'),
      q('What does `{ [key: string]: number }` describe?', ['An object with any string keys whose values are numbers', 'An array whose elements are numbers', 'A tuple of a string and a number', 'A function that takes a string and returns a number'], 0, 'An index signature allows arbitrary keys of the given type, like `Record<string, number>`.', 'The square brackets describe what keys are allowed.'),
      q('What does `Awaited<Promise<string>>` evaluate to?', ['Promise<string>', 'void', 'unknown', 'string'], 3, '`Awaited` unwraps the value type a promise resolves to, as `await` would.', 'It models what `await` gives you.'),
      q('`Array<string>` is equivalent to…', ['[string]', 'string[]', 'string | string', 'Record<string, string>'], 1, 'Both spellings describe an array of strings; `T[]` is the usual shorthand.', 'There is a shorter syntax for the same type.'),
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
      q('Why validate API responses with Zod even in TypeScript?', ['Zod makes code faster', 'TypeScript types do not exist at runtime', 'TypeScript forbids using fetch in strict mode', 'npm requires it'], 1, 'Types are erased at compile time, so a server can send anything and TypeScript would never notice. Runtime validation checks the real data.', 'What is left of your types when the code runs?'),
      q('A function with return type `x is User` is a…', ['Generic', 'Assertion error', 'Decorator', 'Type guard'], 3, 'A user-defined type guard returns a boolean and tells the compiler how to narrow `x` when it is true.', 'The `is` clause teaches the compiler something.'),
      q('What is the `never` type useful for here?', ['Exhaustiveness checks', 'Optional values and defaults', 'Numbers', 'Promises'], 0, 'Assigning the leftover value in a `switch` default to `never` makes the compiler error if a case is unhandled.', 'It represents a value that cannot occur.'),
      q('What does `satisfies` do?', ['Casts the value to any so that every type error simply goes away at once, silently', 'Creates a class from the value’s shape', 'Checks a value matches a type while keeping its narrower inferred type', 'Exports the type from the module'], 2, 'Unlike an annotation, `satisfies` validates the value without widening it to the declared type.', 'It validates without widening.'),
      q('In a discriminated union, the discriminant is…', ['A class name', 'A generic parameter', 'An optional property of every member', 'A shared literal field like `status`'], 3, 'Checking the discriminant (`result.status === "ok"`) narrows to exactly one union member.', 'It is the field common to every member.'),
      q('A `switch` over a union ends with `default: const _x: never = shape;`. You add a new member to the union. What happens?', ['Nothing', 'A compile error points to the unhandled case', 'A runtime error is thrown at build', 'TypeScript adds a case automatically'], 1, 'The new member is no longer `never` in the default branch, so the assignment fails to compile.', 'The compiler can prove something is missing.'),
      q('What does `z.infer<typeof schema>` give you?', ['The value that parsing the data produced', 'A JSON Schema document for the schema', 'The TypeScript type that matches the Zod schema', 'A list of the validation errors found'], 2, 'You define the schema once and derive the static type from it, keeping runtime and compile-time rules in sync.', 'One definition produces a type.'),
      q('What does `schema.safeParse(data)` return?', ['A result object with a `success` flag instead of throwing', 'The parsed data if valid, or an exception thrown on failure', 'A promise that always resolves with data', 'A boolean that says whether it is valid'], 0, 'On failure you get an error object to inspect; on success, the typed data.', 'The name says it will not blow up.'),
      q('What does `as const` do to `["a", "b"] as const`?', ['Makes it a readonly tuple of the literal types "a" and "b"', 'Makes it a mutable array of plain strings', 'Freezes the array at runtime like Object.freeze', 'Converts the array into an object with keys'], 0, 'It narrows inference to the most specific literal, readonly types. It has no runtime effect.', 'It makes inference as specific as possible.'),
      q('What does the conditional type `T extends string ? "yes" : "no"` do?', ['Checks the type of T at runtime every time the function is called', 'Converts T into a string at compile time', 'Chooses a type depending on whether T is assignable to string', 'Throws an error when T is not a string'], 2, 'Conditional types are type-level if/else evaluated by the compiler.', 'It is an if statement for types.'),
      q('What is a mapped type such as `{ [K in keyof T]: boolean }`?', ['A built-in Map object keyed by property', 'A type that transforms every property of T', 'A function overload with several signatures', 'A tuple type with fixed positions'], 1, 'Mapped types loop over keys to build a new object type; `Partial` and `Readonly` are built this way.', 'It iterates over keys.'),
      q('What does `Extract<"a" | "b" | 1, string>` produce?', ['never', '1', '"a" | "b" | 1', '"a" | "b"'], 3, '`Extract<T, U>` keeps only the members of T assignable to U.', 'It filters the union.'),
      q('What does `NonNullable<string | null | undefined>` produce?', ['undefined', 'null', 'string', 'never'], 2, '`NonNullable` removes `null` and `undefined` from a type.', 'It strips out the empty values.'),
      q('Why are `as` assertions risky on data from an API?', ['They bypass checking, so a wrong shape fails later at runtime', 'They are slow', 'They change the data', 'They are not allowed in strict mode builds and fail to compile'], 0, 'An assertion only silences the compiler; validation (for example with Zod) actually checks the data.', 'It is a promise from you, not a check.'),
      q('What does the `infer` keyword do?', ['Declares a variable inside the body of a function', 'Imports types from another module', 'Converts a runtime value into a type', 'Captures a type inside a conditional type so you can reuse it'], 3, 'For example `T extends Promise<infer U> ? U : T` pulls out the promised type.', 'It names a part of a type for use later.'),
      q('What does an assertion function signature `asserts value is string` promise?', ['It returns a string value to the caller, converted from the argument', 'If it returns normally, `value` is a string; otherwise it throws', 'It always throws an error', 'It converts the value into a string'], 1, 'The compiler narrows `value` after the call because a failed check would have thrown.', 'The narrowing applies after the call returns.'),
      q('What does a `.d.ts` file contain?', ['Compiled JavaScript output for the module', 'Type declarations without implementation code', 'Definitions for database tables', 'Prose documentation for the project'], 1, 'Declaration files describe the types of JavaScript code, as in the `@types/*` packages.', 'It describes shapes, not behaviour.'),
      q('What is the `@types/node` package for?', ['Making Node itself run faster', 'Linting the code that runs inside Node.js projects and their scripts', 'Installing a specific Node version', 'Providing TypeScript type declarations for Node’s built-in APIs'], 3, 'It lets the compiler understand `process`, `fs` and other built-ins.', 'It is about type information, not runtime code.'),
      q('Which compiler option makes `arr[0]` have type `T | undefined`?', ['noUncheckedIndexedAccess', 'noImplicitAny', 'strictFunctionTypes: true', 'skipLibCheck'], 0, 'It acknowledges that an index can be out of range, so you must handle `undefined`.', 'The option name mentions unchecked index access.'),
      q('Which tsconfig option ensures each file can be transpiled on its own, as tools like esbuild and Vite do?', ['sourceMap', 'declaration', 'isolatedModules', 'resolveJsonModule'], 2, 'It flags constructs that need whole-program information, such as re-exporting types without `export type`.', 'Think about transpiling one file at a time.'),
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
