import { CURRENCIES } from '../data/defaultData';

export const formatIndianNumber = (val: number, currencyCode: string = 'USD') => {
  const currencyObj = CURRENCIES[currencyCode] || { symbol: '$' };
  const formatted = Math.abs(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${val < 0 ? '-' : ''}${currencyObj.symbol}${formatted}`;
};
