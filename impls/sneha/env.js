const { MalList } = require("./types");

class Env {
  #outer
  constructor(outer) {
    this.#outer = outer;
    this.data = {};
  }
 
  static createEnv(outer, binds, exprs){
    const env = new Env(outer);
    for (let i = 0; i < binds.length; i++) {
      if (binds[i].value === '&') {
        env.set(binds[i+1], new MalList(exprs.slice(i)));
        return env;
      }
      env.set(binds[i], exprs[i]);
    }
    return env;
  }

  set(symbol, malValue){
    this.data[symbol.value] = malValue;
  }

  find(symbol){
    if (this.data[symbol.value] !== undefined) {
      return this;
    }
    if (this.#outer) {
     return this.#outer.find(symbol); 
    }
  }

  get(symbol){
    const env = this.find(symbol);
    if (!env) {
      throw `${symbol.value} not found`;
    }

    return env.data[symbol.value];
  }
}

module.exports = {Env};