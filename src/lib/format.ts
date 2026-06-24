export const pkr = (n: number | string | null | undefined) => {
  const v = Number(n ?? 0);
  return `PKR ${v.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
};
