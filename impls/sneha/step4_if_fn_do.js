const readline = require('readline');
const {read_str} = require('./reader');
const {pr_str} = require('./printer');
const { MalList, MalSymbol, MalVector, MalHashmap, MalNil } = require('./types');
const { Env } = require('./env');
const { env } = require("./core");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

const handle_let = (env, bindings, exp) => {
    const let_env = new Env(env);
    set_bindings_in_env(bindings, let_env);
    if (exp) {
      return EVAL(exp, let_env);
    }
    return new MalNil();
};

const handle_do = (env, exps) => {
  const res = exps.reduce((_, exp) => EVAL(exp, env), new MalNil());
  return res;
};

const handle_if = (env, condition, true_block, false_block) => {
  const cond_res = EVAL(condition, env);
      if (cond_res === false || cond_res instanceof MalNil) {
        if (false_block !== undefined) {
          return EVAL(false_block, env);
        }
        return new MalNil();
      }
      return EVAL(true_block, env);
};

const handle_fn = (outer, binds, asts) => {
  return (...exps) => {
    const env = Env.createEnv(outer, binds.value, exps);
    return handle_do(env, asts);
  }
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  
  if(ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case 'let*':
      return handle_let(env, ast.value[1], ast.value[2]);
    case 'do':
      return handle_do(env, ast.value.slice(1));
    case 'if': 
      return handle_if(env, ast.value[1], ast.value[2], ast.value[3])
    case 'fn*': 
      return handle_fn(env, ast.value[1], ast.value.slice(2));
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (malValue) => pr_str(malValue);

const rep = str => PRINT(EVAL(READ(str), env));

rep("(def! not (fn* (a) (if a false true)))");

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
