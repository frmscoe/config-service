export const uniqueArray = (arr: any, key: string) => {
    const uniqueSet = new Set();
    const uniqueObjects: any[] = [];

    arr.forEach((obj: any) => {
        const stringifiedObj = obj[key]
        if (!uniqueSet.has(stringifiedObj)) {
            uniqueSet.add(stringifiedObj);
            uniqueObjects.push(obj);
        }
    });
    return uniqueObjects;
};
