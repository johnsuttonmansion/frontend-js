// ======> Initial / Default values
let initialOfferingValue = 'initialOfferingValue' in window ? window.initialOfferingValue : undefined,
    annualAppreciation = 'annualAppreciation' in window ? window.annualAppreciation : undefined,
    annualCashFlowPct = 'annualCashFlowPct' in window ? window.annualCashFlowPct : undefined,
    initialInvestment = 'initialInvestment' in window ? window.initialInvestment : undefined,
    holdingPeriod = 'holdingPeriod' in window ? window.holdingPeriod : undefined,
    annualCashFlowIncrease = 'annualCashFlowIncrease' in window ? window.annualCashFlowIncrease : undefined,
    dispositionExpensePct = 'dispositionExpensePct' in window ? window.dispositionExpensePct : undefined,
    initialHomeValue = 'initialHomeValue' in window ? window.initialHomeValue : undefined,
    furnishingValue = 'furnishingValue' in window ? window.furnishingValue : undefined,
    cashReserves = 'cashReserves' in window ? window.cashReserves : undefined;


// Auth state from local storage
const userId = localStorage.getItem('ajs_user_id');
const anonID = localStorage.getItem('ajs_anonymous_id');

// Chart configuration import, set from the Embedded
const calcChartImp = window.calcChart;

// ======> DOM elements
const investmentAmountInput = document.getElementById(
  'investment-amount-input'
);

// custom inputs and parent divs
const rentalYieldInput = document.getElementById('rental-yield-input');
const rentalYieldInputDiv = document.getElementById('rental-yield-input-div');

const annualAppreciationInput = document.getElementById(
  'annual-appreciation-input'
);
const annualAppreciationInputDiv = document.getElementById(
  'annual-appreciation-input-div'
);

// select options and parents divs
// rental yield
const rentalYieldSelected = document.getElementById('rental-yield-selected');
const rentalYieldSelectSubTxt = document.getElementById(
  'rental-yield-select-sub-text'
);
const rentalYieldSelectDiv = document.getElementById('rental-yield-select-div');

const rentalYieldListItems = document.querySelectorAll(
  '#rental-yield-list-items div.options-elem'
);
const ownRentalYieldBtn = document.getElementById('own-rental-yield-btn');

// annual appreciation
const annualAppreciationSelected = document.getElementById(
  'annual-appreciation-selected'
);
const annualAppreciationSelectSubTxt = document.getElementById(
  'annual-appreciation-select-sub-text'
);
const annualAppreciationSelectDiv = document.getElementById(
  'annual-appreciation-select-div'
);

const annualAppreciationListItems = document.querySelectorAll(
  '#annual-appreciation-list-items div.options-elem'
);
const ownAnnualAppreciationBtn = document.getElementById(
  'own-annual-appreciation-btn'
);

const yearRange = document.getElementById('year-range');

const returnTotal = document.querySelectorAll('.return-total');
const returnPercentage = document.querySelectorAll('.return-percentage');

const saveEstimateBtn = document.getElementById('save-estimate-btn');

// ======> Value change events
let delayTimer;

