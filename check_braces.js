const fs = require("fs");
const content = fs.readFileSync("frontend/src/api2/data.js", "utf8");
let braces = 0;
let parens = 0;
let brackets = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === "{") braces++;
  if (content[i] === "}") braces--;
  if (content[i] === "(") parens++;
  if (content[i] === ")") parens--;
  if (content[i] === "[") brackets++;
  if (content[i] === "]") brackets--;
}
console.log(`Braces: ${braces}, Parens: ${parens}, Brackets: ${brackets}`);
if (braces !== 0 || parens !== 0 || brackets !== 0) {
  console.log("UNBALANCED!");
} else {
  console.log("Balanced");
}
