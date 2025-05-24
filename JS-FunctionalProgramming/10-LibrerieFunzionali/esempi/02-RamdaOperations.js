/**
 * Operazioni Avanzate con Ramda
 * Questo file dimostra l'uso di Ramda per programmazione funzionale pura,
 * composizione avanzata e manipolazione immutabile di dati complessi.
 */

// Installazione: npm install ramda
import * as R from 'ramda';

// ==========================================
// DATI DI ESEMPIO
// ==========================================

const salesData = [
  { id: 1, rep: 'Alice', region: 'North', product: 'Laptop', amount: 1200, month: 'Jan', year: 2024 },
  { id: 2, rep: 'Bob', region: 'South', product: 'Phone', amount: 800, month: 'Jan', year: 2024 },
  { id: 3, rep: 'Alice', region: 'North', product: 'Tablet', amount: 600, month: 'Feb', year: 2024 },
  { id: 4, rep: 'Charlie', region: 'East', product: 'Laptop', amount: 1200, month: 'Feb', year: 2024 },
  { id: 5, rep: 'Bob', region: 'South', product: 'Headphones', amount: 300, month: 'Feb', year: 2024 },
  { id: 6, rep: 'Diana', region: 'West', product: 'Phone', amount: 900, month: 'Mar', year: 2024 },
  { id: 7, rep: 'Alice', region: 'North', product: 'Laptop', amount: 1100, month: 'Mar', year: 2024 }
];

const inventory = {
  electronics: {
    computers: {
      laptops: [
        { model: 'MacBook Pro', price: 2499, stock: 15 },
        { model: 'Dell XPS', price: 1899, stock: 8 },
        { model: 'ThinkPad', price: 1599, stock: 12 }
      ],
      desktops: [
        { model: 'iMac', price: 1999, stock: 5 },
        { model: 'Dell OptiPlex', price: 899, stock: 20 }
      ]
    },
    phones: [
      { model: 'iPhone 15', price: 999, stock: 25 },
      { model: 'Samsung Galaxy', price: 799, stock: 18 }
    ]
  },
  furniture: {
    office: [
      { model: 'Ergonomic Chair', price: 399, stock: 7 },
      { model: 'Standing Desk', price: 599, stock: 3 }
    ]
  }
};

// ==========================================
// COMPOSIZIONE E POINT-FREE STYLE
// ==========================================

console.log('=== COMPOSIZIONE E POINT-FREE STYLE ===');

// 1. Pipeline di analisi vendite - Point-free style
const getTopPerformers = R.pipe(
  R.filter(R.propSatisfies(R.gt(R.__, 500), 'amount')), // Solo vendite > 500
  R.groupBy(R.prop('rep')), // Raggruppa per rappresentante
  R.mapObjIndexed(R.pipe(
    R.map(R.prop('amount')),
    R.sum
  )), // Somma per rappresentante
  R.toPairs, // Converti in array di [nome, totale]
  R.map(([rep, total]) => ({ rep, total })), // Trasforma in oggetti
  R.sortBy(R.prop('total')), // Ordina per totale
  R.reverse, // Dal più alto al più basso
  R.take(3) // Top 3
);

console.log('Top 3 performers:', getTopPerformers(salesData));

// 2. Analisi per prodotto con performance metric
const analyzeProductPerformance = R.pipe(
  R.groupBy(R.prop('product')),
  R.mapObjIndexed(R.pipe(
    R.juxt([
      R.length, // Numero vendite
      R.pipe(R.map(R.prop('amount')), R.sum), // Totale vendite
      R.pipe(R.map(R.prop('amount')), R.mean), // Media vendite
      R.pipe(R.map(R.prop('amount')), R.apply(Math.max)), // Vendita massima
      R.pipe(R.map(R.prop('amount')), R.apply(Math.min)) // Vendita minima
    ]),
    ([count, total, avg, max, min]) => ({
      salesCount: count,
      totalRevenue: total,
      avgSaleAmount: Math.round(avg),
      maxSale: max,
      minSale: min,
      performanceScore: Math.round((total / count) * (count / 10))
    })
  ))
);

