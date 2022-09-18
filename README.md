# Bootstrap compiler

This is a bootstrap compiler that can be used to compile to compiler written in the target language. You can write a compiler in the target language and compile it with this compiler, and create a brand new language

## How to use

1. Write a compiler in the target language
2. Compile it with this compiler
3. Run the compiled compiler

> You can learn more about this chicken-egg problem in [Wikipedia](https://en.wikipedia.org/wiki/Bootstrapping_(compilers)).
>
> To learn more about how to run this code, check [this](#how-to-work-with-this-compiler) section.

## What this compiler can do

The compiler is pretty basic, yet it is capable to do a lot of the hardwork. It can: 
* Add & subtract numbers
* Parse params and arguments of function calls
* Parse nested block statements and outputs the result in a tree structure, called Abstract Syntax Tree.
* Parse `import` and `import from` statements

> You can learn more about abstract syntax trees [here](https://en.wikipedia.org/wiki/Abstract_syntax_tree)

## How to extend this compiler

There are some steps to extend this compiler if you want to create your language.

1. In tokenizer (`tokenize` function, also called the lexer), you need to add the tokens that you want to use in your language. For example, if you want to use `namespace` as a keyword, you need to add it to the `tokens` array.
2. In parser (`parse` function), you need to add the rules for your language. Take the `namespace` example for instance, you can use the switch case statement at `parser.ts:181` to add your own rules, keyword etc.
3. Next up, you need edit the transform function (`transform` function) to transform the base syntax tree to an abstract syntax tree that your code generator will be able to understand.
4. Finally, you need to edit the code generator (`generate` function) to output the code to your source language, that the computers will be able to parse.

## How to work with this compiler

1. Clone the repo, I recommend using Github Desktop, it has awesome features.
2. Install the dependencies:
```bash
yarn install
```
3. Run the compiler. You can `ts-node` for this, or you can just use the build output.

On Darwin-like systems:
```bash
yarn compile:darwin && node src/parser
````

On Windows:
```bash
yarn compile:win && node src/parser
````

# Further work on this repo

I will be working on this repo to make it more powerful and more understandable. This code really does need a refactoring, but I won't be adding any new features, nor accepting extensions via pull requests.

## How to contribute

If you want to contribute, you can fork the repo and make a pull request. I will review it and merge it.

See the CONTRIBUTING.md file for more information.

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details
