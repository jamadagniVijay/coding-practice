# React Best Practices — Rules for Coding Assistants

> Rewritten as actionable rules. Where the 2022 advice is outdated or inaccurate against current React, the rule reflects current React and the difference is noted under **Deviations from source**.

## How to use this file
Apply these rules when generating, editing, or reviewing React code. If the existing codebase has an established convention that conflicts with a rule here, follow the codebase and mention the conflict instead of silently rewriting.

---

## 1. Component design

- Write function components. Do not introduce class components except for error boundaries (or when the codebase requires them).
- Keep each component focused on one purpose. If a component accumulates many branches (nested ternaries, chained `&&`, large `switch` on props/state, many conditional classNames), split it into smaller components rather than adding another branch.
- If props are passed through more than two levels just to reach a descendant, stop and consider an alternative: composition (`children`), the compound component pattern, or context.
- Choose a component pattern deliberately for the problem at hand; do not default to one pattern everywhere.

## 2. State

- When a component has many `useState` calls, first try to move related state and JSX into a child component.
- If the state must stay together, switch to `useReducer` when either is true:
  - more than ~4 pieces of state in one component (heuristic, not a hard rule), or
  - state is a nested object (e.g. form data) or the next state depends on the previous one.
- Reducers: define `initialState` outside the component, handle each action type explicitly, and return the unchanged `state` in the `default` case.

```jsx
const initialState = { status: 'idle', items: [], error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'fetch_start':   return { ...state, status: 'loading', error: null };
    case 'fetch_success': return { ...state, status: 'done', items: action.items };
    case 'fetch_error':   return { ...state, status: 'error', error: action.error };
    default:              return state;
  }
}
```

## 3. Reusable logic → custom hooks

- When the same stateful logic (state + effects) appears in two or more components, extract it into a custom hook named `useXxx` that returns only what callers need.
- Always clean up subscriptions/listeners/timers in the effect's return function.

```jsx
function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}
```

## 4. Lists and keys

- Give every element produced by `.map()` a `key` taken from a stable, unique ID in the data (e.g. `item.id`).
- Do not use the array index as a key when the list can be reordered, filtered, or have items inserted/removed.
- If the data has no ID, assign one when the data is created or loaded — never generate keys (e.g. `uuid()`, `Math.random()`) inside render, since that creates new keys every render and remounts every item.
- Keys need to be unique among siblings in the same list.

## 5. Error handling

Cover all three concerns: **catch**, **show a fallback UI**, **log**.

- Wrap the app root, and any error-prone subtree, in an error boundary. Prefer the `react-error-boundary` package (`<ErrorBoundary FallbackComponent={...} onError={...}>`) over a hand-written class.
- Error boundaries do **not** catch errors in event handlers, async code (promises, `setTimeout`), or server-side rendering. For those:
  - wrap async calls in `try / catch / finally`, set error state in `catch`, reset loading in `finally`;
  - or forward the error to the nearest boundary (`useErrorBoundary().showBoundary(error)` in `react-error-boundary` v4+).
- Log errors to a persistent logging/monitoring service in production (e.g. Sentry). `console.log` alone is not acceptable for production error reporting.
- Every async data component must render distinct loading, error, and success states.

```jsx
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      const res = await api.getUser(userId);
      if (!cancelled) setUser(res.data);
    } catch (err) {
      logError(err);
      if (!cancelled) setError(err);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, [userId]); // include every value the effect reads
```

## 6. Security

- Avoid `dangerouslySetInnerHTML`. If it is unavoidable (e.g. rich-text HTML), sanitize first with a library such as DOMPurify:

```jsx
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

## 7. Types

- Prefer TypeScript. Do not use `any` to silence type errors; fix the type or use `unknown` with narrowing.
- Without TypeScript, document props with JSDoc and use default parameter values for optional props (`function Button({ size = 'md' })`).

## 8. Performance

- Code-split large routes and heavy, rarely-used components (charts, editors, 3D libraries) with `React.lazy` + `<Suspense fallback={...}>` or the framework's equivalent, so users only download what they need.

## 9. JSX style

- Boolean props that are `true`: pass the bare name. `<Modal open />` not `<Modal open={true} />`.
- Plain string props: use quotes, not braces. `<Title level="h2" />` not `<Title level={"h2"} />`. (Numbers, objects, variables, and template literals still need braces.)
- Use a fragment `<>...</>` when a wrapper is needed only to satisfy the single-root rule; don't add meaningless `<div>`s.
- Use self-closing tags for elements with no children: `<Spinner />` not `<Spinner></Spinner>`.
- When spreading rest props onto a DOM element, destructure every non-HTML (custom) prop first so only valid attributes reach the DOM:

```jsx
function Heading({ bold, padded, children, ...rest }) {  // bold/padded extracted
  return <h1 style={{ fontWeight: bold ? 600 : 400, padding: padded ? 16 : 0 }} {...rest}>{children}</h1>;
}
```

## 10. Naming

- `PascalCase`: components, TypeScript interfaces, type aliases. (Components must be PascalCase for the hooks lint rules to recognize them.)
- `camelCase`: variables, functions, arrays, objects, hook names (`useXxx`).

## 11. Imports

- Group imports in this order, with a blank line between groups:
  1. React / built-ins
  2. third-party packages
  3. internal modules (utils, constants, hooks, components, styles)
- Prefer named imports that let multiple items from one package share one line.
- Rely on the linter (e.g. `eslint-plugin-import` / `simple-import-sort`) to enforce order rather than doing it by hand.

## 12. Project hygiene

- Choose a folder structure proportional to app size and team size; do not over-engineer it early.
- Keep ESLint (including `eslint-plugin-react-hooks`) enabled and passing. Do not add `eslint-disable` comments unless there's a specific, stated reason on that line.
- Format with Prettier before committing.
- Avoid inline styles for anything beyond trivial dynamic values; use the project's styling approach.
- Write tests for new components and behavior changes (e.g. React Testing Library). Think through the component's purpose and edge cases before writing it.

---

## Deviations from source (2022 article vs. current React)

| Topic | Article said | This file says | Why |
|---|---|---|---|
| Keys | Keys should be unique across the whole app; use uuid if no ID | Unique among siblings; assign IDs at data creation, never during render | React only requires sibling-level uniqueness; generating keys in render remounts items every render |
| PropTypes / defaultProps | Use them if not using TypeScript | TypeScript, or JSDoc + default parameters | React 19 removed `propTypes` checking and `defaultProps` for function components |
| react-error-boundary hook | `useErrorHandler()` | `useErrorBoundary().showBoundary()` | Hook was replaced in v4 of the library |
| Async fetch example | Effect with `[]` deps reading `userId` | Include all dependencies; guard against setting state after unmount | Satisfies `react-hooks/exhaustive-deps`; avoids stale data |
| Tooling | create-react-app ships ESLint | Configure ESLint in your build setup | create-react-app is deprecated |
| Docs links | reactjs.org | react.dev | Official docs moved |

Omitted from the source as not relevant to a coding assistant: learning roadmap, editor snippet extensions, and personal anecdotes.
