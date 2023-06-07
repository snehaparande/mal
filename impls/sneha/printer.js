const { MalValue } = require("./types");

const pr_str = (malValue, print_readably = false) => {
  const str = malValue.toString();
  if (typeof malValue === "function") {
    return "#<function>";
  }
  
  return str;

};

module.exports = {pr_str}