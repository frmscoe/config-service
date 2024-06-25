import { changeToEpoch, convertMillisecondsToDHMS } from '../';
describe('convertMillisecondsToDHMS', () => {
  it('should correctly convert milliseconds to DHMS format', () => {
    const milliseconds = 1000000;
    const expectedResult = {
      days: 11574, hours: 1, minutes: 46, seconds: 40
    };
    const result = convertMillisecondsToDHMS(milliseconds);
    expect(result).toEqual(expectedResult);
  });
});

describe('changeToEpoch', () => {
  it('should correctly convert DHMS format to epoch time in seconds', () => {
    const days = 1;
    const hours = 12;
    const minutes = 30;
    const seconds = 45;
    const expectedResult = 176400;
    expect(changeToEpoch(days, hours, minutes, seconds)).toEqual(expectedResult);
  });
});