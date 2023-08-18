export function convertObjectValuesToString(obj: any): any {
  function isObject(val: any): boolean {
    return typeof val === "object" && !Array.isArray(val);
  }

  function convertValueToString(val: any): any {
    return isObject(val) ? convertObjectValuesToString(val) : String(val);
  }

  if (isObject(obj)) {
    const convertedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        convertedObj[key] = convertValueToString(value);
      }
    }
    return convertedObj;
  } else {
    return convertValueToString(obj);
  }
}
