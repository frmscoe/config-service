export class MockArangoError extends Error {
  isArangoError: boolean;
  errorNum: number;

  constructor(message: string, errorNum: number) {
    super(message);
    this.isArangoError = true;
    this.errorNum = errorNum;
    this.name = 'ArangoError';
  }
}
