/*
 * Huge shoutout to @jamiebuilds, https://github.com/jamiebuilds/the-super-tiny-compiler
 * His work made this base compiler possible
 */

const whitespaceRE = new RegExp(/\s/);
const numbersRE = new RegExp(/[0-9]/);

function tokenize(input: string): Array<Token> {
	let pos: number = 0;
	let tokens: Array<Token> = [];

	while (pos < input.length) {
		let char = input.charAt(pos);

		if (char === "{") {
			tokens.push({
				type: "brace",
				value: char,
			});

			pos++;
			continue;
		}

		if (char === "}") {
			tokens.push({
				type: "brace",
				value: char,
			});
		}

		if (char === "(") {
			tokens.push({
				type: "paren",
				value: "(",
			});

			pos++;
			continue;
		}

		if (char === ")") {
			tokens.push({
				type: "paren",
				value: ")",
			});

			pos++;
			continue;
		}

		if (whitespaceRE.test(char)) {
			pos++;
			continue;
		}

		if (numbersRE.test(char)) {
			let value = "";

			while (numbersRE.test(char)) {
				value += char;
				char = input.charAt(++pos);
			}

			tokens.push({
				type: "number",
				value,
			});
			continue;
		}

		if (char === '"') {
			let value = "";
			char = input.charAt(++pos);

			while (char !== '"') {
				value += char;
				char = input.charAt(++pos);
			}
			char = input.charAt(++pos);

			tokens.push({ type: "string", value });
			continue;
		}

		if (char === "=") {
			tokens.push({
				type: "=",
				value: "=",
			});

			pos++;
			continue;
		}

		if (char === "+") {
			tokens.push({
				type: "+",
				value: "+",
			});

			pos++;
			continue;
		}

		if (char === "-") {
			tokens.push({
				type: "-",
				value: "-",
			});

			pos++;
			continue;
		}

		let LETTERS = /[a-z]/i;
		if (LETTERS.test(char)) {
			let value = "";

			while (LETTERS.test(char)) {
				value += char;
				char = input.charAt(++pos);
			}

			const accessors: Array<string> = [];
			if (char === ".") {
				char = input.charAt(++pos);

				function scanAccessor() {
					let accessor: string = "";
					while (LETTERS.test(char)) {
						accessor += char;
						char = input.charAt(++pos);
					}
					accessors.push(accessor);
					if (char === ".") {
						char = input.charAt(++pos);
						scanAccessor();
					}
				}

				scanAccessor();
			}

			tokens.push({
				type: "name",
				value,
				...(accessors && accessors.length > 0 && { accessors }),
			});

			continue;
		}

		pos++;
	}

	return tokens;
}

function parse(tokens: Array<Token>): ProgramNode {
	let pos = 0;

	function walk(): any {
		let token = tokens.at(pos);
		if (!token) return;

		if (token.type === "number") {
			pos++;
			return {
				type: "NumberLiteral",
				value: token.value,
			};
		}

		if (token.type === "string") {
			pos++;
			return {
				type: "StringLiteral",
				value: token.value,
			};
		}

		if (token.type === "name") {
			pos++;
			switch (token.value) {
				case "import":
					const source = { from: "" };
					if (tokens.at(pos + 1)?.value === "from") {
						// @ts-ignore
						source["from"] = tokens.at(pos + 2).value;
					}
					pos += 2;
					console.log(source);
					return {
						type: "ImportStatement",
						value: walk().value,
						...(source && source.from && { from: source.from }),
					};
				default:
					return {
						type: "Keyword",
						value: token.value,
						...(token.accessors &&
							token.accessors.length > 0 && { accessors: token.accessors }),
					};
			}
		}

		if (token.type === "paren" && token.value === "(") {
			token = tokens.at(++pos);

			let node = {
				type: "CallExpression",
				name: "FunctionCall",
				params: [],
			} as CallNode;

			while (
				token?.type !== "paren" ||
				(token?.type === "paren" && token?.value !== ")")
			) {
				node.params.push(walk());
				token = tokens.at(pos);
			}

			pos++;

			return node;
		}

		if (token.type === "brace" && token.value === "{") {
			function findClosingBrace(index: number = 0) {
				let openBraces = 0;
				let startIndex = index;
				for (; index < tokens.length; index++) {
					if (tokens.at(index)?.value === "{") {
						openBraces === 0 && (startIndex = index);
						openBraces++;
					} else if (tokens.at(index)?.value === "}") {
						openBraces--;
						if (openBraces === 0) return { index, startIndex };
					}
				}
				return { index: -1, startIndex: -1 };
			}

			const closingBrace = findClosingBrace(pos - 1);
			if (closingBrace.index === -1) return;

			token = tokens.at(++pos);

			let node = {
				type: "BlockStatement",
				name: "BlockStatement",
				body: [],
			} as BlockStatement;

			while (pos < closingBrace.index) {
				node.body.push(walk());
				token = tokens.at(pos);
			}

			return node;
		}

		if (token?.type === "=") {
			token = tokens.at(++pos);
			return {
				type: "Assignment",
				value: "=",
			};
		}

		if (token?.type === "+") {
			token = tokens.at(++pos);
			return {
				type: "SumOperator",
				value: "+",
			};
		}

		if (token?.type === "-") {
			token = tokens.at(++pos);
			return {
				type: "SubOperator",
				value: "-",
			};
		}

		pos++;

		return "abc";
	}

	const ast = {
		type: "Program",
		body: [],
	} as ProgramNode;

	while (pos < tokens.length) {
		ast.body.push(walk());
	}

	return ast;
}

