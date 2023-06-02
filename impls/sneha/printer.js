const pr_str = (malValue, print_readably) => {
  const str = malValue.toString();
  if (print_readably) {
    str.replaceAll(/\n/g, '\\n');
  }
  return str;

};

module.exports = {pr_str}