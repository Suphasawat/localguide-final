# Tests Directory

This directory contains all unit and integration tests for the LocalGuide backend application.

## Structure

```
tests/
├── test_helpers.go           # Common test utilities and helper functions
├── province_controller_test.go  # Tests for province-related endpoints
├── auth_controller_test.go      # Tests for authentication endpoints
└── README.md                    # This file
```

## Running Tests

### Run all tests

```bash
cd localguide-back
go test ./tests -v
```

### Run specific test file

```bash
go test ./tests -run TestGetProvinces -v
go test ./tests -run TestAuthController -v
```

### Run tests with coverage

```bash
go test ./tests -cover -v
```

### Run benchmark tests

```bash
go test ./tests -bench=. -v
```

### Run tests with detailed coverage report

```bash
go test ./tests -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

## Test Utilities

### SetupTestDB()

Creates an in-memory SQLite database with all models migrated. Perfect for isolated testing.

### SetupTestApp()

Creates a new Fiber app instance with error handling configured for testing.

### SeedTestProvinces(db)

Seeds the database with test provinces data.

### SeedTestAttractions(db, provinceID)

Seeds the database with test tourist attractions for a specific province.

### CreateTestUser(db)

Creates a test user with authentication data.

### CleanDatabase(db)

Removes all data from the test database while respecting foreign key constraints.

## Best Practices

1. **Isolation**: Each test should use a fresh database to avoid test interference
2. **Setup/Teardown**: Use helper functions for consistent test setup
3. **Error Testing**: Always test both success and error scenarios
4. **Edge Cases**: Test boundary conditions and invalid inputs
5. **Performance**: Include benchmark tests for critical endpoints

## Adding New Tests

When adding tests for new controllers:

1. Create a new test file: `{controller_name}_test.go`
2. Use the common test helpers from `test_helpers.go`
3. Follow the naming convention: `Test{FunctionName}`
4. Include both positive and negative test cases
5. Add benchmark tests for performance-critical functions

## Example Test Structure

```go
func TestNewController(t *testing.T) {
    app := setupTestApp()
    app.Get("/endpoint", controllers.NewEndpoint)

    t.Run("Success Case", func(t *testing.T) {
        testDB := setupTestDB()
        config.DB = testDB

        // Setup test data
        // Make request
        // Assert results
    })

    t.Run("Error Case", func(t *testing.T) {
        testDB := setupTestDB()
        config.DB = testDB

        // Setup error conditions
        // Make request
        // Assert error handling
    })
}
```

## Dependencies

- `github.com/stretchr/testify/assert` - Assertion library
- `gorm.io/driver/sqlite` - SQLite driver for test database
- `github.com/gofiber/fiber/v2` - Web framework

## Notes

- Tests use in-memory SQLite database for fast execution
- Database schema is automatically migrated for each test
- Tests are designed to be run in parallel safely
- All external dependencies should be mocked in tests
