class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }
    
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async run() {
        console.log('🚀 Running tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.passed++;
                this.results.push({ name: test.name, status: 'PASS', error: null });
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                this.results.push({ name: test.name, status: 'FAIL', error: error.message });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        
        if (this.failed > 0) {
            console.log('\n❌ Some tests failed:');
            this.results.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  - ${r.name}: ${r.error}`);
            });
        }
        
        return this.failed === 0;
    }
    
    displayResults() {
        const container = document.getElementById('testResults');
        if (!container) return;
        
        container.innerHTML = '';
        
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        summary.innerHTML = `
            <h3>Test Results</h3>
            <p>Total: ${this.tests.length} | Passed: ${this.passed} | Failed: ${this.failed}</p>
        `;
        container.appendChild(summary);
        
        const resultsList = document.createElement('ul');
        resultsList.className = 'test-results';
        
        this.results.forEach(result => {
            const item = document.createElement('li');
            item.className = result.status === 'PASS' ? 'test-pass' : 'test-fail';
            item.innerHTML = `
                <span class="test-name">${result.name}</span>
                <span class="test-status">${result.status}</span>
                ${result.error ? `<div class="test-error">${result.error}</div>` : ''}
            `;
            resultsList.appendChild(item);
        });
        
        container.appendChild(resultsList);
    }
}

// Simple assertion functions
function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
}

function assertApproxEqual(actual, expected, tolerance = 0.001, message = '') {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`Expected ${expected} (±${tolerance}), got ${actual}. ${message}`);
    }
}

function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(`Expected true, got false. ${message}`);
    }
}

function assertFalse(condition, message = '') {
    if (condition) {
        throw new Error(`Expected false, got true. ${message}`);
    }
}

function assertNotNull(value, message = '') {
    if (value === null || value === undefined) {
        throw new Error(`Expected non-null value, got ${value}. ${message}`);
    }
}