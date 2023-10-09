const bcrypt = require("bcrypt"),
  asyncLoop = require("node-async-loop"),
  moment = require("moment"),
  {
    emailHelper,
    sign,
    forgotPassword,
    stripeHelper,
    commonHelpers,
    deleteFile,
  } = require("../helpers"),
  { moveDest } = require("../helpers/file-helper"),
  {
    adminModel,
    destinationModel,
    vendorModel,
    userModel,
    blogModel,
    subDetailsModel,
    subPayDetailsModel,
    cardModel,
    letterModel,
  } = require("../models"),
  { loginValidation } = require("../JoiValidations/login"),
  { adminValidation } = require("../JoiValidations/admin");
const mongoose = require("mongoose");
const { deleteFolder } = require("../helpers/deleteFolder-helpers");
const upload = require("../helpers/multer-helper");
const { BASE_URL } = require("../config/index");
const { IMAGEURL } = require("../config/index");

adminController = {
  login: async (req, res) => {
    try {
      const { error } = loginValidation.validate(req.body, {
        errors: {
          label: "key",
          wrap: { label: false },
        },
        abortEarly: false,
      });

      if (error) {
        return res.json({
          status: Boolean(false),
          message: error.details[0].message,
          // message: error.message,
        });
      }

      var { email, password } = req.body;
      date = new Date();
      temp =
        /^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([\.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i.test(
          email
        );
      if (temp) {
        const adminFound = await adminModel.findOne({ email });
        if (adminFound) {
          hash = await bcrypt.compare(password, adminFound.password);
          if (hash) {
            (token = await sign(email, password, date)),
              (data = {
                email: adminFound.email,
                token: token,
                role: adminFound.role,
              });
            return res.json({
              status: Boolean(true),
              message: "Login Successfull",
              data: data,
            });
          } else {
            return res.json({
              status: Boolean(false),
              message: "Incorrect password",
            });
          }
        } else return commonHelpers.invalidCredentials(res);
      } else
        return res.json({
          status: Boolean(false),
          message: "Please enter valid email id",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  signUp: async (req, res) => {
    try {
      const { error } = adminValidation.validate(req.body, {
        errors: {
          label: "key",
          wrap: { label: false },
        },
        abortEarly: false,
      });

      if (error) {
        return res.json({
          status: Boolean(false),
          message: error.details[0].message,
          // message: error.message,
        });
      }

      var { name, email, password } = req.body,
        email = email.replace(/\s/g, "");
      temp =
        /^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([\.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i.test(
          email
        );
      if (temp) {
        const emailFound = await adminModel.find({ email: email }),
          date = new Date();
        if (emailFound.length > 0)
          return res.json({
            status: Boolean(false),
            message: "Admin already exists with this email",
          });
        else if (password.length >= 8) {
          const token = await sign(email, password, date),
            hash = await bcrypt.hash(password, 8),
            admin = new adminModel({
              name,
              email,
              password: hash,
            }),
            saveData = await admin.save();
          return res.json({
            status: true,
            message: "Admin registered successfully",
            data: { name, email, token, role: admin.role },
          });
        } else
          return res.json({
            status: Boolean(false),
            message: "Minimum password length must be 8",
          });
      } else
        return res.json({
          status: Boolean(false),
          message: "Please enter valid email id",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  editBlog: async (req, res) => {
    try {
      upload(req, res, async (errors) => {
        //here id is blog id
        let { heading, name, code, description, id } = req.body;
        if (!mongoose.isValidObjectId(id)) {
          // If the ID is invalid, throw an error
          return res.json({
            status: false,
            message: "Invalid Id",
          });
        }

        let obj = {};
        obj.nearbyLocation = {};

        if (heading) {
          obj.heading = heading;
        }
        if (name) {
          obj.nearbyLocation.name = name;
        }
        if (code) {
          obj.nearbyLocation.code = code;
        }
        if (description) {
          obj.description = description;
        }

        let findBlog = await blogModel.findOne({ _id: id });

        if (findBlog) {
          if (req.files.blog_image == undefined) {
            let updateBlog = await blogModel.updateOne({ _id: id }, obj);
            console.log("updating data without image");
            return res.json({
              status: true,
              message: "successfully updated data",
              data: updateBlog,
            });
          } else {
            let fileName = req.files.blog_image[0].filename;

            let updatedObject = {
              ...obj,
              blogImage: {
                name: fileName,
                imageURL: `${BASE_URL}/blog-images/${fileName}`,
              },
            };

            console.log("updating blog with image");

            let updateBlog = await blogModel.updateOne(
              { _id: id },
              updatedObject
            );

            let deleteFileName = findBlog.blogImage.name;

            deleteFile([`../public/blog-images/${deleteFileName}`]);

            return res.json({
              status: true,
              message: "sucessfully updated data with file",
              data: updateBlog,
            });
          }
        } else {
          return res.json({
            status: false,
            message: "No blog found with this id",
          });
        }
      });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  deleteBlog: async (req, res) => {
    try {
      let blogDetails = await blogModel.find({ _id: req.body.blogData });

      let addFiles = [];
      if (blogDetails) {
        const deleteBlog = await blogModel.deleteMany({
          _id: { $in: req.body.blogData },
        });

        blogDetails.forEach((v) => {
          addFiles.push(`../public/blog-images/${v.blogImage.name}`);
        });

        deleteFile(addFiles);

        if (deleteBlog.deletedCount > 0)
          return res.json({
            status: Boolean(true),
            message: "Blog(s) successfully deleted",
            data: deleteBlog,
          });
        else
          return res.json({
            status: Boolean(false),
            message: "Blog(s) not found",
          });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getBlogs: async (req, res) => {
    try {
      const { pageNo, rows } = req.body.blogData;
      console.log(req.query.search, "search");

      var blog = await blogModel.find({}).sort({ createdAt: -1 }),
        blogs = blog.filter((v, i) => {
          if (
            v.heading
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.description
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.nearbyLocation.name
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            (v.nearbyLocation.code || "")
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.datePosted
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.totalReads == req.query.search ||
            (v.userEmail != null &&
              v.userEmail
                .toLowerCase()
                .includes(`${req.query.search}`.toLowerCase())) ||
            (v.vendorMail != null &&
              v.vendorMail
                .toLowerCase()
                .includes(`${req.query.search}`.toLowerCase()))
          ) {
            return v;
          }
        }),
        temp = [];
      asyncLoop(
        blogs,
        async (val, next) => {
          if (
            val?.vendorMail !== "" &&
            val?.vendorMail != null &&
            val?.userEmail == null
          ) {
            ////
            var blogImage = {},
              blogImage = {
                name: val.blogImage.name,
                imageURL: `${IMAGEURL}/blog-images/${val.blogImage.name}`,
              };

            var name = await vendorModel?.findOne({ email: val.vendorMail });
            if (name?.name != null && name != null) {
              name = name.name;
              temp.push({
                ...val._doc,
                name,
                email: val.vendorMail,
                blogBy: "Vendor",
                blogImage,
              });
            }
          }
          if (
            val?.uesrEmail !== "" &&
            val?.userEmail &&
            val?.vendorMail == null
          ) {
            /////
            var blogImage = {};
            blogImage = {
              name: val.blogImage.name,
              imageURL: `${IMAGEURL}/blog-images/${val.blogImage.name}`,
            };
            var name = await userModel?.findOne({ email: val.userEmail });
            if (name?.name != null && name != null) {
              name = name.name;
              temp.push({
                ...val._doc,
                name,
                email: val.userEmail,
                blogBy: "User",
                blogImage,
              });
            }
          }
          next();
        },
        (error) => {
          if (error) return commonHelpers.somethingWentWrong(error, res);
          totalLength = temp.length;
          if (temp && temp.length > 0) {
            temp = temp.splice((pageNo - 1) * rows, rows);
            return res.json({
              status: Boolean(true),
              message: "Blog details",
              totalLength,
              // length: temp.length,
              data: temp,
            });
          } else
            return res.json({
              status: Boolean(false),
              message: "No blogs to show",
            });
        }
      );
    } catch (error) {
      console.log(error.message);
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getSingleBlog: async (req, res) => {
    try {
      let id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }
      let getBlog = await blogModel.findOne({ _id: id });
      getBlog.blogImage.imageURL = `${IMAGEURL}/blog-images/${getBlog.blogImage.name}`;

      if (getBlog) {
        return res.json({
          status: Boolean(true),
          message: "Blog detail",
          data: getBlog,
        });
      } else {
        return res.json({ status: Boolean(false), message: "No blog found" });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getSingleDestination: async (req, res) => {
    try {
      let id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }
      let getDestination = await destinationModel.findOne({ _id: id });
      var images = [],
        coverImage = {};
      if (getDestination) {
        coverImage = {
          name: getDestination.coverImage.name,
          imageURL: `${IMAGEURL}/destination-images/${getDestination._id}/${getDestination.coverImage.name}`,
        };
        getDestination.images.forEach((value, index) => {
          images.push({
            imageURL: `${IMAGEURL}/destination-images/${getDestination._id}/${value.name}`,
            name: value.name,
          });
          if (index == getDestination.images.length - 1)
            return res.json({
              status: Boolean(true),
              message: "Destination details",
              data: { ...getDestination._doc, coverImage, images },
            });
        });
      } else {
        return res.json({
          status: Boolean(false),
          message: "No Destination found",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  editDestination: async (req, res) => {
    try {
      upload(req, res, async (error) => {
        if (error) return commonHelpers.somethingWentWrong(error, res);
        req.body.destData = JSON.parse(req.body.destData);

        let {
          id,
          name,
          totalTime,
          mapLocation,
          airportName,
          airportCode,
          nearBy,
          description,
          waysToReach,
          from,
          to,
          startTime,
          endTime,
          mobileNumber1,
          additionalInfo,
          mobileNumber2,
          destImageURL,
          coverImageURL,
          category,
          destinationEmail,
        } = req.body.destData;

        let destToDelete = [],
          images = [],
          cvImage = {},
          data;

        if (!mongoose.isValidObjectId(id)) {
          // If the ID is invalid, throw an error
          return res.json({
            status: false,
            message: "Invalid Id",
          });
        }

        // console.log({ destImageURL });
        var finalURLs = [];
        if (typeof destImageURL == "object") {
          finalURLs = destImageURL.filter((url) => {
            if (url.trim().length != 0) return url;
          });
        }
        if (
          (finalURLs.length > 0 || req.files.dest_image) &&
          (coverImageURL.trim() != "" || req.files.cover_image)
        ) {
          let destFound = await destinationModel.findOne({ _id: id });

          //  console.log({ a: req.files });
          if (destFound) {
            console.log({ a: destFound.coverImage.imageURL, b: coverImageURL.trim() });
            if (destFound.coverImage.imageURL != coverImageURL.trim()) {
              cvImage = {
                name: req.files.cover_image[0].filename,
                imageURL: `${IMAGEURL}/destination-images/${destFound.id}/${req.files.cover_image[0].filename}`,
              };

              moveDest({ destToMove: [cvImage], id: destFound.id });
              deleteFile([
                `../public/destination-images/${destFound.id}/${destFound.coverImage.name}`,
              ]);
            } else cvImage = destFound.coverImage;

            if (req.files.dest_image)
              req.files.dest_image.forEach((v) => {
                var test = {
                  name: v.filename,
                  imageURL: `${IMAGEURL}/destination-images/${destFound.id}/${v.filename}`,
                };
                images.push(test);
              });
            if (req.files.dest_image && finalURLs.length == 0) {
              console.log("when dest image are adding and length is 0");
              if (req.files.dest_image.length > 0) {
                console.log("when dest image length is greater");
                data = await destinationModel.findOneAndUpdate(
                  { _id: id },
                  {
                    name,
                    totalTime,
                    mapLocation,
                    airportName,
                    airportCode,
                    nearBy,
                    description,
                    waysToReach,
                    to,
                    from,
                    coverImage: cvImage,
                    images,
                    startTime,
                    endTime,
                    destinationEmail,
                    category,
                    mobileNumber1,
                    additionalInfo,
                    mobileNumber2,
                  },
                  { new: true, runValidators: true }
                );
                if (data) {
                  moveDest({ destToMove: images, id: data.id });

                  destFound.images.forEach((v) =>
                    destToDelete.push(
                      `../public/destination-images/${destFound["_id"]}/${v.name}`
                    )
                  );

                  console.log("deletefile", destToDelete);

                  deleteFile(destToDelete);
                  return res.json({
                    status: Boolean(true),
                    message: "Destination edited successfully",
                    data,
                  });
                } else
                  return res.json({
                    status: false,
                    message: "Destination not updated",
                  });
              }
            } else if (req.files.dest_image && finalURLs.length > 0) {
              console.log("when adding new image and old images also");
              if (req.files.dest_image.length > 0 && finalURLs.length > 0) {
                const urls = destFound.images.map((val) => val.imageURL);

                let diffArr = urls.filter((val) => {
                  return !req.body.destData.destImageURL.includes(val);
                });

                //this deleteData variable we have define here in this condition
                // we are not getting proper path to delete destination folder on live and on local diffArr value is deleteData value.

                let deleteData = JSON.parse(
                  JSON.stringify(diffArr).replace(
                    new RegExp("http://54.160.193.122", "g"),
                    ".."
                  )
                );

                let finalImages = destFound.images.filter(
                  (val) => !diffArr.includes(val.imageURL)
                );

                data = await destinationModel.findOneAndUpdate(
                  { _id: id },
                  {
                    startTime,
                    endTime,
                    mobileNumber1,
                    additionalInfo,
                    mobileNumber2,
                    name,
                    totalTime,
                    mapLocation,
                    airportName,
                    airportCode,
                    nearBy,
                    description,
                    waysToReach,
                    destinationEmail,
                    to,
                    from,
                    coverImage: cvImage,
                    images: [...images, ...finalImages],
                  },
                  { new: true, runValidators: true }
                );
                if (data) {
                  moveDest({ destToMove: images, id: data.id });
                  deleteFile(deleteData);
                  // deleteFile(diffArr);
                  return res.json({
                    status: Boolean(true),
                    message: "Destination edited successfully",
                    data,
                  });
                } else
                  return res.json({
                    status: false,
                    message: "Destination not updated",
                  });
              }
            } else if (!req.files.dest_image && finalURLs.length > 0) {
              console.log("when no new destination image were added");
              const urls = destFound.images.map((val) => val.imageURL);

              diffArr = urls.filter(
                (val) => !req.body.destData.destImageURL.includes(val)
              );

              let deleteData = JSON.parse(
                JSON.stringify(diffArr).replace(
                  new RegExp("http://54.160.193.122", "g"),
                  ".."
                )
              );

              images = destFound.images.filter(
                (val) => !diffArr.includes(val.imageURL)
              );

              let data = await destinationModel.findOneAndUpdate(
                { _id: id },
                {
                  name,
                  totalTime,
                  mapLocation,
                  airportName,
                  airportCode,
                  nearBy,
                  description,
                  waysToReach,
                  to,
                  from,
                  images,
                  startTime,
                  endTime,
                  mobileNumber1,
                  coverImage: cvImage,
                  additionalInfo,
                  mobileNumber2,
                  destinationEmail,
                  category: category,
                },
                { new: true, runValidators: true }
              );

              if (data) {
                // deleteFile(diffArr);
                deleteFile(deleteData);
                return res.json({
                  status: Boolean(true),
                  message: "Destination edited successfully",
                  data,
                });
              } else
                return res.json({
                  status: false,
                  message: "Destination not updated",
                });
            }
          } else {
            return res.json({
              status: Boolean(false),
              message: "No Destination found with this id",
            });
          }
        } else {
          return res.json({
            status: Boolean(false),
            message: `Please select atleast one ${finalURLs.length == 0 &&
                !req.files.dest_image &&
                coverImageURL == "" &&
                !req.files.cover_image
                ? "cover and destination"
                : coverImageURL == "" && !req.files.cover_image
                  ? "cover"
                  : "destination"
              } image`,
          });
        }
      });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  deleteDestination: async (req, res) => {
    try {
      let destinationId = req.body.destinationData;

      let destionationDetails = await destinationModel.find({
        _id: { $in: destinationId },
      });

      if (destionationDetails.length > 0) {
        const deleteDestination = await destinationModel.deleteMany({
          _id: { $in: destinationId },
        });

        destionationDetails.forEach((v) => {
          deleteFolder(`../public/destination-images/${v.id}`);
        });

        if (deleteDestination.deletedCount > 0)
          return res.json({
            status: Boolean(true),
            message: "Destination(s) successfully deleted",
            data: deleteDestination,
          });
      } else
        return res.json({
          status: Boolean(false),
          message: "Destination(s) not found",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  //gaurav sir api
  getDestinations: async (req, res) => {
    try {
      const { pageNo, rows } = req.body.destinationData;
      const search = `${req.query.search}`.toLowerCase();
      if (!pageNo && !rows) {
        return res.json({
          status: Boolean(false),
          message: `Please select pageNo and rows`,
        });
      } else if (!pageNo) {
        return res.json({
          status: Boolean(false),
          message: `Please select pageNo`,
        });
      } else if (!rows) {
        return res.json({
          status: Boolean(false),
          message: `Please select rows`,
        });
      }

      var destination = await destinationModel.find({}).sort({ _id: -1 }),
        destinations = destination.filter((v, i) => {
          if (
            v.name.toLowerCase().includes(`${search}`) ||
            v.airportName.toLowerCase().includes(`${search}`) ||
            (v.airportCode || "").toLowerCase().includes(`${search}`) ||
            v.totalTime.toLowerCase().includes(`${search}`) ||
            v.vendorMail.toLowerCase().includes(`${search}`)
          ) {
            return true;
          } else return false;
        }),
        temp = [];

      asyncLoop(
        destinations,
        async (val, next) => {
          if (
            val?.vendorMail !== "" &&
            val?.vendorMail != null &&
            val != null
          ) {
            vendorName = await vendorModel?.findOne({ email: val.vendorMail });
            if (vendorName?.name != null && vendorName != null) {
              vendorName = vendorName.name;
              var tempImageArr = [],
                coverImage = {};

              coverImage = {
                name: val.coverImage.name,
                imageURL: `${IMAGEURL}/destination-images/${val._id}/${val.coverImage.name}`,
              };

              val.images.forEach((value, index) => {
                tempImageArr.push({
                  imageURL: `${IMAGEURL}/destination-images/${val._id}/${value.name}`,
                  name: value.name,
                });

                if (index == val.images.length - 1) {
                  temp.push({
                    ...val._doc,
                    vendorName,
                    images: tempImageArr,
                    coverImage,
                  });
                  tempImageArr = [];
                }
              });
            }
          }
          next();
        },
        (error) => {
          if (error) return commonHelpers.somethingWentWrong(error, res);
          console.log("destination length", destinations.length);
          console.log("temp length", temp.length);
          if (temp && temp.length > 0) {
            let temps = temp.splice((pageNo - 1) * rows, rows);
            return res.json({
              status: Boolean(true),
              message: "Destination details",
              totalLength: destinations.length,
              // length: temp.length,
              data: temps,
            });
          } else {
            return res.json({
              status: Boolean(false),
              message: "No destination to show",
            });
          }
        }
      );
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  test: async (req, res) => {
    try {
      id = req.body.id;
      const sub = await stripeHelper.retrieveSubscription(id),
        inv = await stripeHelper.retrieveIN(sub?.latest_invoice),
        pi = await stripeHelper.retrievePI(inv?.payment_intent);
      return res.json({ sub, inv, pi });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getAllBlog: async (req, res) => {
    try {
      let blog = await blogModel.find().sort({ createdAt: -1 });

      blog = blog.filter((v, i) => {
        if (
          v.heading
            .toLowerCase()
            .includes(`${req.query.search}`.toLowerCase()) ||
          v.description
            .toLowerCase()
            .includes(`${req.query.search}`.toLowerCase()) ||
          v.nearbyLocation.name
            .toLowerCase()
            .includes(`${req.query.search}`.toLowerCase()) ||
          (v.nearbyLocation.code || "")
            .toLowerCase()
            .includes(`${req.query.search}`.toLowerCase()) ||
          v.datePosted
            .toLowerCase()
            .includes(`${req.query.search}`.toLowerCase()) ||
          v.totalReads == req.query.search ||
          (v.userEmail != null &&
            v.userEmail
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase())) ||
          (v.vendorMail != null &&
            v.vendorMail
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()))
        ) {
          return v;
        }
      });

      if (blog) {
        return res.json({
          status: true,
          message: "All blog details",
          length: blog.length,
          data: blog,
        });
      } else {
        return res.json({ status: false, message: "No Blog found" });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  updateData: async (req, res) => {
    const findQuery = {
      _id: "64a299cbd6bd12f63dd46177",
      "images.imageURL": { $regex: /http:\/\/54\.160\.193\.122/ },
    };

    let data = await destinationModel.findOne({ _id: _id });
    return res.send(data);

    const updateQuery = {
      $set: {
        "images.$[].imageURL": {
          $replaceAll: {
            input: "$images.$[].imageURL",
            find: "http://54.160.193.122",
            replacement: "https://longlayover.net",
          },
        },
      },
    };

    try {
      const updatedDocument = await destinationModel.findOneAndUpdate(
        findQuery,
        updateQuery,
        {
          new: true, // Return the updated document
        }
      );

      res.status(200).json(updatedDocument);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the document." });
    }
  },
};

module.exports = adminController;
