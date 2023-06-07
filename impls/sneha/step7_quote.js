const readline = require('readline');
const {read_str} = require('./reader');
const {pr_str} = require('./printer');
const { MalList, MalSymbol, MalVector, MalHashmap, MalNil, MalFunction, MalSequence } = require('./types');
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

const handleLet = (env, bindings, asts) => {
    const let_env = new Env(env);
    set_bindings_in_env(bindings, let_env);
    const doForms = new MalList([new MalSymbol('do'), ...asts]);
    return [doForms, let_env];
};

const handleDo = (env, asts) => {
  asts.slice(0, -1).forEach((exp) => EVAL(exp, env));
  return asts[asts.length - 1];
};

const handleIf = (env, condition, true_block, false_block) => {
  const predicate = EVAL(condition, env);
      if (predicate === false || predicate instanceof MalNil) {
        if (false_block) {
          return false_block;
        }
        return new MalNil();
      }
      return true_block;
};

const handleFn = (outer, binds, asts) => {
  const doAst = new MalList([new MalSymbol('do'), ...asts]);
  const fn = (...exps) => {
    const env = Env.createEnv(outer, binds.value, exps);
    return EVAL(doAst, env);
  }

  return new MalFunction(doAst, binds.value, outer, fn);
};

const quasiquote = (ast, env) => {
  if (ast instanceof MalSequence && ast.value.length > 0 && ast.value[0].value === 'unquote') {
    return ast.value[1];
  }
  
  if (ast instanceof MalSequence) {
    let result = new MalList([]);
    
    for (let i = ast.value.length - 1; i >= 0; i--) {
      const element = ast.value[i];

      if (element instanceof MalSequence &&
        element.value.length > 0 &&
        element.value[0].value === 'splice-unquote') {
        result = new MalList(
          [new MalSymbol('concat'),
           element.value[1],
           result]);
      }else{
        result = new MalList(
          [new MalSymbol('cons'),
           quasiquote(element, env),
           result]);
      }
    }

    if (ast instanceof MalList) return result;
    return new MalList([new MalSymbol('vec'), result]); 
  }

  if (ast instanceof MalHashmap || ast instanceof MalSymbol) {
    return new MalList([new MalSymbol('quote'), ast])
  }else{
    return ast;
  }

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
        [ast, env] = handleLet(env, ast.value[1], ast.value.slice(2));
        break;
      case 'do':
        ast = handleDo(env, ast.value.slice(1));
        break;
        case 'if': 
        ast = handleIf(env, ast.value[1], ast.value[2], ast.value[3])
        break;
      case 'fn*': 
        ast = handleFn(env, ast.value[1], ast.value.slice(2));
        break;
      case 'quote': 
        return ast.value[1];
      case 'quasiquoteexpand': 
        return quasiquote(ast.value[1], env);
      case 'quasiquote': 
        ast = quasiquote(ast.value[1], env);
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
const createRepleEnv = () => {
  rep("(def! not (fn* (a) (if a false true)))"); 
  env.set(new MalSymbol('eval'), (ast)=> EVAL(ast, env));
  rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "nil)")))))')
};

createRepleEnv();

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
