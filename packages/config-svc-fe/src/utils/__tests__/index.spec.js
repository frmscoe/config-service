import { changeToEpoch, convertMillisecondsToDHMS, incrementVersion } from '../';
describe('convertMillisecondsToDHMS', () => {
  it('should correctly convert milliseconds to DHMS format', () => {
    const milliseconds = 2592000000;
    const expectedResult = {
      days: 30, hours: 0, minutes: 0, seconds: 0
    };
    const result = convertMillisecondsToDHMS(milliseconds);
    expect(result).toEqual(expectedResult);
  });
});

describe('changeToEpoch', () => {
  it('should correctly convert DHMS format to epoch time in seconds', () => {
    const days = 30;
    const hours = 0;
    const minutes = 0;
    const seconds = 0;
    const expectedResult = 2592000000;
    expect(changeToEpoch(days, hours, minutes, seconds)).toEqual(expectedResult);
  });
});


describe('incrementVersion', () => {
  
  it('should handle increment major', () => {
    expect(incrementVersion("1.0.0","major",['1.0.1', '2.0.1', '1.4.2'])).toBe("3.0.0");
    expect(incrementVersion("3.0.0","major",['1.0.1', '4.0.1', '2.4.2'])).toBe("5.0.0");
    expect(incrementVersion("1.0.0","major",['1.0.1', '2.0.1', '1.4.2'])).toBe("3.0.0");
    expect(incrementVersion("1.0.0","major",[
      "1.0.0",
      "1.0.0",
      "1.0.0",
      "1.0.0",
      "1.0.0",
      "2.1.0",
      "2.0.0",
      "1.0.0",
      "1.0.0"
    ])).toBe("3.0.0");

  });

  it('should handle increment minor', () => {
    expect(incrementVersion("1.0.0","minor",['1.0.1', '2.0.1', '1.4.2'])).toBe("1.5.0");
    expect(incrementVersion("1.8.0","minor",['1.0.1', '1.9.0', '1.4.2'])).toBe("1.10.0");
   

      expect(incrementVersion("1.0.0","minor",[ '1.0.0',
        '1.1.0',
        '2.0.0',
        '2.1.0',
        '2.1.1',
        '3.3.2'])).toBe("1.2.0");
  });

  it('should handle increment patch', () => {
    expect(incrementVersion("1.0.0","patch",['1.0.1', '2.0.1', '1.4.2'])).toBe("1.0.2");
    expect(incrementVersion("1.8.0","patch",['1.0.1', '1.9.0', '1.4.2'])).toBe("1.8.1");
  });

 
})