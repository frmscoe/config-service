const setItemMock = jest.fn();

const localStorageMock = {
  setItem: setItemMock,
};

export const setupLocalStorageMock = () => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
};

export const cleanupLocalStorageMock = () => {
  jest.clearAllMocks();
};
