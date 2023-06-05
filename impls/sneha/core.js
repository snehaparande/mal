const { pr_str } = require('./printer');
const { MalList, MalSymbol, MalNil, MalValue } = require('./types');
const { Env } = require('./env');
const { read_str } = require('./reader');

const deepEqual = (arg1, arg2) => {
  const val1 = arg1 instanceof MalValue ? arg1.value : arg1;
  const val2 = arg2 instanceof MalValue ? arg2.value : arg2;

  if (!Array.isArray(val1) || !Array.isArray(val2)) {
    return val1 === val2;
  }

  if (val1.length !== val2.length) {
    return false;
  }

  let i = 0;
  while (i <= val1.length) {
    if (!deepEqual(val1[i], val2[i])) {
      return false;
    }
    i = i+1;
  }

  return true;
};

const prn = (...args) => {
  const line = args.map((str)=> pr_str(str, true)).join(' ');
  console.log(line);
  return new MalNil();
}

const pr_string = (...args) => {
  const line = args.map((str)=> pr_str(str, true)).join(' ');
  return line;
};

const str_fn = (...args) => {
  return args.map((str)=> pr_str(str, false)).join('');
}

const println = (...args) => {
  const line = args.map((str)=> pr_str(str, false)).join('');
  console.log(line);
  return new MalNil();
}

const count = (arg) => {
  if (arg instanceof MalValue) {
    return arg.value ? arg.value.length : 0;
  }
  return 0;
};

const env = new Env();

env.set(new MalSymbol('+'), (...args) => args.reduce((a, b) => (a + b)));
env.set(new MalSymbol('-'), (...args) => args.reduce((a, b) => (a - b)));
env.set(new MalSymbol('*'), (...args) => args.reduce((a, b) => (a * b)));
env.set(new MalSymbol('/'), (...args) => args.reduce((a, b) => (a / b)));
env.set(new MalSymbol('prn'), prn);
env.set(new MalSymbol('pr-str'), pr_string);
env.set(new MalSymbol('println'), println);
env.set(new MalSymbol('str'), str_fn);
env.set(new MalSymbol('='), deepEqual);
env.set(new MalSymbol('<'), (a, b) => a < b);
env.set(new MalSymbol('<='), (a, b) => a <= b);
env.set(new MalSymbol('>'), (a, b) => a > b);
env.set(new MalSymbol('>='), (a, b) => a >= b);
env.set(new MalSymbol('list'), (...args) => new MalList(args));
env.set(new MalSymbol('list?'), (arg) => arg instanceof MalList);
env.set(new MalSymbol('count'), count);
env.set(new MalSymbol('empty?'), (arg) => arg.value.length === 0);
env.set(new MalSymbol('read-string'), (string) => read_str(string.value));

module.exports = {env};
