const fs = require("fs");
const content = fs.readFileSync("frontend/src/api2/data.js", "utf8");
try {
  new Function(content);
  console.log("Syntax is valid");
} catch (e) {
  console.error(e);
}
