/**
 * MODULO 4: MAP, FILTER, REDUCE - ESERCIZI COMBINATI
 * =================================================
 * 
 * Questo file contiene esercizi che combinano map, filter e reduce
 * per risolvere problemi complessi del mondo reale.
 * 
 * OBIETTIVI:
 * - Combinare multiple operazioni funzionali
 * - Ottimizzare le performance evitando iterazioni multiple
 * - Implementare pipeline di trasformazione dati
 * - Gestire casi d'uso complessi e realistici
 */

console.log('=== ESERCIZI COMBINATI MAP-FILTER-REDUCE ===\n');

// Dataset per gli esercizi
const employees = [
    { id: 1, name: 'Alice', department: 'Engineering', salary: 75000, experience: 5, skills: ['JavaScript', 'React', 'Node.js'] },
    { id: 2, name: 'Bob', department: 'Marketing', salary: 55000, experience: 3, skills: ['SEO', 'Content', 'Analytics'] },
    { id: 3, name: 'Charlie', department: 'Engineering', salary: 85000, experience: 7, skills: ['Python', 'Django', 'PostgreSQL'] },
    { id: 4, name: 'Diana', department: 'Sales', salary: 60000, experience: 4, skills: ['CRM', 'Negotiation', 'Presentations'] },
    { id: 5, name: 'Eve', department: 'Engineering', salary: 90000, experience: 8, skills: ['Java', 'Spring', 'Microservices'] },
    { id: 6, name: 'Frank', department: 'HR', salary: 50000, experience: 2, skills: ['Recruiting', 'Training', 'Compliance'] },
    { id: 7, name: 'Grace', department: 'Engineering', salary: 95000, experience: 10, skills: ['Architecture', 'DevOps', 'AWS'] },
    { id: 8, name: 'Henry', department: 'Finance', salary: 70000, experience: 6, skills: ['Excel', 'Analysis', 'Reporting'] }
];

const orders = [
    { id: 1, customerId: 101, items: [{ product: 'Laptop', price: 1200, quantity: 1 }, { product: 'Mouse', price: 25, quantity: 2 }], date: '2024-01-15', status: 'completed' },
    { id: 2, customerId: 102, items: [{ product: 'Keyboard', price: 80, quantity: 1 }], date: '2024-01-16', status: 'pending' },
    { id: 3, customerId: 101, items: [{ product: 'Monitor', price: 300, quantity: 2 }], date: '2024-01-17', status: 'completed' },
    { id: 4, customerId: 103, items: [{ product: 'Tablet', price: 500, quantity: 1 }, { product: 'Case', price: 30, quantity: 1 }], date: '2024-01-18', status: 'shipped' },
    { id: 5, customerId: 102, items: [{ product: 'Phone', price: 800, quantity: 1 }], date: '2024-01-19', status: 'completed' }
];

const students = [
    { id: 1, name: 'Anna', grades: [85, 92, 78, 95], courses: ['Math', 'Physics', 'Chemistry', 'Biology'] },
    { id: 2, name: 'Ben', grades: [72, 85, 90, 88], courses: ['Math', 'History', 'English', 'Art'] },
    { id: 3, name: 'Carol', grades: [95, 98, 92, 97], courses: ['Math', 'Physics', 'Computer Science', 'Statistics'] },
    { id: 4, name: 'David', grades: [68, 75, 82, 79], courses: ['English', 'History', 'Geography', 'Art'] },
    { id: 5, name: 'Emma', grades: [90, 87, 93, 89], courses: ['Math', 'Chemistry', 'Biology', 'Physics'] }
];

// ================================
// SEZIONE 1: ANALISI HR AZIENDALE
// ================================

console.log('1. ANALISI HR AZIENDALE');
console.log('========================');

/**
 * ESERCIZIO 1.1: Report Stipendi per Dipartimento
 * Calcola statistiche stipendiali per ogni dipartimento
 */
console.log('\n1.1 Report Stipendi per Dipartimento:');

const salaryReport = employees
    .reduce((report, emp) => {
        const dept = emp.department;
        if (!report[dept]) {
            report[dept] = { employees: [], totalSalary: 0, count: 0 };
        }
        report[dept].employees.push(emp.name);
        report[dept].totalSalary += emp.salary;
        report[dept].count += 1;
        return report;
    }, {});

// Aggiungi media stipendi
Object.keys(salaryReport).forEach(dept => {
    salaryReport[dept].averageSalary = Math.round(salaryReport[dept].totalSalary / salaryReport[dept].count);
});

console.log('Report Stipendi per Dipartimento:', salaryReport);

