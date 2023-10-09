const { BASE_URL } = require("../config");

require("dotenv").config();
const mv = require("mv"),
  fs = require("fs"),
  path = require("path"),
  fileHelpers = {
    deleteFile: (fileName) => {
      fileName.forEach((element) =>
        fs.unlink(element, (err) => {
          if (err) {
            console.log(err, "err in deleting file");
            return err;
          }
          console.log("File deleted!", element);
        })
      );
    },

    makeDir: (dirName) => {
      let data = new Promise((resolve, reject) => {
        fs.mkdir(path.join(`../public/destination-images`, dirName), (err) => {
          if (err) {
            reject(err);
          }
          resolve("Directory created successfully!");
        });
      });
      return data;
    },

    moveDest: ({ destToMove, id }) => {
      destToMove.forEach((v) => {
        var currentPath = path.join(`../public`, "destination-images", v.name);

        destinationPath = path.join(
          `../public/destination-images`,
          `${id}`,
          v.name
        );

        mv(currentPath, destinationPath, (err) => {
          if (err) {
            console.log(
              err,
              "error in moving file from destination folder to id folder"
            );
            return err;
          } else console.log("Successfully moved the file!");
        });
      });
    },
  };

module.exports = fileHelpers;
