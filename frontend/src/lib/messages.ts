import { PlanApiError } from './api';

export function errorMessage(err: unknown, nameOf: (id: string) => string): string {
  if (err instanceof PlanApiError) {
    const { error, testIds } = err.body;
    const names = testIds.map(nameOf).join(', ');

    switch (error) {
      case 'EMPTY_SELECTION':
        return 'Choose at least one test to see a plan.';
      case 'INVALID_TESTS':
        return `These tests are not available right now: ${names}. Please remove them.`;
      case 'NOT_AVAILABLE':
        return `We can't book ${names} on its own or in any package. Please remove them to continue.`;
    }
  }

  // fetch() throws a TypeError when the server can't be reached at all
  if (err instanceof TypeError) {
    return "Can't reach the server. Check your connection and try again.";
  }

  return 'Something went wrong. Please try again.';
}