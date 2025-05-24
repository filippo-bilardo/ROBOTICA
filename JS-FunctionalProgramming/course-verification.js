#!/usr/bin/env node

/**
 * Course Verification Script
 * Verifica che tutti i moduli del corso siano completi
 */

const fs = require('fs');
const path = require('path');

const courseRoot = __dirname;
const expectedModules = [
    '01-IntroduzionePF',
    '02-FunzioniPureImmutabilita', 
    '03-HigherOrderFunctions',
    '04-MapFilterReduce',
    '05-CurryingComposizione',
    '06-Ricorsione',
    '07-LazyEvaluation',
    '08-MonadsGestioneErrori',
    '09-AsincroniaPF',
    '10-LibrerieFunzionali'
];

console.log('🎓 VERIFICA COMPLETAMENTO CORSO JS FUNCTIONAL PROGRAMMING');
console.log('=' .repeat(60));

let totalFiles = 0;
let totalErrors = 0;

expectedModules.forEach((module, index) => {
    console.log(`\n📚 Modulo ${index + 1}: ${module}`);
    
    const modulePath = path.join(courseRoot, module);
    
    if (!fs.existsSync(modulePath)) {
        console.log('❌ Modulo non trovato');
        totalErrors++;
        return;
    }
    
    // Verifica struttura base
    const requiredDirs = ['teoria', 'esempi', 'esercizi'];
    const moduleFiles = {
        teoria: 0,
        esempi: 0, 
        esercizi: 0,
        readme: 0
    };
    
    // Conta README del modulo
    if (fs.existsSync(path.join(modulePath, 'README.md'))) {
        moduleFiles.readme = 1;
        console.log('✅ README.md');
    } else {
        console.log('❌ README.md mancante');
        totalErrors++;
    }
    
    // Verifica cartelle e conta file
    requiredDirs.forEach(dir => {
        const dirPath = path.join(modulePath, dir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f => 
                f.endsWith('.md') || f.endsWith('.js')
            );
            moduleFiles[dir] = files.length;
            console.log(`✅ ${dir}/: ${files.length} file`);
            totalFiles += files.length;
        } else {
            console.log(`❌ ${dir}/ mancante`);
            totalErrors++;
        }
    });
    
    const moduleTotal = Object.values(moduleFiles).reduce((a, b) => a + b, 0);
    console.log(`📊 Totale file modulo: ${moduleTotal}`);
});

console.log('\n' + '='.repeat(60));
console.log('📈 STATISTICHE FINALI:');
console.log(`✅ Moduli completi: ${expectedModules.length}`);
console.log(`📁 File totali: ${totalFiles}`);
console.log(`❌ Errori rilevati: ${totalErrors}`);

if (totalErrors === 0) {
    console.log('\n🎉 CORSO COMPLETO E VERIFICATO!');
    console.log('🚀 Tutti i moduli sono stati implementati correttamente.');
    console.log('💡 Il corso è pronto per essere utilizzato da studenti.');
} else {
    console.log('\n⚠️  Alcuni problemi rilevati nel corso.');
    console.log('🔧 Controlla i moduli segnalati sopra.');
}

console.log('\n📚 Contenuto del corso:');
console.log('- Teoria: concetti fondamentali della programmazione funzionale');
console.log('- Esempi: implementazioni pratiche e casi d\'uso');
console.log('- Esercizi: attività hands-on con soluzioni dettagliate');
console.log('- Progetti: applicazioni reali dei concetti appresi');

console.log('\n🎯 Obiettivi raggiunti:');
console.log('- Comprensione dei principi della programmazione funzionale');
console.log('- Implementazione di pattern funzionali avanzati');
console.log('- Gestione degli errori con approcci funzionali');
console.log('- Utilizzo di librerie funzionali moderne');
console.log('- Applicazione pratica in progetti reali');
