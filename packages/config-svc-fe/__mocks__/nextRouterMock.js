const useRouterMock = {
  push: jest.fn(),
};

export default {
  useRouter: () => useRouterMock,
};
