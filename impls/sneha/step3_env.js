const readline = require('readline');
const {read_str} = require('./reader');
const {pr_str} = require('./printer');
const { MalList, MalSymbol, MalVector, MalHashmap, MalNil } = require('./types');
const { Env } = require('./env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const _env = {
  '+': (...args) => args.reduce((a, b)=>  (a + b)),
  '*': (...args) => args.reduce((a, b)=>  (a * b)),
  '-': (...args) => args.reduce((a, b)=>  (a - b)),
  '/': (...args) => args.reduce((a, b)=>  (a / b)),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }
  
  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }
  
  if (ast instanceof MalHashmap) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalHashmap(newAst);
  }

  return ast;
};

const READ = (str) => read_str(str);

const set_bindings_in_env = (bindings, let_env) => {
  for (let i = 0; i < bindings.value.length; i = i + 2) {
    const binding = bindings.value[i];
    const value = EVAL(bindings.value[i + 1], let_env);
    let_env.set(binding, value);
  }
}

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  
  if(ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case 'let*':
      const let_env = new Env(env);
      const bindings = ast.value[1];
      set_bindings_in_env(bindings, let_env);

      if (ast.value[2]) {
        return EVAL(ast.value[2], let_env);
      }
      return new MalNil();
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (malValue) => pr_str(malValue);

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce((a, b)=>  (a + b)));
env.set(new MalSymbol('-'), (...args) => args.reduce((a, b)=>  (a - b)));
env.set(new MalSymbol('*'), (...args) => args.reduce((a, b)=>  (a * b)));
env.set(new MalSymbol('/'), (...args) => args.reduce((a, b)=>  (a / b)));

const rep = str => PRINT(EVAL(READ(str), env));

const repl = () => {
rl.question( 'user> ', line=> {
  try {
    console.log(rep(line));
  } catch (error) {
    console.log(error);
  }
  repl();
});
};

repl();
