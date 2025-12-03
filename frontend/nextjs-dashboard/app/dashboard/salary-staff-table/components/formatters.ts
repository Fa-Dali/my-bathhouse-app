export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};
