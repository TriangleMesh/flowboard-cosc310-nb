import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    transform: {
        '^.+\\.js?$': 'ts-jest', // Use ts-jest to transform .js files
    },
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/test*.js', // Match test files in the __tests__ directory
    ],
    testTimeout: 40000, // Set global timeout to 40 seconds (40000 ms)
};

export default config;