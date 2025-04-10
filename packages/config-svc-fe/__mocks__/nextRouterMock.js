// <!-- SPDX-License-Identifier: Apache-2.0 -->
const useRouterMock = {
  push: jest.fn(),
};

export default {
  useRouter: () => useRouterMock,
};