// Format numbers to have commas and decimal
function decimalSeparation(num, blur) {
  const decimal = blur && {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  if (!isNaN(num)) {
    return num.toLocaleString('en-US', decimal);
  }
  return '';
}

// Custom Investment amount from user input
investmentAmountInput.setAttribute(
  'value',
  decimalSeparation(initialInvestment, true)
); // set input default

investmentAmountInput.addEventListener('input', (e) =>
  handleInputChanges(e.target)
);
investmentAmountInput.addEventListener('blur', (e) =>
  formatInput(e.target, true)
);

function formatInput(input, blur) {
  let numericValue = parseFloat(input.value.replace(/[^\d.]/g, '')); // Remove non-numeric and non-decimal characters

  const formattedValue = blur
    ? decimalSeparation(numericValue, blur)
    : decimalSeparation(numericValue);
  input.value = formattedValue;

  if (!blur) {
    const previousValue = input.value;
    const previousCursorPosition = input.selectionStart;

    // keep cursor at the same position on format to add commas and decimal
    const lengthDifference = formattedValue.length - previousValue.length;
    let newCursorPosition = previousCursorPosition + lengthDifference;
    newCursorPosition = Math.min(newCursorPosition, input.value.length);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }
}

function handleInputChanges(input) {
  formatInput(input);

  let numericValue = parseFloat(input.value.replace(/[^\d.]/g, ''));
  let inputNum = numericValue;

  clearTimeout(delayTimer);

  function setInvestmentAndCalculate() {
    initialInvestment = inputNum;
    runCalculation();
  }

  if (isNaN(numericValue) || numericValue < 99) {
    delayTimer = setTimeout(() => {
      inputNum = 99;
      input.value = inputNum;
      setInvestmentAndCalculate();
    }, 3000);
  } else if (numericValue > initialOfferingValue) {
    inputNum = initialOfferingValue;
    input.value = inputNum;
    formatInput(input);
    setInvestmentAndCalculate();
  } else {
    delayTimer = setTimeout(() => {
      setInvestmentAndCalculate();
    }, 300);
  }
}

// Rental Yield selection from List Items
function setSelectedRentalYield(item) {
  const pctValue = item.querySelector(
    'div.text-block-55 > span.pct-value'
  ).innerText;
  const subText = item.querySelector('.selected-title').innerText;

  rentalYieldSelected.innerText = pctValue;
  rentalYieldSelectSubTxt.innerText = subText;

  annualCashFlowPct = +pctValue / 100;
}

rentalYieldListItems.forEach((item) => {
  // set annualCashFlowPct based on selected option
  if (item.classList.contains('selected')) {
    setSelectedRentalYield(item);
  }

  item.addEventListener('click', () => {
    rentalYieldListItems.forEach((item) => item.classList.remove('selected'));
    item.classList.add('selected');

    if (item.classList.contains('selected')) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        setSelectedRentalYield(item);
        runCalculation();

        if (rentalYieldInputDiv.style.display === 'block') {
          rentalYieldSelectDiv.style.display = 'block';
          rentalYieldInputDiv.style.display = 'none';
        }
      }, 100);
    }
  });
});
// Rental Yield Own Input show/hide
ownRentalYieldBtn.addEventListener('click', () => {
  rentalYieldSelectDiv.style.display = 'none';
  rentalYieldInputDiv.style.display = 'block';
  rentalYieldInput.select();
});

// Annual Appreciation selection from List Items
function setSelectedAnnualAppreciation(item) {
  const pctValue = item.querySelector('span.pct-value').innerText;
  const subText = item.querySelector('.selected-title').innerText;

  annualAppreciationSelected.innerText = pctValue;
  annualAppreciationSelectSubTxt.innerText = subText;

  annualAppreciation = +pctValue / 100;
}

annualAppreciationListItems.forEach((item) => {
  if (item.classList.contains('selected')) {
    setSelectedAnnualAppreciation(item);
  }

  item.addEventListener('click', () => {
    annualAppreciationListItems.forEach((item) =>
      item.classList.remove('selected')
    );
    item.classList.add('selected');

    if (item.classList.contains('selected')) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        setSelectedAnnualAppreciation(item);
        runCalculation();

        if (annualAppreciationInputDiv.style.display === 'block') {
          annualAppreciationSelectDiv.style.display = 'block';
          annualAppreciationInputDiv.style.display = 'none';
        }
      }, 100);
    }
  });
});
// Annual Appreciation Own Input show/hide
ownAnnualAppreciationBtn.addEventListener('click', () => {
  annualAppreciationSelectDiv.style.display = 'none';
  annualAppreciationInputDiv.style.display = 'block';
  annualAppreciationInput.select();
});

