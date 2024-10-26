const Rule = require('../models/ruleModel');

// Define a class for AST nodes
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type;
        this.left = left;
        this.right = right;
        this.value = value;
    }
}

// Helper function to create an AST node from a rule string
const createRule = (ruleString) => {
    // Placeholder parsing function, ideally you'd use a proper parser here
    let tokens = ruleString.split(' ');
    
    // Construct a simple AST node for testing
    const left = new Node('operand', null, null, tokens[0].replace(/[()]/g, '').trim());
    const operator = new Node('operator', left, null, tokens[1]);
    const right = new Node('operand', null, null, tokens[2].replace(/[()]/g, '').trim());

    return new Node('operator', operator, right, tokens[3]);
};

// Recursive function to combine multiple AST nodes using AND logic
const combineRules = (rules) => {
    if (rules.length === 0) return null;

    let combinedAST = createRule(rules[0]);
    for (let i = 1; i < rules.length; i++) {
        combinedAST = new Node('operator', combinedAST, createRule(rules[i]), 'AND');
    }
    return combinedAST;
};

const evaluateRule = (ast, data) => {
    if (!ast) {
        console.error("Encountered a null node in AST");
        return false;
    }

    console.log("Evaluating node:", ast);

    if (ast.type === 'operand') {
        const cleanValue = ast.value.replace(/[()]/g, '').trim();
        const operandValue = data.hasOwnProperty(cleanValue) ? data[cleanValue] : isNaN(cleanValue) ? cleanValue : Number(cleanValue);

        console.log(`Operand value for ${cleanValue}:`, operandValue);
        return operandValue;
    }

    const leftValue = evaluateRule(ast.left, data);
    const rightValue = evaluateRule(ast.right, data);

    console.log(`Left value: ${leftValue}, Right value: ${rightValue}, Operator: ${ast.value}`);

    switch (ast.value) {
        case 'AND':
            return leftValue && rightValue;
        case 'OR':
            return leftValue || rightValue;
        case '>':
            return leftValue > rightValue;
        case '<':
            return leftValue < rightValue;
        case '=':
            return leftValue === rightValue;
        default:
            console.error(`Unknown operator: ${ast.value}`);
            return false;
    }
};



// Controller for creating a rule
exports.createRule = async (req, res) => {
    const { ruleString } = req.body;
    try {
        const ast = createRule(ruleString);
        const newRule = new Rule({ ruleString, ast });
        await newRule.save();
        res.json(newRule);
    } catch (error) {
        console.error("Error in createRule:", error);
        res.status(500).json({ message: "Error creating rule" });
    }
};

// Controller for combining multiple rules
exports.combineRules = async (req, res) => {
    const { rules } = req.body;
    try {
        const combinedAST = combineRules(rules);
        res.json(combinedAST);
    } catch (error) {
        console.error("Error in combineRules:", error);
        res.status(500).json({ message: "Error combining rules" });
    }
};

// Controller for evaluating a rule against data
exports.evaluateRule = async (req, res) => {
    const { ast, data } = req.body;

    try {
        const result = evaluateRule(ast, data);
        res.json({ result });
    } catch (error) {
        console.error("Error in evaluation:", error);
        res.status(500).json({ message: "Error during rule evaluation" });
    }
};
