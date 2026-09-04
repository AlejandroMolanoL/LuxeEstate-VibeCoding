'use client';

interface MortgageCalculatorProps {
  price: number;
  dictionary?: any;
}

export default function MortgageCalculator({ price, dictionary }: MortgageCalculatorProps) {
  // Simple estimation: 20% down, 30 years, 5.5% interest rate
  const downPayment = price * 0.20;
  const principal = price - downPayment;
  const monthlyRate = 0.055 / 12;
  const numberOfPayments = 30 * 12;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
  // Add rough estimation for taxes and insurance (e.g. 1.2% property tax, $1000 insurance per year)
  const taxesAndInsurance = (price * 0.012 / 12) + (1000 / 12);
  const totalEstimatedPayment = Math.round(monthlyPayment + taxesAndInsurance);

  return (
    <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
          <span className="material-icons">calculate</span>
        </div>
        <div>
          <h3 className="font-semibold text-nordic">{dictionary?.mortgage_calculator?.title || "Estimated Payment"}</h3>
          <p className="text-sm text-nordic/60">
            {dictionary?.mortgage_calculator?.starting_from || "Starting from"} <strong className="text-mosque">${totalEstimatedPayment.toLocaleString('en-US')}/mo</strong> {dictionary?.mortgage_calculator?.with_down || "with 20% down"}
          </p>
        </div>
      </div>
      <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic">
        {dictionary?.mortgage_calculator?.calculate || "Calculate Mortgage"}
      </button>
    </div>
  );
}
