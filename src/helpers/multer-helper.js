const multer = require("multer");
const path = require("path");
const { BASE_URL } = require("../config");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return file.fieldname == "blog_image"
      ? cb(null, `../public/blog-images`)
      : cb(null, `../public/destination-images`);
  },

  filename: (req, file, cb) => {
    let filetype = path.extname(file.originalname);

    if (
      filetype == ".png" ||
      ".jpg" ||
      ".jpeg" ||
      ".tif" ||
      ".tiff" ||
      ".gif" ||
      ".bmp" ||
      ".eps" ||
      ".raw" ||
      ".cr2" ||
      ".nef" ||
      ".orf" ||
      ".sr2" ||
      ".jfif"
    ) {
      if (!file) return cb("file must be required.");
      else {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${
          path.extname(file.originalname) == ""
            ? ".jpg"
            : path.extname(file.originalname)
        }`;

        cb(null, uniqueName);
      }
    } else cb("File format is not acceptable");
  },
});

const upload = multer({ storage, limits: { fileSize: 1000000 * 15 } }).fields([
  { name: "dest_image" },
  { name: "blog_image", maxCount: 1 },
  { name: "cover_image", maxCount: 1 },
]);

module.exports = upload;