console.log('Product performance:', analyzeProductPerformance(salesData));

// ==========================================
// LENSES PER MANIPOLAZIONE IMMUTABILE
// ==========================================

console.log('\\n=== LENSES PER MANIPOLAZIONE IMMUTABILE ===');

// 1. Definizione di lenses per navigazione struttura annidata
const laptopsLens = R.lensPath(['electronics', 'computers', 'laptops']);
const firstLaptopLens = R.lensPath(['electronics', 'computers', 'laptops', 0]);
const firstLaptopPriceLens = R.lensPath(['electronics', 'computers', 'laptops', 0, 'price']);
const phonesLens = R.lensPath(['electronics', 'phones']);

// 2. Lettura attraverso lenses
const laptops = R.view(laptopsLens, inventory);
const firstLaptopPrice = R.view(firstLaptopPriceLens, inventory);

console.log('First laptop price:', firstLaptopPrice);

// 3. Aggiornamenti immutabili con lenses
const discountFirstLaptop = R.over(firstLaptopPriceLens, R.multiply(0.9));
const addNewLaptop = R.over(laptopsLens, R.append({
  model: 'New Gaming Laptop',
  price: 2199,
  stock: 10
}));

const inventoryWithDiscount = discountFirstLaptop(inventory);
const inventoryWithNewLaptop = addNewLaptop(inventory);

console.log('Original first laptop price:', R.view(firstLaptopPriceLens, inventory));
console.log('Discounted first laptop price:', R.view(firstLaptopPriceLens, inventoryWithDiscount));
console.log('Laptops count after adding new:', R.view(laptopsLens, inventoryWithNewLaptop).length);

// 4. Lens composizione per operazioni complesse
const updateInventoryPrices = R.pipe(
  R.over(laptopsLens, R.map(R.over(R.lensProp('price'), R.multiply(1.1)))), // +10% laptops
  R.over(phonesLens, R.map(R.over(R.lensProp('price'), R.multiply(0.95)))) // -5% phones
);

const updatedInventory = updateInventoryPrices(inventory);
console.log('Updated prices applied');

// ==========================================
// PREDICATI E COMBINATORI LOGICI
// ==========================================

console.log('\\n=== PREDICATI E COMBINATORI LOGICI ===');

// 1. Predicati base
const isHighValue = R.propSatisfies(R.gt(R.__, 1000), 'amount');
const isFromAlice = R.propEq('rep', 'Alice');
const isFromNorth = R.propEq('region', 'North');
const isRecentMonth = R.pipe(R.prop('month'), R.includes(R.__, ['Feb', 'Mar']));

// 2. Combinatori logici
const isHighValueFromAlice = R.both(isHighValue, isFromAlice);
const isAliceOrNorth = R.either(isFromAlice, isFromNorth);
const isNotHighValue = R.complement(isHighValue);

// 3. Combinatori complessi
const isStarSale = R.allPass([
  isHighValue,
  isFromNorth,
  isRecentMonth
]);

const hasAnySaleIssue = R.anyPass([
  R.propSatisfies(R.lt(R.__, 100), 'amount'), // Vendita troppo bassa
  R.propEq('region', 'Unknown'), // Regione sconosciuta
  R.complement(R.has('rep')) // Manca rappresentante
]);

// 4. Applicazione dei predicati
const starSales = R.filter(isStarSale, salesData);
const aliceHighValueSales = R.filter(isHighValueFromAlice, salesData);

console.log('Star sales:', starSales.length);
console.log('Alice high-value sales:', aliceHighValueSales);

// ==========================================
// TRANSDUCERS PER PERFORMANCE
// ==========================================

console.log('\\n=== TRANSDUCERS PER PERFORMANCE ===');

// 1. Generazione dataset grande per test performance
const generateLargeSalesData = (count) => 
  R.times(i => ({
    id: i,
    rep: ['Alice', 'Bob', 'Charlie', 'Diana'][i % 4],
    region: ['North', 'South', 'East', 'West'][i % 4],
    amount: Math.floor(Math.random() * 2000) + 100,
    product: ['Laptop', 'Phone', 'Tablet'][i % 3]
  }), count);

