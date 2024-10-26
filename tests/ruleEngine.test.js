const { createRule, combineRules, evaluateRule } = require('../controllers/ruleController');

test('should create AST from rule string', () => {
    const rule = "age > 30 AND department = 'Sales'";
    const ast = createRule(rule);
    expect(ast).toBeTruthy(); // AST created
});

test('should evaluate rule correctly', () => {
    const ast = createRule("age > 30");
    const result = evaluateRule(ast, { age: 35 });
    expect(result).toBe(true); // 35 > 30
});
