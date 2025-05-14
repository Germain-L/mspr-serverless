# Bruno Test Suite for Serverless Functions

This directory contains Bruno API test collections for testing the serverless functions.

## Test Collections

1. **hello-world**: Tests the hello-world function and database connectivity
2. **generate-2fa**: Tests the 2FA generation function
3. **generate-password**: Tests the password generation function
4. **authenticate**: Tests the authentication function

## Running Tests

To run the tests:

1. Make sure Bruno is installed: https://www.usebruno.com/
2. Start your serverless functions locally
3. Open Bruno and load this directory as a collection
4. Choose the "Local" environment
5. Run the collections individually or together

## Test Order

When testing all functions, recommended test order is:

1. hello-world
2. generate-password (creates a user)
3. generate-2fa (adds 2FA to the user)
4. authenticate (tests login with created credentials)

## Environment Variables

The `Local` environment is configured with:
- `baseUrl`: http://localhost:8081

Update this to match your local development setup if needed. 