// Custom Rental Yield from user input value
rentalYieldInput.addEventListener('input', (e) => {
  clearTimeout(delayTimer);

  setTimeout(() => {
    let pct = +e.target.value;
    if (pct < 0) {
      e.target.value = 0;
    } else if (pct > 15) {
      e.target.value = 15;
    } else {
      annualCashFlowPct = pct / 100;
      runCalculation();
    }
  }, 300);
});
rentalYieldInput.addEventListener('blur', (e) => {
  const pct = e.target.value === '' ? annualCashFlowPct * 100 : +e.target.value;
  e.target.value = decimalSeparation(pct, true);
});

// Custom Annual Appreciation user input value
annualAppreciationInput.addEventListener('input', (e) => {
  clearTimeout(delayTimer);

  setTimeout(() => {
    let pct = +e.target.value;
    if (pct < 0) {
      e.target.value = 0;
    } else {
      annualAppreciation = pct / 100;
      runCalculation();
    }
  }, 300);
});
annualAppreciationInput.addEventListener('blur', (e) => {
  const pct =
    e.target.value === '' ? annualAppreciation * 100 : +e.target.value;
  e.target.value = decimalSeparation(pct, true);
});

// Years change
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'aria-valuenow'
    ) {
      holdingPeriod = +mutation.target.ariaValueNow;
      runCalculation();
    }
  });
});
observer.observe(yearRange, { attributes: true });

// =======> Update Chart data
function updateChart(dividendsFlows, unrealizedAppreciationFlows) {
  let yearLabels = Array.from({ length: holdingPeriod }, (_, i) => i);

  const labels = ['', ...yearLabels];
  const dataset1 = [null, ...dividendsFlows];
  const dataset2 = [null, ...unrealizedAppreciationFlows];

  calcChartImp.data.labels = labels;
  calcChartImp.data.datasets[0].data = dataset1;
  calcChartImp.data.datasets[1].data = dataset2;

  calcChartImp.update();
}

// =======> Save Estimate
let estimateResults;
let estimateSaved = false;

saveEstimateBtn.addEventListener('click', () => {
  if (userId === null || userId === 'null') {
    // if not logged/no uid open login popup
    document.querySelector('#login-popup').style.display = 'flex';
  } else if (!estimateSaved) {
    let saveData = {
      userId,
      anonID,
      page: window.location.href,
      inputs: {
        initialOfferingValue,
        annualAppreciation,
        annualCashFlowPct,
        initialInvestment,
        holdingPeriod,
        annualCashFlowIncrease,
        dispositionExpensePct,
        initialHomeValue,
        furnishingValue,
        cashReserves,
      },
      results: estimateResults,
    };

    localStorage.setItem(
      `estimate_${Math.random().toString(36).substring(2)}`,
      JSON.stringify(saveData)
    );

    // Confetti at the center of the button
    const buttonRect = saveEstimateBtn.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;
    confetti({
      particleCount: 200,
      startVelocity: 6,
      gravity: 0.1,
      drift: 0.4,
      ticks: 100,
      angle: 60,
      spread: 60,
      scalar: 0.3,
      colors: ['#FFFF04', '#EA4C89', '#892AB8', '#4AF2FD'],
      origin: {
        x: centerX / window.innerWidth,
        // since they fall down, start a bit higher than random
        y: centerY / window.innerHeight,
      },
    });

    estimateSaved = true;
    saveEstimateBtn.innerText = 'Estimate Saved';
    saveEstimateBtn.style.cursor = 'not-allowed';
    saveEstimateBtn.style.opacity = '0.5';
  } else return;
});

