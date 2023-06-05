const readline = require('readline');
const {read_str} = require('./reader');
const {pr_str} = require('./printer');
const { MalList, MalSymbol, MalVector, MalHashmap, MalNil, MalFunction } = require('./types');
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

const handle_let = (env, bindings, asts) => {
    const let_env = new Env(env);
    set_bindings_in_env(bindings, let_env);
    const doForms = new MalList([new MalSymbol('do'), ...asts]);
    return [doForms, let_env];
};

const handle_do = (env, asts) => {
  asts.slice(0, -1).forEach((exp) => EVAL(exp, env));
  return asts[asts.length - 1];
};

const handle_if = (env, condition, true_block, false_block) => {
  const predicate = EVAL(condition, env);
      if (predicate === false || predicate instanceof MalNil) {
        if (false_block) {
          return false_block;
        }
        return new MalNil();
      }
      return true_block;
};

const handle_fn = (outer, binds, asts) => {
  const doAst = new MalList([new MalSymbol('do'), ...asts]);
  return new MalFunction(doAst, binds.value, outer);
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) return eval_ast(ast, env);
    
    if(ast.isEmpty()) return ast;
  
    switch (ast.value[0].value) {
      case 'def!':
        env.set(ast.value[1], EVAL(ast.value[2], env));
        return env.get(ast.value[1]);
      case 'let*':
        [ast, env] = handle_let(env, ast.value[1], ast.value.slice(2));
        break;
      case 'do':
        ast = handle_do(env, ast.value.slice(1));
        break;
        case 'if': 
        ast = handle_if(env, ast.value[1], ast.value[2], ast.value[3])
        break;
      case 'fn*': 
        ast = handle_fn(env, ast.value[1], ast.value.slice(2));
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          env = Env.createEnv(fn.env, fn.binds, args);
          ast = fn.value;
        } else {
          return fn.apply(null, args);
        }
    }
  }
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
