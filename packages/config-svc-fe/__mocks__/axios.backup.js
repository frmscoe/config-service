// <!-- SPDX-License-Identifier: Apache-2.0 -->

// Create an axios-like instance
const axiosInstance = {
  get: jest.fn(),
  post: jest.fn(() => Promise.resolve({ data: { access_token: 'fake_token' } })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

// Build the main mock object
const mockAxios = {
  create: jest.fn(() => axiosInstance),
  get: jest.fn(),
  post: jest.fn(() => Promise.resolve({ data: { access_token: 'fake_token' } })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  instance: axiosInstance, // for direct access in tests
};

// DON'T add `mockAxios.default = mockAxios`
// That causes `axios.default.create` errors in ESM style imports

module.exports = mockAxios;


