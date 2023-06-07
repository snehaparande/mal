const { pr_str } = require('./printer');
const { MalList, MalSymbol, MalNil, MalValue, MalString, MalVector, deepEqual, MalAtom } = require('./types');
const { Env } = require('./env');
const { read_str } = require('./reader');
const { readFileSync } = require('fs');



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
  return new MalString(args.map((str)=> pr_str(str, false)).join(''));
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
env.set(
  new MalSymbol('='), 
  (a, b) => a instanceof MalValue? a.equals(b) : deepEqual(a, b)
  );
env.set(new MalSymbol('<'), (a, b) => a < b);
env.set(new MalSymbol('<='), (a, b) => a <= b);
env.set(new MalSymbol('>'), (a, b) => a > b);
env.set(new MalSymbol('>='), (a, b) => a >= b);
env.set(new MalSymbol('list'), (...args) => new MalList(args));
env.set(new MalSymbol('vec'), (args) => new MalVector(args.value));
env.set(new MalSymbol('list?'), (arg) => arg instanceof MalList);
env.set(new MalSymbol('count'), count);
env.set(new MalSymbol('empty?'), (arg) => arg.value.length === 0);
env.set(new MalSymbol('read-string'), (string) => read_str(string.value));
env.set(new MalSymbol('slurp'), (file) => {
  return new MalString(readFileSync(file.value, 'utf-8'));
});
env.set(new MalSymbol('atom'), (arg) => new MalAtom(arg));
env.set(new MalSymbol('atom?'), (arg) => arg instanceof MalAtom);
env.set(new MalSymbol('deref'), (arg) => arg.value);
env.set(new MalSymbol('reset!'), (atom, value) => atom.reset(value));
env.set(new MalSymbol('swap!'), (atom, fn, ...args) => atom.swap(fn, args));
env.set(new MalSymbol('cons'), (value, list) => new MalList([value, ...list.value]));
env.set(new MalSymbol('concat'), 
(...lists) => new MalList(lists.flatMap(a => a.value)));

module.exports = {env};
