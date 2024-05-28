const mockAxios = jest.createMockFromModule("axios");

// Mock any post call or other axios methods as needed
mockAxios.post = jest.fn(() => Promise.resolve({ data: { access_token: "fake_token" } }));

module.exports = mockAxios;