const largeSalesData = generateLargeSalesData(100000);

// 2. Transducer per operazioni efficienti
const salesAnalysisTransducer = R.compose(
  R.filter(R.propSatisfies(R.gt(R.__, 500), 'amount')),
  R.map(R.pick(['rep', 'amount'])),
  R.take(1000)
);

// 3. Applicazione del transducer
console.time('Transducer performance');
const efficientResult = R.transduce(
  salesAnalysisTransducer,
  R.flip(R.append),
  [],
  largeSalesData
);
console.timeEnd('Transducer performance');

console.log('Efficient result count:', efficientResult.length);

// ==========================================
// CONDITIONAL LOGIC AVANZATA
// ==========================================

console.log('\\n=== CONDITIONAL LOGIC AVANZATA ===');

// 1. cond per business logic complessa
const calculateCommission = R.cond([
  [R.propSatisfies(R.gt(R.__, 2000), 'amount'), R.pipe(R.prop('amount'), R.multiply(0.15))],
  [R.propSatisfies(R.gt(R.__, 1000), 'amount'), R.pipe(R.prop('amount'), R.multiply(0.10))],
  [R.propSatisfies(R.gt(R.__, 500), 'amount'), R.pipe(R.prop('amount'), R.multiply(0.05))],
  [R.T, R.always(0)] // Default case
]);

const getSalesRating = R.cond([
  [R.propSatisfies(R.gt(R.__, 1500), 'amount'), R.always('EXCELLENT')],
  [R.propSatisfies(R.gt(R.__, 1000), 'amount'), R.always('GOOD')],
  [R.propSatisfies(R.gt(R.__, 500), 'amount'), R.always('AVERAGE')],
  [R.T, R.always('POOR')]
]);

// 2. when/unless per trasformazioni condizionali
const enhanceSaleRecord = R.pipe(
  R.when(
    isHighValue,
    R.assoc('isHighValue', true)
  ),
  R.unless(
    R.has('commission'),
    R.converge(R.assoc('commission'), [R.always('commission'), calculateCommission])
  ),
  R.converge(R.assoc('rating'), [R.always('rating'), getSalesRating])
);

const enhancedSalesData = R.map(enhanceSaleRecord, salesData);
console.log('Enhanced sales data sample:', R.take(3, enhancedSalesData));

// ==========================================
// FUNZIONI AVANZATE DI AGGREGAZIONE
// ==========================================

console.log('\\n=== FUNZIONI AVANZATE DI AGGREGAZIONE ===');

// 1. Multi-dimensional grouping
const multidimensionalGrouping = R.pipe(
  R.groupBy(R.prop('region')),
  R.mapObjIndexed(R.groupBy(R.prop('month'))),
  R.mapObjIndexed(R.mapObjIndexed(R.pipe(
    R.groupBy(R.prop('rep')),
    R.mapObjIndexed(R.pipe(
      R.map(R.prop('amount')),
      R.sum
    ))
  )))
);

const regionMonthRepAnalysis = multidimensionalGrouping(salesData);
console.log('Multi-dimensional analysis:', 
  JSON.stringify(regionMonthRepAnalysis, null, 2));

// 2. Statistical analysis
const getStatistics = R.juxt([
  R.length,
  R.pipe(R.map(R.prop('amount')), R.sum),
  R.pipe(R.map(R.prop('amount')), R.mean),
  R.pipe(R.map(R.prop('amount')), R.apply(Math.max)),
  R.pipe(R.map(R.prop('amount')), R.apply(Math.min)),
  R.pipe(R.map(R.prop('amount')), R.sort(R.subtract), arr => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  })
]);

const statisticsLabels = ['count', 'total', 'mean', 'max', 'min', 'median'];
const createStatistics = R.pipe(
  getStatistics,
  R.zipObj(statisticsLabels)
);

const salesStatistics = createStatistics(salesData);
console.log('Sales statistics:', salesStatistics);

// ==========================================
// UTILITY FUNCTIONS RIUSABILI
// ==========================================

