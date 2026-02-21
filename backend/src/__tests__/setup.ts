
/**
 * Test Setup File
 *
 * Mock Patterns:
 * - Unit tests: Mock Sequelize models, no real DB connection
 * - Integration tests: Use separate test database with cleanup between tests
 *
 * For integration tests using a real database:
 * - Set DATABASE_URL_TEST in .env.test
 * - Clean up test data after each test
 *
 * Mock data factories:
 * - Create mock notes with createMockNote() helpers
 * - Create mock boards with createMockBoard() helpers
 */

// Example: Mock Sequelize models for unit tests
// Uncomment when writing unit tests
// vi.mock('../models/NOTES', () => ({
//   default: {
//     findAll: vi.fn(),
//     findByPk: vi.fn(),
//     create: vi.fn(),
//     update: vi.fn(),
//     destroy: vi.fn(),
//   },
// }));

// vi.mock('../models/BOARDS', () => ({
//   default: {
//     findAll: vi.fn(),
//     findByPk: vi.fn(),
//     create: vi.fn(),
//     update: vi.fn(),
//     destroy: vi.fn(),
//   },
// }));
