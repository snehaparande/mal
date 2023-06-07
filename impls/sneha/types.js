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

class MalValue {
  constructor(value) {
    this.value = value;
  }
  
  toString(){
    return this.value.toString();
  }
};

class MalSymbol extends MalValue{
  constructor(value){
    super(value);
  }

  equals(item){
    return item instanceof MalSymbol && deepEqual(item.value, this.value);
  }

}
class MalKeyword extends MalValue{
  constructor(value){
    super(value);
  }

  equals(item){
    return item instanceof MalKeyword && deepEqual(item.value, this.value);
  }
}
class MalString extends MalValue{
  constructor(value){
    super(value);
  }

  equals(item){
    return item instanceof MalString && deepEqual(item.value, this.value);
  }

  #toPrintedRepresentation(str) {
    return str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\"/g, '\\\"');
  }

  toString(print_readably = true){
    if (print_readably) {
      return '"' + this.#toPrintedRepresentation(this.value) + '"'
    }
    return this.value.toString();
  }

}

class   MalSequence extends MalValue {
  isEmpty(){
    return this.value.length === 0;
  }

  nth(n){
    if(n >= this.value.length) throw 'index out of range';
    return this.value[n];
  }

  first(){
    if (this.value.length === 0) return new MalNil();
    return this.value[0];
  }

  rest(){
    return new MalList(this.value.slice(1));
  }
}

class MalList extends MalSequence{
  constructor(value){
    super(value);
  }

  equals(item){
    return item instanceof MalList && deepEqual(item.value, this.value);
  }

  toString(){
    return '(' + this.value.map(x => x.toString()).join(' ') + ')';
  }
}

class MalVector extends MalSequence{
  constructor(value){
    super(value);
  }

  equals(item){
    return item instanceof MalVector && deepEqual(item.value, this.value);
  }

  toString(){
    return '[' + this.value.map(x => x.toString()).join(' ') + ']';
  }
}
class MalHashmap extends MalValue{
  constructor(value){
    super(value);
  }

  equals(item){
    return item instanceof MalHashmap && deepEqual(item.value, this.value);
  }

  toString(){
    return '{' + this.value.map(x => x.toString()).join(' ') + '}';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  equals(item){
    return item instanceof MalNil && deepEqual(item.value, this.value);
  }

  toString(){
    return 'nil';
  }

  first(){
    return new MalNil();
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  equals(item){
    return item instanceof MalAtom && deepEqual(item.value, this.value);
  }

  toString(){
    return "(atom " + this.value.toString() + ")";
  }

  reset(newValue){
    this.value = newValue;
    return this.value;
  }

  swap(fun, args){
    this.value = fun.apply(null, [this.value, ...args]);
    return this.value;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn, isMacro) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
    this.isMacro = isMacro;
  }

  apply(context, args){
    return this.fn.apply(context, args);
  }

  equals(item){
    return item instanceof MalFunction && deepEqual(item.value, this.value);
  }

  toString(){
    return '#<function>';
  }
}

module.exports = {deepEqual, MalValue, MalList, MalSymbol, MalVector, MalNil, MalHashmap, MalSequence, MalKeyword, MalString, MalFunction, MalAtom};