/**
 * ESERCIZIO 1.2: Top Performer Analysis
 * Trova i top performer (esperienza > 5 anni E stipendio > 70000)
 * e crea un report con le loro competenze più comuni
 */
console.log('\n1.2 Top Performer Analysis:');

const topPerformers = employees
    .filter(emp => emp.experience > 5 && emp.salary > 70000)
    .map(emp => ({
        name: emp.name,
        department: emp.department,
        salary: emp.salary,
        experience: emp.experience,
        skills: emp.skills
    }));

const topSkills = topPerformers
    .flatMap(emp => emp.skills)
    .reduce((skillCount, skill) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
        return skillCount;
    }, {});

console.log('Top Performers:', topPerformers);
console.log('Competenze più richieste:', topSkills);

/**
 * ESERCIZIO 1.3: Promotion Candidates
 * Identifica candidati per promozione e calcola budget necessario
 */
console.log('\n1.3 Promotion Candidates:');

const promotionCandidates = employees
    .filter(emp => emp.experience >= 5 && emp.salary < 80000)
    .map(emp => ({
        ...emp,
        suggestedSalary: Math.min(emp.salary * 1.15, 85000),
        salaryIncrease: Math.min(emp.salary * 1.15, 85000) - emp.salary
    }));

const promotionBudget = promotionCandidates
    .reduce((total, emp) => total + emp.salaryIncrease, 0);

console.log('Candidati per Promozione:', promotionCandidates);
console.log('Budget Totale Promozioni:', promotionBudget);

// ================================
// SEZIONE 2: ANALISI E-COMMERCE
// ================================

console.log('\n\n2. ANALISI E-COMMERCE');
console.log('======================');

/**
 * ESERCIZIO 2.1: Customer Analytics
 * Analizza il comportamento dei clienti
 */
console.log('\n2.1 Customer Analytics:');

const customerAnalytics = orders
    .filter(order => order.status === 'completed')
    .reduce((analytics, order) => {
        const customerId = order.customerId;
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (!analytics[customerId]) {
            analytics[customerId] = {
                totalSpent: 0,
                orderCount: 0,
                itemCount: 0,
                averageOrderValue: 0
            };
        }
        
        analytics[customerId].totalSpent += orderTotal;
        analytics[customerId].orderCount += 1;
        analytics[customerId].itemCount += order.items.reduce((sum, item) => sum + item.quantity, 0);
        analytics[customerId].averageOrderValue = analytics[customerId].totalSpent / analytics[customerId].orderCount;
        
        return analytics;
    }, {});

console.log('Customer Analytics:', customerAnalytics);

/**
 * ESERCIZIO 2.2: Product Performance
 * Analizza le performance dei prodotti
 */
console.log('\n2.2 Product Performance:');

const productPerformance = orders
    .flatMap(order => order.items)
    .reduce((products, item) => {
        const product = item.product;
        if (!products[product]) {
            products[product] = {
                totalQuantity: 0,
                totalRevenue: 0,
                averagePrice: 0,
                orderCount: 0
            };
        }
        
        products[product].totalQuantity += item.quantity;
        products[product].totalRevenue += item.price * item.quantity;
        products[product].orderCount += 1;
        products[product].averagePrice = item.price; // Assume prezzo fisso
        
        return products;
    }, {});

// Trova il prodotto più venduto
const bestSellingProduct = Object.entries(productPerformance)
    .reduce((best, [product, data]) => 
        data.totalQuantity > best.quantity 
            ? { product, quantity: data.totalQuantity, revenue: data.totalRevenue }
            : best
    , { product: '', quantity: 0, revenue: 0 });

console.log('Product Performance:', productPerformance);
console.log('Best Selling Product:', bestSellingProduct);

/**
 * ESERCIZIO 2.3: Revenue Optimization
 * Identifica opportunità di ottimizzazione del fatturato
 */
console.log('\n2.3 Revenue Optimization:');

