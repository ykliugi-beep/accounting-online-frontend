/**
 * Funkcije za kalkulacije
 */

/**
 * Zaokružuje broj na određeni broj decimala
 */
export const roundTo = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Računanje PDV-a
 * @param netAmount Neto iznos (bez PDV-a)
 * @param taxRate Stopa PDV-a (npr. 20 za 20%)
 * @returns Iznos PDV-a
 */
export const calculateVAT = (netAmount: number, taxRate: number): number => {
  return roundTo((netAmount * taxRate) / 100, 2);
};

/**
 * Računanje bruto iznosa (sa PDV-om)
 * @param netAmount Neto iznos
 * @param taxRate Stopa PDV-a
 * @returns Bruto iznos (neto + PDV)
 */
export const calculateGrossAmount = (netAmount: number, taxRate: number): number => {
  const vat = calculateVAT(netAmount, taxRate);
  return roundTo(netAmount + vat, 2);
};

/**
 * Računanje neto iznosa iz bruto iznosa
 * @param grossAmount Bruto iznos (sa PDV-om)
 * @param taxRate Stopa PDV-a
 * @returns Neto iznos (bez PDV-a)
 */
export const calculateNetFromGross = (grossAmount: number, taxRate: number): number => {
  return roundTo(grossAmount / (1 + taxRate / 100), 2);
};

/**
 * Računanje iznosa sa rabatom
 * @param amount Osnovni iznos
 * @param discount Rabat u procentima (npr. 10 za 10%)
 * @returns Iznos sa primenjenim rabatom
 */
export const applyDiscount = (amount: number, discount: number): number => {
  return roundTo(amount * (1 - discount / 100), 2);
};

/**
 * Računanje ukupnog iznosa stavke dokumenta
 * @param quantity Količina
 * @param price Cena
 * @param discount Rabat u procentima
 * @param taxRate Stopa PDV-a
 * @returns Objekat sa neto, PDV i bruto iznosom
 */
export const calculateLineItemTotal = (
  quantity: number,
  price: number,
  discount: number,
  taxRate: number
): { netAmount: number; vatAmount: number; grossAmount: number } => {
  // Iznos pre rabata
  const amountBeforeDiscount = quantity * price;
  
  // Neto iznos (sa rabatom)
  const netAmount = applyDiscount(amountBeforeDiscount, discount);
  
  // PDV iznos
  const vatAmount = calculateVAT(netAmount, taxRate);
  
  // Bruto iznos
  const grossAmount = netAmount + vatAmount;
  
  return {
    netAmount: roundTo(netAmount, 2),
    vatAmount: roundTo(vatAmount, 2),
    grossAmount: roundTo(grossAmount, 2),
  };
};

/**
 * Računanje ukupnog iznosa dokumenta
 * @param items Niz stavki sa netAmount, vatAmount
 * @returns Objekat sa sumiranim iznosima
 */
export const calculateDocumentTotal = (
  items: Array<{ netAmount: number; vatAmount: number }>
): { totalNet: number; totalVat: number; totalGross: number } => {
  const totalNet = items.reduce((sum, item) => sum + item.netAmount, 0);
  const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const totalGross = totalNet + totalVat;
  
  return {
    totalNet: roundTo(totalNet, 2),
    totalVat: roundTo(totalVat, 2),
    totalGross: roundTo(totalGross, 2),
  };
};

/**
 * Distribucija troška na stavke proporcionalno vrednosti
 * @param costAmount Ukupan iznos troška
 * @param items Stavke sa netAmount
 * @returns Niz sa raspoređenim iznosima troška po stavkama
 */
export const distributeCostByValue = (
  costAmount: number,
  items: Array<{ id: number; netAmount: number }>
): Array<{ id: number; distributedCost: number }> => {
  const totalValue = items.reduce((sum, item) => sum + item.netAmount, 0);
  
  if (totalValue === 0) {
    return items.map(item => ({ id: item.id, distributedCost: 0 }));
  }
  
  return items.map(item => ({
    id: item.id,
    distributedCost: roundTo((item.netAmount / totalValue) * costAmount, 2),
  }));
};

/**
 * Distribucija troška na stavke ravnomerno
 * @param costAmount Ukupan iznos troška
 * @param itemCount Broj stavki
 * @returns Iznos troška po stavci
 */
export const distributeCostEvenly = (
  costAmount: number,
  itemCount: number
): number => {
  if (itemCount === 0) return 0;
  return roundTo(costAmount / itemCount, 2);
};

/**
 * Konverzija iznosa u drugu valutu
 * @param amount Iznos
 * @param exchangeRate Kurs
 * @returns Konvertovani iznos
 */
export const convertCurrency = (amount: number, exchangeRate: number): number => {
  return roundTo(amount * exchangeRate, 2);
};
