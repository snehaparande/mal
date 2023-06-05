const pr_str = (malValue, print_readably = false) => {
  const str = malValue.toString();
  
  if (typeof malValue === "function") {
    return "#<function>";
  }
  if (print_readably) {
    const newStr = str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\"/g, '\\\"');
    return '"' + newStr + '"';
  }
  return str;

};

module.exports = {pr_str}