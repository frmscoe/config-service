import {changeToEpoch, convertMillisecondsToDHMS} from '../';
describe('convertMillisecondsToDHMS', () => {
    it('should correctly convert milliseconds to DHMS format', () => {
      const milliseconds = 1000000;
      const expectedResult = {
        days: 0,
        hours: 0,
        minutes: 16,
        seconds: 40
      };
      expect(convertMillisecondsToDHMS(milliseconds)).toEqual(expectedResult);
    });
  });
  
  describe('changeToEpoch', () => {
    it('should correctly convert DHMS format to epoch time in seconds', () => {
      const days = 1;
      const hours = 12;
      const minutes = 30;
      const seconds = 45;
      const expectedResult = 131445;
      expect(changeToEpoch(days, hours, minutes, seconds)).toEqual(expectedResult);
    });
  });