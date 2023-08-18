import type {Config} from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/dist/", "/src/", "/docs/", "/node_modules/", "/csv-json-parsing/", ".skip.", "/test-dist/"]
};

export default config;