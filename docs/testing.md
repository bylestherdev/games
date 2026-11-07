# Testing Guide

## Overview

This document describes the testing strategy for ByLestherGames.

## Test Stack

- **Jest** - Test runner
- **React Testing Library** - Component testing
- **ts-jest** - TypeScript support
- **jest-environment-jsdom** - DOM environment

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch

# Run specific test file
pnpm test src/lib/games/cazador-leads.test.ts
```

---

## Test Structure

```
src/
├── lib/games/
│   ├── *.test.ts           # Game logic tests
│   └── progress.test.ts    # Persistence tests
├── components/game/
│   ├── TextGame.test.tsx   # Component tests
│   └── round-system.test.ts # Round system tests
└── lib/games/
    ├── random.test.ts      # PRNG tests
    ├── progress.test.ts    # Persistence tests
    ├── achievements.test.ts # Achievement tests
    └── *.test.ts           # Game-specific logic tests
```

---

## Test Categories

### 1. Unit Tests (Game Logic)
- **Pure functions**: `initStats`, `resolveEnding`, `formatValue`
- **Game logic**: `ejecutarAccionLead`, `calcularValorPipeline`, `enfriarLeads`
- **Random**: `mulberry32`, `hashTexto`
- **Progress**: `saveProgress`, `parse`, `clearProgress`

### 2. Component Tests
- **TextGame**: Intro, Scene, Event, Feedback, Ending phases
- **Keyboard navigation**: 1/2/3, Enter, Space, R
- **Scenario selection**: Save/load, multiple scenarios
- **Phase transitions**: Scene → Feedback → Scene → Ending

### 3. Game Logic Tests
- **Cazador de Leads**: Full action flow (llamada, email, demo, propuesta, etc.)
- **Negociación**: Ending resolution, phase labels
- **Round system**: Dynamic choices per round type

---

## Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage

# Specific file
pnpm test src/lib/games/cazador-leads.test.ts

# Debug mode
pnpm test --verbose
```

---

## Writing Tests

### Unit Test Template

```typescript
import { functionToTest } from '@/lib/games/module';

describe('Module - Function', () => {
  it('should do something', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });
});
```

### Component Test Template

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Component from '@/components/Component';

describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles interaction', async () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### Async Testing

```typescript
it('handles async operation', async () => {
  render(<Component />);
  
  fireEvent.click(screen.getByRole('button', { name: /Start/i }));
  
  await waitFor(() => {
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });
});
```

---

## Mocking Strategy

### External Dependencies
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/games/test',
}));

jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));
```

### localStorage Mock
```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
```

### Random Mocking
```typescript
const originalRandom = Math.random;
Math.random = vi.fn().mockReturnValue(0.5); // Deterministic
// ... test ...
Math.random = originalRandom;
```

---

## Coverage Goals

| Metric | Target |
|--------|--------|
| Statements | 50% |
| Branches | 50% |
| Functions | 50% |
| Lines | 50% |

---

## CI Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3
```

---

## Debugging Tests

```bash
# Run single test with debugging
pnpm test --testNamePattern="should succeed" --verbose

# Open coverage report
open coverage/lcov-report/index.html

# Update snapshots
pnpm test --updateSnapshot
```

---

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **One assertion per test** (when possible)
4. **Mock external dependencies**
- Test both success and failure paths
- Keep tests fast and independent
- Use `beforeEach`/`afterEach` for setup/teardown