const revenueAnalysis = {
    totalRevenue: orders
        .filter(order => order.status === 'completed')
        .reduce((total, order) => 
            total + order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 0),
    
    potentialRevenue: orders
        .filter(order => order.status === 'pending')
        .reduce((total, order) => 
            total + order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 0),
    
    highValueCustomers: Object.entries(customerAnalytics)
        .filter(([_, data]) => data.totalSpent > 1000)
        .map(([customerId, data]) => ({ customerId: parseInt(customerId), ...data })),
    
    averageOrderValue: orders
        .filter(order => order.status === 'completed')
        .map(order => order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
        .reduce((sum, orderValue, _, arr) => sum + orderValue / arr.length, 0)
};

console.log('Revenue Analysis:', revenueAnalysis);

// ================================
// SEZIONE 3: ANALISI ACCADEMICA
// ================================

console.log('\n\n3. ANALISI ACCADEMICA');
console.log('=====================');

/**
 * ESERCIZIO 3.1: Student Performance Report
 * Crea un report completo delle performance degli studenti
 */
console.log('\n3.1 Student Performance Report:');

const studentReport = students
    .map(student => {
        const average = student.grades.reduce((sum, grade) => sum + grade, 0) / student.grades.length;
        const highest = Math.max(...student.grades);
        const lowest = Math.min(...student.grades);
        
        return {
            ...student,
            average: Math.round(average * 100) / 100,
            highest,
            lowest,
            status: average >= 90 ? 'Excellent' : average >= 80 ? 'Good' : average >= 70 ? 'Satisfactory' : 'Needs Improvement'
        };
    })
    .sort((a, b) => b.average - a.average);

console.log('Student Performance Report:', studentReport);

/**
 * ESERCIZIO 3.2: Course Analysis
 * Analizza le performance per corso
 */
console.log('\n3.2 Course Analysis:');

const courseAnalysis = students
    .flatMap(student => 
        student.courses.map((course, index) => ({
            course,
            grade: student.grades[index],
            student: student.name
        }))
    )
    .reduce((analysis, { course, grade, student }) => {
        if (!analysis[course]) {
            analysis[course] = {
                grades: [],
                students: [],
                average: 0,
                highest: 0,
                lowest: 100
            };
        }
        
        analysis[course].grades.push(grade);
        analysis[course].students.push(student);
        analysis[course].highest = Math.max(analysis[course].highest, grade);
        analysis[course].lowest = Math.min(analysis[course].lowest, grade);
        
        return analysis;
    }, {});

// Calcola le medie
Object.keys(courseAnalysis).forEach(course => {
    const grades = courseAnalysis[course].grades;
    courseAnalysis[course].average = Math.round(
        (grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 100
    ) / 100;
});

console.log('Course Analysis:', courseAnalysis);

/**
 * ESERCIZIO 3.3: Honor Roll e Academic Support
 * Identifica studenti per Honor Roll e supporto accademico
 */
console.log('\n3.3 Honor Roll e Academic Support:');

const academicCategories = studentReport.reduce((categories, student) => {
    if (student.average >= 90) {
        categories.honorRoll.push(student);
    } else if (student.average < 75) {
        categories.needsSupport.push(student);
    } else {
        categories.regular.push(student);
    }
    return categories;
}, { honorRoll: [], regular: [], needsSupport: [] });

console.log('Academic Categories:', academicCategories);

// ================================
// SEZIONE 4: PIPELINE AVANZATE
// ================================

console.log('\n\n4. PIPELINE AVANZATE');
console.log('====================');

/**
 * ESERCIZIO 4.1: Multi-Step Data Transformation
 * Crea una pipeline complessa che trasforma i dati attraverso multiple fasi
 */
console.log('\n4.1 Multi-Step Data Transformation:');

const transformationPipeline = (data, transformations) => {
    return transformations.reduce((result, transformation) => transformation(result), data);
};

// Esempio: Trasforma i dati degli impiegati per creare un report esecutivo
const executiveReport = transformationPipeline(employees, [
    // Step 1: Filtra impiegati senior
    data => data.filter(emp => emp.experience >= 5),
    
    // Step 2: Raggruppa per dipartimento
    data => data.reduce((groups, emp) => {
        const dept = emp.department;
        if (!groups[dept]) groups[dept] = [];
        groups[dept].push(emp);
        return groups;
    }, {}),
    
    // Step 3: Calcola metriche per dipartimento
    data => Object.entries(data).map(([dept, employees]) => ({
        department: dept,
        seniorCount: employees.length,
        averageSalary: Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length),
        totalExperience: employees.reduce((sum, emp) => sum + emp.experience, 0),
        skillDiversity: [...new Set(employees.flatMap(emp => emp.skills))].length
    })),
    
    // Step 4: Ordina per importanza (media stipendio * numero senior)
    data => data.sort((a, b) => (b.averageSalary * b.seniorCount) - (a.averageSalary * a.seniorCount))
]);

console.log('Executive Report:', executiveReport);

/**
 * ESERCIZIO 4.2: Performance Optimization
 * Confronta approcci diversi per ottimizzare le performance
 */
console.log('\n4.2 Performance Optimization:');

// Approccio Non Ottimizzato (multiple iterazioni)
console.time('Non Ottimizzato');
const nonOptimized = {
    highEarners: employees.filter(emp => emp.salary > 70000),
    engineeringNames: employees.filter(emp => emp.department === 'Engineering').map(emp => emp.name),
    totalSalary: employees.reduce((sum, emp) => sum + emp.salary, 0)
};
console.timeEnd('Non Ottimizzato');

// Approccio Ottimizzato (singola iterazione)
console.time('Ottimizzato');
const optimized = employees.reduce((result, emp) => {
    // Calcola tutto in una singola iterazione
    if (emp.salary > 70000) {
        result.highEarners.push(emp);
    }
    if (emp.department === 'Engineering') {
        result.engineeringNames.push(emp.name);
    }
    result.totalSalary += emp.salary;
    return result;
}, { highEarners: [], engineeringNames: [], totalSalary: 0 });
console.timeEnd('Ottimizzato');

console.log('Risultati identici:', JSON.stringify(nonOptimized) === JSON.stringify(optimized));

// ================================
// SEZIONE 5: ESERCIZI BONUS
// ================================

console.log('\n\n5. ESERCIZI BONUS');
console.log('=================');

/**
 * BONUS 1: Functional Composition Utility
 * Implementa utilità per composizione funzionale
 */
console.log('\n5.1 Functional Composition Utility:');

const pipe = (...functions) => (value) => functions.reduce((acc, fn) => fn(acc), value);
const compose = (...functions) => (value) => functions.reduceRight((acc, fn) => fn(acc), value);

// Esempio d'uso
const processEmployeeData = pipe(
    data => data.filter(emp => emp.department === 'Engineering'),
    data => data.map(emp => ({ ...emp, bonus: emp.salary * 0.1 })),
    data => data.sort((a, b) => b.experience - a.experience)
);

const engineeringWithBonus = processEmployeeData(employees);
console.log('Engineering with Bonus (top 3):', engineeringWithBonus.slice(0, 3));

/**
 * BONUS 2: Data Validation Pipeline
 * Crea una pipeline per validare e pulire i dati
 */
console.log('\n5.2 Data Validation Pipeline:');

const validateEmployee = (emp) => {
    const errors = [];
    if (!emp.name || emp.name.length < 2) errors.push('Nome non valido');
    if (!emp.salary || emp.salary < 0) errors.push('Stipendio non valido');
    if (!emp.experience || emp.experience < 0) errors.push('Esperienza non valida');
    return { ...emp, valid: errors.length === 0, errors };
};

const cleanData = (data) => data
    .map(validateEmployee)
    .filter(emp => emp.valid)
    .map(emp => {
        // Rimuovi campo errors e valid per pulizia finale
        const { errors, valid, ...cleanEmp } = emp;
        return cleanEmp;
    });

// Test con dati sporchi
const dirtyData = [
    ...employees,
    { id: 99, name: 'X', department: 'Test', salary: -1000, experience: -1, skills: [] },
    { id: 100, name: '', department: 'Test', salary: 50000, experience: 2, skills: ['Test'] }
];

const cleanedData = cleanData(dirtyData);
console.log(`Dati originali: ${dirtyData.length}, Dati puliti: ${cleanedData.length}`);

/**
 * BONUS 3: Advanced Analytics
 * Implementa analytics avanzate con correlazioni
 */
console.log('\n5.3 Advanced Analytics:');

const calculateCorrelation = (arr1, arr2) => {
    const n = arr1.length;
    const sum1 = arr1.reduce((a, b) => a + b, 0);
    const sum2 = arr2.reduce((a, b) => a + b, 0);
    const sum1Sq = arr1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = arr2.reduce((a, b) => a + b * b, 0);
    const pSum = arr1.map((x, i) => x * arr2[i]).reduce((a, b) => a + b, 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
};

const salaries = employees.map(emp => emp.salary);
const experiences = employees.map(emp => emp.experience);
const skillCounts = employees.map(emp => emp.skills.length);

const correlations = {
    salaryExperience: calculateCorrelation(salaries, experiences),
    salarySkills: calculateCorrelation(salaries, skillCounts),
    experienceSkills: calculateCorrelation(experiences, skillCounts)
};

console.log('Correlazioni:', correlations);

console.log('\n=== FINE ESERCIZI COMBINATI ===');

/**
 * SFIDE AGGIUNTIVE:
 * 
 * 1. Implementa un sistema di caching per ottimizzare calcoli ripetuti
 * 2. Crea una pipeline di trasformazione dati configurabile tramite JSON
 * 3. Implementa un sistema di A/B testing per confrontare algoritmi diversi
 * 4. Crea un sistema di reporting real-time con aggiornamenti incrementali
 * 5. Implementa pattern funzionali avanzati come Maybe/Either per gestione errori
 */