// =======> Calculation results and DOM updates
function runCalculation() {
  let {
    cashFlows,
    dividendsFlows,
    homeValues,
    unrealizedAppreciation,
    unrealizedAppreciationFlows,
    totalIncrease,
    finalHomeValue,
  } = calculateCashFlows(
    initialOfferingValue,
    annualAppreciation,
    annualCashFlowPct,
    initialInvestment,
    holdingPeriod,
    annualCashFlowIncrease,
    dispositionExpensePct,
    initialHomeValue,
    cashReserves,
    furnishingValue
  );

  let irrResult = irr(cashFlows);
  let totalReturnedValue = cashFlows[cashFlows.length - 1];
  let netReturnedValue = totalReturnedValue - initialInvestment;

  // UI Expected return
  returnTotal.forEach(
    (total) =>
      (total.innerText = `$${totalReturnedValue.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })}`)
  );
  // UI Return percentage
  returnPercentage.forEach((pct) => {
    pct.querySelector('.return-percentage-text').innerText = `${(
      irrResult * 100
    ).toFixed(2)}%/year`;
  });

  // shine effect on result change
  returnPercentage.forEach((pct) => {
    pct.classList.add('shine-effect');
    setTimeout(() => {
      pct.classList.remove('shine-effect');
    }, 600);
  });

  updateChart(dividendsFlows, unrealizedAppreciationFlows);

  if (estimateSaved) {
    estimateSaved = false;
    saveEstimateBtn.innerText = 'Save this Estimate';
    saveEstimateBtn.style.cursor = 'pointer';
    saveEstimateBtn.style.opacity = '1';
  }

  estimateResults = {
    cashFlows,
    dividendsFlows,
    homeValues,
    unrealizedAppreciation,
    unrealizedAppreciationFlows,
    totalIncrease,
    finalHomeValue,
    irrResult,
    totalReturnedValue,
    netReturnedValue,
  };
}
runCalculation();

// ============================================

// MATHs for the Calculation

// ============================================
function newton(f, df, x0, tol = 1e-7, maxIter = 1000) {
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    let dx = f(x) / df(x);
    x = x - dx;
    if (Math.abs(dx) < tol) {
      return x;
    }
  }
  throw new Error("Newton's method did not converge");
}

function irr(cashFlows) {
  let f = (r) =>
    cashFlows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + r, i), 0);
  let df = (r) =>
    cashFlows.reduce(
      (acc, cf, i) => acc - (i * cf) / Math.pow(1 + r, i + 1),
      0
    );
  return newton(f, df, 0.1);
}

function calculateCashFlows(
  initialOfferingValue,
  annualAppreciation,
  annualCashFlowPct,
  initialInvestment,
  holdingPeriod,
  annualCashFlowIncrease,
  dispositionExpensePct,
  initialHomeValue,
  cashReserves,
  furnishingValue
) {
  let cashFlows = [-initialInvestment];
  let dividendsFlows = [];
  let ownershipPercentage = initialInvestment / initialOfferingValue;

  for (let year = 1; year <= holdingPeriod; year++) {
    let annualCashFlow =
      initialOfferingValue *
      annualCashFlowPct *
      Math.pow(1 + annualCashFlowIncrease, year - 1) *
      ownershipPercentage;
    cashFlows.push(annualCashFlow);
    dividendsFlows.push(annualCashFlow);
  }

  let homeValues = Array.from(
    { length: holdingPeriod + 1 },
    (_, i) => initialHomeValue * Math.pow(1 + annualAppreciation, i)
  );
  let unrealizedAppreciation = Array.from(
    { length: holdingPeriod },
    (_, i) => homeValues[i + 1] - homeValues[i]
  );
  let unrealizedAppreciationFlows = unrealizedAppreciation.map(
    (value) => value * ownershipPercentage
  );

  let totalIncrease = homeValues[homeValues.length - 1] - homeValues[0];
  let finalHomeValue = homeValues[homeValues.length - 1];

  let finalValue =
    finalHomeValue +
    cashReserves +
    furnishingValue -
    finalHomeValue * dispositionExpensePct;
  let netProceeds = finalValue * ownershipPercentage;
  cashFlows[cashFlows.length - 1] += netProceeds;

  return {
    cashFlows,
    dividendsFlows,
    homeValues,
    unrealizedAppreciation,
    unrealizedAppreciationFlows,
    totalIncrease,
    finalHomeValue,
  };
}