function traverse(ast: ProgramNode, visitor: any) {
	function traverseArray(array: any, parent: any) {
		array.forEach((child: any) => {
			traverseNode(child, parent);
		});
	}

	function traverseNode(node: any, parent: any) {
		const methods = visitor[node.type];

		if (methods && methods.enter) {
			methods.enter(node, parent);
		}

		switch (node.type) {
			case "Program":
				traverseArray(node.body, node);
				break;
			case "CallExpression":
				traverseArray(node.params, node);
				break;
			case "NumberLiteral":
			case "StringLiteral":
				break;
		}

		if (methods && methods.exit) {
			methods.exit(node, parent);
		}
	}

	traverseNode(ast, null);
}

function transform(ast: ProgramNode) {
	let newAst = {
		type: "Program",
		body: [],
	} as ProgramNode;

	ast._context = newAst.body;

	traverse(ast, {
		NumberLiteral: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "NumberLiteral",
					value: node.value,
				});
			},
		},

		StringLiteral: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "StringLiteral",
					value: node.value,
				});
			},
		},

		CallExpression: {
			enter(node: any, parent: any) {
				let expression = {
					type: "CallExpression",
					callee: {
						type: "Identifier",
						name: node.name,
					},
					arguments: [],
				} as ExpressionStatementNode;

				node._context = expression.arguments;

				if (parent.type !== "CallExpression") {
					expression = {
						type: "ExpressionStatement",
						expression: expression,
					} as ExpressionStatementNode;
				}

				parent._context.push(expression);
			},
		},

		Keyword: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "Identifier",
					name: node.value,
					accessors: node.accessors,
				});
			},
		},

		Assignment: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "Assignment",
					value: node.value,
				});
			},
		},

		BlockStatement: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "BlockStatement",
					body: node.body,
				});
			},
		},

		SumOperator: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "SumOperator",
					value: node.value,
				});
			},
		},

		SubOperator: {
			enter(node: any, parent: any) {
				parent._context.push({
					type: "SubOperator",
					value: node.value,
				});
			},
		},
	});

	return newAst;
}

function codeGenerator(node: any): any {
	switch (node.type) {
		case "Program":
			return node.body.map(codeGenerator).join(" ");

		case "ExpressionStatement":
			return codeGenerator(node.expression) + ";";

		case "CallExpression":
			console.log(node);
			return (
				"(" +
				((node.params && node.params.map(codeGenerator).join(", ")) ||
					(node.arguments && node.arguments.map(codeGenerator).join(", "))) +
				");\n"
			);

		case "Identifier":
			return (
				node.name +
				((node.accessors && node.accessors.length === 0) || !node.accessors
					? ""
					: "." + node.accessors.join("."))
			);

		case "NumberLiteral":
			return node.value;

		case "StringLiteral":
			return '"' + node.value + '"';

		case "Assignment":
			return node.value;

		case "BlockStatement":
			return "{" + node.body.map(codeGenerator).join(" ") + "}";

		case "SumOperator":
			return node.value;

		case "SubOperator":
			return node.value;

		case "Keyword":
			switch (node.value) {
				case "fn":
					return "function";
				default:
					return node.value;
			}

		default:
			return "";
	}
}

export function compiler(input: string) {
	const tokens = tokenize(input);
	const ast = parse(tokens);
	const newAst = transform(ast);
	const output = codeGenerator(newAst);
	console.log(output);
	return output;
}

interface Token {
	type?: TokenType | OperatorType | TraverserTypes;
	value?: string;
	accessors?: Array<string>;
}

interface ProgramNode extends Token {
	type: "Program";
	body: Array<any>;
	_context?: Array<any>;
}

interface CallNode extends Token {
	type: "CallExpression";
	name: string;
	params: Array<any>;
}

interface BlockStatement extends Token {
	type: "BlockStatement";
	body: Array<any>;
}

interface ExpressionStatementNode extends Token {
	type?: "ExpressionStatement" | "CallExpression";
	expression?: any;
	callee?: any;
	arguments?: Array<Token>;
}

type TokenType = "paren" | "number" | "string" | "name" | "brace";

type OperatorType =
	| "="
	| "+"
	| "-"
	| "*"
	| "/"
	| "%"
	| "=="
	| "!="
	| ">"
	| "<"
	| ">="
	| "<=";

type TraverserTypes =
	| "CallExpression"
	| "NumberLiteral"
	| "StringLiteral"
	| "Keyword"
	| "Program"
	| "ExpressionStatement"
	| "BlockStatement";