console.log('\\n=== UTILITY FUNCTIONS RIUSABILI ===');

// 1. Generic data processing utilities
const createAnalyzer = (groupKey, valueKey, aggregator = R.sum) => R.pipe(
  R.groupBy(R.prop(groupKey)),
  R.mapObjIndexed(R.pipe(
    R.map(R.prop(valueKey)),
    aggregator
  ))
);

const analyzeByRep = createAnalyzer('rep', 'amount');
const analyzeByRegion = createAnalyzer('region', 'amount');
const analyzeByProduct = createAnalyzer('product', 'amount', R.mean);

console.log('Sales by rep:', analyzeByRep(salesData));
console.log('Sales by region:', analyzeByRegion(salesData));
console.log('Avg sales by product:', analyzeByProduct(salesData));

// 2. Generic filtering and sorting utilities
const createTopNAnalyzer = (n, sortKey) => R.pipe(
  R.sortBy(R.prop(sortKey)),
  R.reverse,
  R.take(n)
);

const top3BySales = createTopNAnalyzer(3, 'amount');
console.log('Top 3 sales:', top3BySales(salesData));

// 3. Data validation utilities
const createValidator = (rules) => (data) => R.pipe(
  R.toPairs,
  R.map(([key, validator]) => ({
    field: key,
    isValid: validator(R.prop(key, data)),
    value: R.prop(key, data)
  })),
  R.groupBy(R.prop('isValid')),
  R.over(R.lensProp('true'), R.defaultTo([])),
  R.over(R.lensProp('false'), R.defaultTo([]))
)(rules);

const salesValidationRules = {
  amount: R.pipe(R.type, R.equals('Number')),
  rep: R.pipe(R.type, R.equals('String')),
  region: R.includes(R.__, ['North', 'South', 'East', 'West'])
};

const validateSale = createValidator(salesValidationRules);
const validationResult = validateSale(salesData[0]);
console.log('Validation result:', validationResult);

// ==========================================
// ESEMPI PRATICI DI BUSINESS LOGIC
// ==========================================

console.log('\\n=== ESEMPI PRATICI DI BUSINESS LOGIC ===');

// 1. Sales report generation
const generateSalesReport = R.pipe(
  R.groupBy(R.prop('month')),
  R.mapObjIndexed(monthSales => ({
    totalSales: R.pipe(R.map(R.prop('amount')), R.sum)(monthSales),
    salesCount: monthSales.length,
    avgSale: R.pipe(R.map(R.prop('amount')), R.mean, Math.round)(monthSales),
    topRep: R.pipe(
      R.groupBy(R.prop('rep')),
      R.mapObjIndexed(R.pipe(R.map(R.prop('amount')), R.sum)),
      R.toPairs,
      R.sort(([,a], [,b]) => b - a),
      R.head,
      R.head
    )(monthSales),
    topProduct: R.pipe(
      R.groupBy(R.prop('product')),
      R.mapObjIndexed(R.length),
      R.toPairs,
      R.sort(([,a], [,b]) => b - a),
      R.head,
      R.head
    )(monthSales)
  }))
);

const salesReport = generateSalesReport(salesData);
console.log('Monthly sales report:', JSON.stringify(salesReport, null, 2));

// 2. Inventory optimization
const optimizeInventory = R.pipe(
  R.over(
    R.lensPath(['electronics', 'computers', 'laptops']),
    R.map(R.when(
      R.propSatisfies(R.lt(R.__, 10), 'stock'),
      R.over(R.lensProp('stock'), R.add(20))
    ))
  ),
  R.over(
    R.lensPath(['electronics', 'phones']),
    R.map(R.when(
      R.propSatisfies(R.gt(R.__, 30), 'stock'),
      R.over(R.lensProp('stock'), R.multiply(0.8))
    ))
  )
);

const optimizedInventory = optimizeInventory(inventory);
console.log('Inventory optimization completed');

// Export delle funzioni per testing
export {
  getTopPerformers,
  analyzeProductPerformance,
  createAnalyzer,
  generateSalesReport,
  optimizeInventory,
  createValidator,
  multidimensionalGrouping
};
