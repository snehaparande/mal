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
}
class MalKeyword extends MalValue{
  constructor(value){
    super(value);
  }
}
class MalString extends MalValue{
  constructor(value){
    super(value);
  }
}

class MalList extends MalValue{
  constructor(value){
    super(value);
  }

  toString(){
    return '(' + this.value.map(x => x.toString()).join(' ') + ')';
  }

  isEmpty(){
    return this.value.length === 0;
  }
}

class MalVector extends MalValue{
  constructor(value){
    super(value);
  }

  toString(){
    return '[' + this.value.map(x => x.toString()).join(' ') + ']';
  }
}
class MalHashmap extends MalValue{
  constructor(value){
    super(value);
  }

  toString(){
    return '{' + this.value.map(x => x.toString()).join(' ') + '}';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  toString(){
    return 'nil';
  }
}

module.exports = {MalValue, MalList, MalSymbol, MalVector, MalNil, MalHashmap, MalKeyword, MalString};
