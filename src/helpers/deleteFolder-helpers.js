let fs = require("fs");
let deleteFolder = (id) => {
  fs.rm(id, { recursive: true, force: true }, (data, err) => {
    if (err) {
      console.log("error in deleting folder");
    } else {
      console.log("deleted destination folder");
    }
  });
};

module.exports = { deleteFolder };
