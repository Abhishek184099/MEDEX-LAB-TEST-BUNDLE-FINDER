# MedEx Lab Test Bundle Finder

## Overview

A small full-stack app that finds the cheapest way for a customer to book a set of lab tests. A lab sells single tests and packages that bundle several tests at a discount. The system picks any mix of packages and single tests that covers every selected test at the lowest total price, and explains the result.

The project has two parts:

- `backend/`: a NestJS API that loads the catalog into memory at startup.
- `frontend/`: a React app where customers search for tests and see the plan update live.

## Tech Stack

**Backend**
- Node.js 20+, TypeScript
- NestJS 11 (Express platform)
- Vitest for tests
- Data held in memory, loaded from `backend/data/lab-catalog.json`

**Frontend**
- React 19 with TypeScript
- Vite
- Tailwind CSS v4

## Prerequisites

- Node.js 20 or newer
- npm

Check your versions:

```bash
node -v
npm -v
```

## Installation and Setup

Clone the repository, then set up each part in its own terminal.

### Backend

```bash
cd backend
npm install
npm run start:dev
```

The API runs on `http://localhost:3000` with the `/api` prefix.

### Frontend

Start the backend first. The Vite dev server proxies every `/api` request to port 3000, so no CORS setup is needed.

```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints, `http://localhost:5173`.

## API Endpoints

| Method | Path            | Description                                                                 |
| ------ | --------------- | --------------------------------------------------------------------------- |
| GET    | `/api/tests`    | Tests a customer can select (active tests only)                             |
| GET    | `/api/packages` | Packages that can be used (active, with at least one active test)           |
| POST   | `/api/plan`     | Returns the cheapest plan for a list of selected test IDs                   |

## How the Cheapest-Plan Algorithm Works

The core logic lives in `backend/src/plan/plan.engine.ts`, which has no NestJS code, so it can be read and tested on its own.

1. **Build candidates.** Each priced selected test becomes a candidate that covers itself. Each active package that covers at least one selected test becomes a candidate that covers those tests.
2. **Search.** Take the first selected test that is still not covered, and try every candidate that covers it. loop until every selected test is covered.
3. **Skip.** Skip any path whose cost is already higher than the best complete plan found so far.
4. **Choose the winner** using the tie-break rules from the spec, in this order:
   - plan with lower total price
   - plan with fewer items
   - plan with fewer extra tests
   - sorted item IDs in alphabetical order, compared one by one


**Extra tests** are the tests inside the chosen packages that the customer didn't select.

**Individual total** is the price of buying every selected test on its own. It's `null` if any selected test has no price.

**Savings** is the individual total minus the plan total. It's `null` when the individual total is `null`. The frontend shows savings only when they're above zero.

## Error Handling

- Services throw Nest's `BadRequestException` (400) or `UnprocessableEntityException` (422), with a body of `{ "error": "<CODE>", "testIds": [...] }`.
- Nest's built-in exception handling turns those errors into HTTP responses.
- Unexpected errors fall through to Nest's default 500 response.
- The frontend never shows error codes. `frontend/src/messages.ts` converts each code into a plain-language message, and network failures show "Can't reach the server."

## Running Tests

```bash
cd backend
npm test
```

- `test/plan.examples.test.ts` runs every example in `lab-catalog.json` against the real service and catalog, and checks the three error codes.
- `test/plan.performance.test.ts` checks that requests finish under 300 ms, including the worst case of selecting every active test.
- `test/plan.engine.test.ts` checks that the algorithm to create a best plan is working according to the givem rules. 

## Performance and Scalability

The spec requires `POST /api/plan` to respond in under 300 ms.

Measured on the current catalog (13 packages, 20 tests).

| Case                                    | Time                            |
| --------------------------------------- | ------------------------------- |
| Small selection (`T02, T03, T04, T06`)  | 2 ms                            |
| Every active test (worst case here)     | 27 ms                           |
| Same request repeated 20 times          | about 17 ms per call on average |

**With 40 packages instead of 13**, The main risk is that the search may take too long when there are many packages covering the same tests. The algorithm has to try different combinations, and skipping expensive options helps more after it finds a good plan. With many overlapping packages, it might take longer than 300 ms. This hasn't been tested yet.

One way to improve this is to use dynamic programming. It saves the cheapest result for each group of selected tests so it can reuse those results instead of calculating them again. With up to 20 selected tests and 40 packages, it can handle the search more efficiently, although the actual speed still needs to be tested.

## Known Limitations and Future Improvements

**Limitations**

- The engine's worst case grows with the number of overlapping packages.
- Packages with a price of zero or less aren't handled specially.
- Data is held in memory, so catalog changes need a server restart.
- The frontend has no automated tests. It was checked manually at 375 px, and by typing and clicking quickly to confirm the plan always matches the chips.

**Future improvements**

1. Replace the search with the subset dynamic programme, and measure it first with a synthetic 40-package catalog.
2. Add unit tests for each tie-break rule in `plan.engine.ts`.
3. Add frontend tests for the race condition, using fake timers and controlled responses.
4. Load the catalog from a database, and add an admin endpoint to change it without a restart.
5. Add request logging and timing metrics, so slow plans can be spotted.
6. Cache plans for selections, since the same selection is often requested again.

## AI Usage

AI tools helped me to understand the business rules and to create the algorithm to find and select the best plan. It also helped in debugging.
