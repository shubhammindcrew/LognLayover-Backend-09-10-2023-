const moment = require("moment"),
  bcrypt = require("bcrypt"),
  { BASE_URL } = require("../config"),
  asyncLoop = require("node-async-loop"),
  {
    distanceMatrixHelper,
    sign,
    forgotPassword,
    stripeHelper,
    commonHelpers,
    upload,
    deleteFile,
    // makeDir,
    moveDest,
  } = require("../helpers"),
  {
    airportModel,
    destinationModel,
    vendorModel,
    blogModel,
    subDetailsModel,
    subPayDetailsModel,
    cardModel,
    letterModel,
    userModel,
  } = require("../models");
const { BlogValidation } = require("../JoiValidations/blogs");
const { registerValidation } = require("../JoiValidations/register");
const { loginValidation } = require("../JoiValidations/login");
const {
  forgetPasswordValidation,
} = require("../JoiValidations/forgetPassword");
const {
  confirmPasswordValidation,
} = require("../JoiValidations/confirmPassResetOtp");
const { destinationValidation } = require("../JoiValidations/destination");
const { makeDir } = require("../helpers/file-helper");
const { deleteFolder } = require("../helpers/deleteFolder-helpers");
const mongoose = require("mongoose");
const { IMAGEURL } = require("../config/index");

vendorController = {
  getAirports: async (req, res) => {
    try {
      airports = await airportModel.find();

      airports = airports.filter((v) => {
        if (
          v.name.toLowerCase().includes(`${req.query.search}`.toLowerCase()) ||
          v.code.toLowerCase().includes(`${req.query.search}`.toLowerCase())
        )
          return v;
      });
      if (airports.length > 0)
        return res.json({ status: Boolean(true), airports });
      else
        return res.json({
          status: Boolean(false),
          message: "No airports found",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  signUp: async (req, res) => {
    try {
      const { error } = registerValidation.validate(req.body, {
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

      var { name, email, password } = req.body;
      email = email.replace(/\s/g, "");

      temp =
        /^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([\.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i.test(
          email
        );
      if (temp) {
        const emailFound = await vendorModel.find({ email: email });
        const userFound = await userModel.find({ email: email });
        date = new Date();
        if (emailFound.length > 0)
          return res.json({
            status: Boolean(false),
            message: "Vendor already exists with this email id",
          });
        else if (userFound.length > 0) {
          return res.json({
            status: Boolean(false),
            message: "User already exist with this email id",
          });
        } else if (password.length >= 8) {
          const token = await sign(email, password, date);
          const hash = await bcrypt.hash(password, 8),
            vendor = new vendorModel({
              name,
              email,
              password: hash,
              // subscription: 0,
              token,
            }),
            saveData = await vendor
              .save()
              .catch((error) => commonHelpers.somethingWentWrong(error, res));
          return res.json({
            status: true,
            data: saveData,
            message: "Vendor registered successfully",
            data: {
              name,
              email,
              token,
              role: saveData.role,
            },
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
        });
      }
      var { email, password } = req.body;

      date = new Date();
      temp =
        /^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([\.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i.test(
          email
        );
      if (temp) {
        const vendorFound = await vendorModel.findOne({ email });
        if (vendorFound) {
          hash = await bcrypt.compare(password, vendorFound.password);
          if (hash) {
            const token = await sign(email, password, date);

            data = {
              email: vendorFound.email,
              token: token,
              subscription: vendorFound.subscription,
            };

            return res.json({
              status: Boolean(true),
              message: "Login Successfull",
              token: token,
              name: vendorFound.name,
              email: email,
              subscribe: vendorFound.subscription,
              role: vendorFound.role,
            });
          } else return commonHelpers.invalidCredentials(res);
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

  forgotPassword: async (req, res) => {
    try {
      const { error } = forgetPasswordValidation.validate(req.body, {
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
        });
      }
      const code = Math.floor(100000 + Math.random() * 900000),
        vendor = await vendorModel.findOne({ email: req.body.email });
      if (vendor) {
        codeSent = await forgotPassword({ to: req.body.email, code });
        if (codeSent) {
          const updateVendor = await vendorModel.findOneAndUpdate(
            { email: req.body.email },
            { code },
            { new: true, runValidators: true }
          );
          if (updateVendor)
            return res.json({
              status: Boolean(true),
              message: "OTP sent successfully",
              code: updateVendor.code,
            });
          else
            return res.json({
              status: Boolean(false),
              message: "OTP not sent",
            });
        }
      } else {
        res.json({ status: Boolean(false), message: "Vendor not found" });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  confirmPassResetOTP: async (req, res) => {
    try {
      const { error } = confirmPasswordValidation.validate(req.body, {
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
        });
      }
      const { email, code, password } = req.body,
        vendor = await vendorModel.findOne({ email, code });
      if (vendor) {
        const hash = await bcrypt.hash(password, 8);
        if (hash) {
          const vendorUpdate = await vendorModel.findOneAndUpdate(
            { email },
            { password: hash, code: code * 9 },
            { new: true, runValidators: true }
          );
          return res.json({
            status: Boolean(true),
            message: "Password changed successfully",
          });
        }
      } else return res.json({ status: Boolean(false), message: "Wrong OTP" });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  addBlog: async (req, res) => {
    try {
      upload(req, res, async (errors) => {
        if (errors) return commonHelpers.somethingWentWrong(errors, res);

        const { error } = BlogValidation.validate(req.body, {
          errors: {
            label: "key",
            wrap: { label: false },
          },
          abortEarly: false,
        });

        let coverImage = req.files.blog_image;
        let deleteCoverImage = [];

        if (error && req.files.blog_image != undefined) {
          coverImage.forEach((v, i) => {
            let url1 = `../public/blog-images/${req.files.blog_image[i].filename}`;
            deleteCoverImage.push(url1);
          });
          deleteFile(deleteCoverImage);
          return res.json({
            message: error.details[0].message,
          });
        }

        if (error && !req.files.blog_image) {
          return res.json({
            message: error.details[0].message,
          });
        }

        console.log(req.files.blog_image, "blog_image");

        if (req.files.blog_image) {
          // name is airport name and code is airport code.

          let { heading, name, code, description } = req.body;

          let getAirport = await airportModel.findOne({
            $or: [{ name }, { code }],
          });

          if (getAirport) {
            blog = new blogModel({
              heading,
              "nearbyLocation.name": name,
              "nearbyLocation.code": code,
              description,
              vendorMail: req.vendorEmail,
              datePosted: moment.utc(new Date()).format("MMMM DD,YYYY"),
              blogImage: {
                name: req.files.blog_image[0].filename,
                imageURL: `${BASE_URL}/blog-images/${req.files.blog_image[0].filename}`,
              },
            })
              .save()
              .then((blog) => {
                if (blog)
                  return res.json({
                    status: Boolean(true),
                    message: "Blog saved successfully",
                    data: blog,
                  });
                else
                  return res.json({
                    status: Boolean(false),
                    message: "Blog didn't save",
                  });
              })
              .catch((error) => commonHelpers.somethingWentWrong(error, res));
          } else {
            res.json({
              status: Boolean(false),
              message:
                "No airport found with this airport name or airport code",
            });
          }
        } else
          return res.json({
            status: Boolean(false),
            message: "Please select a image",
          });
      });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  editBlog: async (req, res) => {
    try {
      upload(req, res, async (errors) => {
        let { heading, name, code, description, id } = req.body;

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

        console.log(obj, "object details");
        if (req.files.blog_image == undefined) {
          let updateBlog = await blogModel.updateOne({ _id: id }, obj);

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

          let findBlog = await blogModel.findOne({ _id: req.body.id });
          let deleteFileName = findBlog.blogImage.name;
          console.log(findBlog, "file name");

          deleteFile([`../public/blog-images/${deleteFileName}`]);

          let updateBlog = await blogModel.updateOne(
            { _id: id },
            updatedObject
          );

          return res.json({
            status: true,
            message: "sucessfully updated data with file",
            data: updateBlog,
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
            deleteBlog,
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

      var blog = await blogModel
          .find({ vendorMail: req.vendorEmail })
          .sort({ createdAt: -1 }),
        blog = blog.filter((v, i) => {
          if (
            v.heading
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.nearbyLocation.name
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.nearbyLocation.code
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.datePosted
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.totalReads == req.query.search
          ) {
            return v;
          }
        });

      totalLength = blog.length;
      if (blog && blog.length > 0) {
        blog.forEach((blogdata) => {
          blogdata.blogImage.imageURL = `${IMAGEURL}/blog-images/${blogdata.blogImage.name}`;
        });
        const blogs = blog.splice((pageNo - 1) * rows, rows);
        return res.json({
          status: Boolean(true),
          message: "Blog details",
          totalLength,
          data: blogs,
        });
      } else
        return res.json({
          status: Boolean(false),
          message: "No blogs to show",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getABlog: async (req, res) => {
    try {
      //here id is blog id.
      let id = req.body.id;
      if (!mongoose.isValidObjectId(id)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }
      console.log(id, "req.body.id");
      const getBlog = await blogModel.findById(req.body.id);
      // console.log("before", getBlog);

      console.log("blog", getBlog);
      if (getBlog) {
        const blogData = await blogModel.findOneAndUpdate(
          { vendorMail: req.vendorEmail, _id: req.body.id },
          { totalReads: getBlog.totalReads + 1 },
          { new: true, runValidators: true }
        );
        blogData.blogImage.imageURL = `${IMAGEURL}/blog-images/${blogData.blogImage.name}`;
        console.log("blogData", blogData);
        if (blogData) return res.json({ status: Boolean(true), blogData });
      } else res.json({ status: Boolean(false), message: "Blog not found" });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  addDestination: async (req, res) => {
    try {
      upload(req, res, async (errors) => {
        if (errors) {
          return commonHelpers.somethingWentWrong(errors, res);
        }

        req.body.destData = JSON.parse(req.body.destData);

        const { error } = destinationValidation.validate(req.body, {
          errors: {
            label: "key",
            wrap: { label: false },
          },
          abortEarly: false,
        });

        let coverImage = req.files.cover_image;
        let deleteCoverImage = [];
        let destinationImage = req.files.dest_image;
        let deleteDest = [];

        if (
          error &&
          req.files.cover_image != undefined &&
          req.files.dest_image != undefined
        ) {
          console.log("when error and both files");
          coverImage.forEach((v, i) => {
            let url1 = `../public/destination-images/${req.files.cover_image[i].filename}`;
            deleteCoverImage.push(url1);
          });

          deleteFile(deleteCoverImage);

          destinationImage.forEach((v, i) => {
            let url = `../public/destination-images/${req.files.dest_image[i].filename}`;

            deleteDest.push(url);
          });

          deleteFile(deleteDest);

          return res.json({
            message: error.details[0].message,
          });
        }

        if (
          error &&
          req.files.dest_image != undefined &&
          !req.files.cover_image
        ) {
          console.log("when error and dest image is coming");
          destinationImage.forEach((v, i) => {
            let url = `../public/destination-images/${req.files.dest_image[i].filename}`;

            deleteDest.push(url);
          });

          deleteFile(deleteDest);

          return res.json({
            message: error.details[0].message,
          });
        }

        if (
          error &&
          req.files.cover_image != undefined &&
          !req.files.dest_image
        ) {
          console.log("when error and cover is coming");
          coverImage.forEach((v, i) => {
            let url1 = `../public/destination-images/${req.files.cover_image[i].filename}`;
            deleteCoverImage.push(url1);
          });
          deleteFile(deleteCoverImage);

          return res.json({
            message: error.details[0].message,
          });
        }

        if (error) {
          console.log("when error is coming");
          return res.json({
            message: error.details[0].message,
          });
        }

        if (req.files.dest_image && req.files.cover_image) {
          var tempDest = [],
            images = [],
            bgImage;

          const {
            name,
            totalTime,
            mapLocation,
            airportName,
            airportCode,
            nearBy,
            description,
            to,
            from,
            waysToReach,
            startTime,
            endTime,
            mobileNumber1,
            mobileNumber2,
            // coverImage,
            category,
            destinationEmail,
            additionalInfo,
          } = req.body.destData;

          bgImage = {
            name: req.files.cover_image[0].filename,
            imageURL: `${IMAGEURL}/destination-images/${req.files.cover_image[0].filename}`,
          };

          req.files.dest_image.forEach((v) => {
            var tempImages = {
              name: v.filename,
              imageURL: `${IMAGEURL}/destination-images/${v.filename}`,
            };
            images.push(tempImages);
          });

          destination = new destinationModel({
            name,
            totalTime,
            mapLocation,
            airportName,
            airportCode,
            nearBy,
            to,
            from,
            description,
            waysToReach,
            images,
            vendorMail: req.vendorEmail,
            startTime,
            endTime,
            mobileNumber1,
            mobileNumber2,
            category,
            destinationEmail,
            coverImage: bgImage,
            additionalInfo,
          })
            .save()
            .then(async (data) => {
              //whenver new folder created with id
              const mkdata = await makeDir(`${data["_id"]}`);
              console.log(mkdata);
              moveDest({
                destToMove: [...data.images, data.coverImage],
                id: data._id,
              });
              data.images.forEach((v) => {
                var tempFinalDest = {
                  image: { data: v.data, contentType: v.contentType },
                  name: v.name,
                  imageURL: `${BASE_URL}/destination-images/${data["_id"]}/${v.name}`,
                };
                tempDest.push(tempFinalDest);
              });
              bgImage = {
                name: data.coverImage.name,
                imageURL: `${BASE_URL}/destination-images/${data["_id"]}/${data.coverImage.name}`,
              };

              finalUpadtedDestination = await destinationModel.findOneAndUpdate(
                { vendorMail: req.vendorEmail, _id: data.id },
                {
                  name,
                  totalTime,
                  mapLocation,
                  airportName,
                  airportCode,
                  nearBy,
                  description,
                  waysToReach,
                  images: tempDest,
                  from,
                  to,
                  startTime,
                  endTime,
                  mobileNumber1,
                  mobileNumber2,
                  category,
                  destinationEmail,
                  coverImage: bgImage,
                  additionalInfo,
                },
                { new: true, runValidators: true }
              );
              return res.json({
                status: Boolean(true),
                message: "Destination saved successfully",
                data: finalUpadtedDestination,
              });
            })

            .catch((error) => {
              commonHelpers.somethingWentWrong(error, res);
            });
        } else
          return res.json({
            status: Boolean(false),
            message: `Please select atleast one ${
              !req.files.cover_image && !req.files.dest_image
                ? "cover and destination"
                : !req.files.cover_image
                ? "cover"
                : "destination"
            } image`,
          });
      });
    } catch (error) {
      console.log("in catch", error);
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  //there are three cases in edit api
  // 1.when new images are sending using cover_image and dest_image .coverImageURL="" and destImageURL= "" must be empty string.
  // 2.when cover_image and dest_image and url coverImageURL,destImageURL both are adding.
  // 3.when we want to send new dest_image file and url coverImageUrl and [destImageURL are less than url which is stored in databse suppose in database.
  //  there are 3 destination image and we want only 2 old image and want to add new images].
  // 4.Either we can send coverImage url or cover_image can't sent both the things at same time in postman .
  // 5.when sending the image url means destImageURL and coverImageURL.
  editDestination: async (req, res) => {
    try {
      upload(req, res, async (error) => {
        if (error) return commonHelpers.somethingWentWrong(error, res);

        // req.body.userData = JSON.parse(req.body.userData);
        req.body.destData = JSON.parse(req.body.destData);

        let destinationId = req.body.destData.id;

        if (!mongoose.isValidObjectId(destinationId)) {
          // If the ID is invalid, throw an error
          return res.json({
            status: false,
            message: "Invalid Id",
          });
        }

        var {
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
          } = req.body.destData,
          destToDelete = [],
          images = [],
          cvImage = {},
          data;

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
          var destFound = await destinationModel.findOne({
            vendorMail: req.vendorEmail,
            _id: req.body.destData.id,
          });

          if (destFound) {
            if (destFound.coverImage.imageURL != coverImageURL.trim()) {
              cvImage = {
                name: req.files.cover_image[0].filename,
                imageURL: `${BASE_URL}/destination-images/${destFound.id}/${req.files.cover_image[0].filename}`,
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
                  imageURL: `${BASE_URL}/destination-images/${destFound.id}/${v.filename}`,
                };
                images.push(test);
              });
            if (req.files.dest_image && finalURLs.length == 0) {
              console.log("when dest image are adding and length is 0");
              if (req.files.dest_image.length > 0) {
                destFound.images.forEach((v) =>
                  destToDelete.push(
                    `../public/destination-images/${destFound["_id"]}/${v.name}`
                  )
                );

                deleteFile(destToDelete);
                data = await destinationModel.findOneAndUpdate(
                  {
                    // vendorMail: req.body.userData.email,
                    vendorMail: req.vendorEmail,
                    _id: id,
                  },
                  {
                    startTime,
                    endTime,
                    mobileNumber1,
                    additionalInfo,
                    mobileNumber2,
                    destinationEmail,
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
                    category,
                  },
                  { new: true, runValidators: true }
                );
                if (data) {
                  moveDest({ destToMove: data.images, id: data.id });
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

                diffArr = urls.filter((val) => {
                  return !req.body.destData.destImageURL.includes(val);
                });

                let deleteData = JSON.parse(
                  JSON.stringify(diffArr).replace(
                    new RegExp("http://54.160.193.122", "g"),
                    ".."
                  )
                );

                finalImages = destFound.images.filter((val) => {
                  return !diffArr.includes(val.imageURL);
                });

                data = await destinationModel.findOneAndUpdate(
                  { vendorMail: req.vendorEmail, _id: id },
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
                    category,
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
              console.log("when no new image were added");
              const urls = destFound.images.map((val) => val.imageURL);

              diffArr = urls.filter((val) => {
                return !req.body.destData.destImageURL.includes(val);
              });

              let deleteData = JSON.parse(
                JSON.stringify(diffArr).replace(
                  new RegExp("http://54.160.193.122", "g"),
                  ".."
                )
              );

              (images = destFound.images.filter((val) => {
                return !diffArr.includes(val.imageURL);
              })),
                (data = await destinationModel.findOneAndUpdate(
                  { vendorMail: req.vendorEmail, _id: id },
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
                    category,
                  },
                  { new: true, runValidators: true }
                ));
              if (data) {
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
          } else
            return res.json({
              status: Boolean(false),
              message: "Destination not found",
            });
        } else
          return res.json({
            status: Boolean(false),
            message: `Please select atleast one ${
              finalURLs.length == 0 &&
              !req.files.dest_image &&
              coverImageURL == "" &&
              !req.files.cover_image
                ? "cover and destination"
                : coverImageURL == "" && !req.files.cover_image
                ? "cover"
                : "destination"
            } image`,
          });
      });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  deleteDestination: async (req, res) => {
    try {
      const destFound = await destinationModel.find({
        _id: { $in: req.body.destinationData },
      });

      let addFiles = [];

      let deleteDestination = await destinationModel.deleteMany({
        _id: { $in: req.body.destinationData },
      });

      if (deleteDestination?.deletedCount > 0) {
        destFound.forEach((data) => {
          let id = data.id;
          console.log(id, "delete folder id");

          deleteFolder(`../public/destination-images/${id}`);
        });

        return res.json({
          status: Boolean(true),
          message: "Destination(s) successfully deleted",
        });
      } else
        return res.json({
          status: Boolean(false),
          message: "Destination(s) not found",
        });
    } catch (error) {
      console.log(error);
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  //gaurav sir
  // getDestinations: async (req, res) => {
  //   try {
  //     const { pageNo, rows } = req.body.destinationData;
  //     const search = `${req.query.search}`.toLowerCase();
  //     if (!pageNo && !rows) {
  //       return res.json({
  //         status: Boolean(false),
  //         message: `Please select pageNo and rows`,
  //       });
  //     } else if (!pageNo) {
  //       return res.json({
  //         status: Boolean(false),
  //         message: `Please select pageNo`,
  //       });
  //     } else if (!rows) {
  //       return res.json({
  //         status: Boolean(false),
  //         message: `Please select rows`,
  //       });
  //     }

  //     var destination = await destinationModel
  //       .find({ vendorMail: req.vendorEmail })
  //       .sort({ _id: -1 });
  //     var destinations = destination.filter((v, i) => {
  //       if (
  //         v.name.toLowerCase().includes(`${search}`) ||
  //         v.airportName.toLowerCase().includes(`${search}`) ||
  //         (v.airportCode || "").toLowerCase().includes(`${search}`) ||
  //         v.totalTime.toLowerCase().includes(`${search}`) ||
  //         v.vendorMail.toLowerCase().includes(`${search}`)
  //       ) {
  //         return true;
  //       } else return false;
  //     });
  //     var temp = [];
  //     asyncLoop(
  //       destinations,
  //       async (val, next) => {
  //         if (
  //           val?.vendorMail !== "" &&
  //           val?.vendorMail != null &&
  //           val != null
  //         ) {
  //           vendorName = await vendorModel?.findOne({ email: val.vendorMail });
  //           if (vendorName?.name != null && vendorName != null) {
  //             vendorName = vendorName.name;
  //             temp.push({ ...val._doc, vendorName });
  //           }
  //         }
  //         next();
  //       },
  //       (error) => {
  //         if (error) return commonHelpers.somethingWentWrong(error, res);
  //         if (temp && temp.length > 0) {
  //           let temps = temp.splice((pageNo - 1) * rows, rows);
  //           console.log({
  //             temp: temp.length,
  //             temps: temps.length,
  //             destination: destination.length,
  //             destinations: destinations.length,
  //           });
  //           return res.json({
  //             status: Boolean(true),
  //             message: "Destination details",
  //             totalLength: destinations.length,
  //             length: destinations.length,
  //             // req.params.search == ""
  //             //   ? destination.length
  //             //   : destinations.length,
  //             // req.params.search == "" ? temp.length : temp.length,
  //             // length: temps.length,
  //             data: temps,
  //           });
  //         } else {
  //           return res.json({
  //             status: Boolean(false),
  //             message: "No destination to show",
  //           });
  //         }
  //       }
  //     );
  //   } catch (error) {
  //     return commonHelpers.somethingWentWrong(error, res);
  //   }
  // },

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

      var destination = await destinationModel
          .find({ vendorMail: req.vendorEmail })
          .sort({ _id: -1 }),
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

          if (temp && temp.length > 0) {
            let temps = temp.splice((pageNo - 1) * rows, rows);
            return res.json({
              status: Boolean(true),
              message: "Destination details",
              totalLength: destinations.length,
              length: destinations.length,
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

  getADestination: async (req, res) => {
    try {
      //here id is blog id.
      let id = req.body.destData.id;
      if (!mongoose.isValidObjectId(id)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }
      const destination = await destinationModel.findById(req.body.destData.id);
      destination.coverImage.imageURL = `${IMAGEURL}/destination-images/${destination._id}/${destination.coverImage.name}`;
      destination.images.forEach((image) => {
        image.imageURL = `${IMAGEURL}/destination-images/${destination._id}/${image.name}`;
      });

      if (destination) return res.json({ status: Boolean(true), destination });
      else
        res.json({ status: Boolean(false), message: "Destination not found" });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  distanceMatrix: async (req, res) => {
    try {
      const { to, from } = req.body.matrixData,
        travelModes = ["driving", "walking", "transit"],
        transits = ["train", "bus", "subway"];

      var data = [],
        data1 = [];

      return asyncLoop(
        travelModes,
        async (mode, next) => {
          if (mode != "transit") {
            var temp = await distanceMatrixHelper({ mode, to, from });
            data.push({ data: temp.rows, mode });
            next();
          } else
            asyncLoop(
              transits,
              async (transit, next) => {
                var temp1 = await distanceMatrixHelper({
                  mode,
                  to,
                  from,
                  transit,
                });
                data1.push({ data: temp1.rows, mode: transit });
                next();
              },
              (error) => {
                if (error) return commonHelpers.somethingWentWrong(error, res);
                return res.json({
                  status: Boolean(true),
                  matrixData: [...data, ...data1],
                });
              }
            );
        },
        (error) => {
          if (error) return commonHelpers.somethingWentWrong(error, res);
        }
      );
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  // stripe
  getPlan: async (req, res) => {
    try {
      const data = await stripeHelper.listPrice();
      return res.json({ status: Boolean(true), id: data[0].id });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  createCard: async (req, res) => {
    try {
      const {
          name,
          city,
          country,
          line1,
          line2,
          postal_code,
          state,
          number,
          exp_month,
          exp_year,
          cvc,
        } = req.body.sData,
        card = await stripeHelper.createToken({
          name,
          city,
          country,
          line1,
          line2,
          postal_code,
          state,
          number,
          exp_month,
          exp_year,
          cvc,
        });
      return res.json({ card });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  subscribe: async (req, res) => {
    try {
      var { token, planId, saveCard, subMode, payId } = req.body;

      // var todaysDate = moment.utc(new Date()).format("MMMM DD,YYYY"),
      var vendorFound = await vendorModel.findOne({
          email: req.vendorEmail,
        }),
        last4;

      let getData = await subPayDetailsModel.find({
        vendorMail: req.vendorEmail,
      });

      if (getData.length == 0 && token != "" && payId == "") {
        subMode = "after_sign_up";
        customerId = (
          await stripeHelper.createCustomer({
            email: req.vendorEmail,
            name: vendorFound.name,
          })
        ).id;
        createPayId = await stripeHelper.createPayMethod(token);
        payId = createPayId.id;
        last4 = createPayId.card.last4;
        fingerprint = createPayId.card.fingerprint;
      }
      if (getData.length > 0 && token != "" && payId == "") {
        subMode = "with_new_card";

        card = await cardModel
          .find({ vendorMail: req.vendorEmail })
          .select("fingerprint -_id");
        customerId = (
          await subPayDetailsModel
            .findOne({ vendorMail: req.vendorEmail })
            .select("customerId -_id")
        ).customerId;
        createPayId = await stripeHelper.createPayMethod(token);
        payId = createPayId.id;
        last4 = createPayId.card.last4;
        fingerprint = createPayId.card.fingerprint;
        savedFingerPrint = [];
        card.forEach((v) => savedFingerPrint.push(v.fingerprint));
      }
      if (getData.length > 0 && token == "" && payId != "") {
        subMode = "with_saved_card";
        customerId = (
          await subPayDetailsModel
            .findOne({ vendorMail: req.vendorEmail })
            .select("customerId -_id")
        ).customerId;
        payId = (
          await cardModel
            .findOne({ vendorMail: req.vendorEmail })
            .select("payId -_id")
        ).payId;
      }

      const attachPayMethod = await stripeHelper.attachPaymentMethod({
          customer: customerId,
          payId,
        }),
        updateCustomer = await stripeHelper.updateCustomer({
          customer: customerId,
          payId,
        }),
        createSubscription = await stripeHelper.createSubscription({
          customer: customerId,
          price: planId,
        });

      let endDate = createSubscription.current_period_end * 1000;
      let startDate = createSubscription.current_period_start * 1000;
      // var endDate = moment.utc(newDate).format("MMMM DD,YYYY");

      var data = {
        subId: createSubscription.id,
        customerId,
        endDate,
        invoicePdf: createSubscription.latest_invoice.hosted_invoice_url,
        subStatus: createSubscription.status,
        payStatus: createSubscription.latest_invoice.payment_intent.status,
        planId: req.body.planId,
        amount: createSubscription.plan.amount / 100,
        startDate,
        payIntentId: createSubscription.latest_invoice.payment_intent.id,
        payId,
        last4,
        clientSecret:
          createSubscription.latest_invoice.payment_intent.client_secret,
        fingerprint: subMode == "with_saved_card" ? "" : fingerprint,
        saveCard:
          subMode == "with_saved_card"
            ? Boolean(false)
            : subMode == "after_sign_up"
            ? Boolean(saveCard)
            : savedFingerPrint.includes(fingerprint)
            ? false
            : Boolean(saveCard),
        vendorMail: req.vendorEmail,
      };

      return commonHelpers.subscribeVendor(data, res);
    } catch (error) {
      return commonHelpers.somethingWentWrong(error.stack, res);
    }
  },

  getInvoice: async (req, res) => {
    try {
      const getSub = await subDetailsModel.find({
        vendorMail: req.body.userData.email,
      });
      const getPaySub = await subPayDetailsModel.find({
        vendorMail: req.body.userData.email,
      });
      const card = await cardModel.find({
        vendorMail: req.body.userData.email,
      });
      if (getPaySub && getSub) return res.json({ getSub, getPaySub, card });
      else return res.json({ getSub, d: "no" });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  threeSecure: async (req, res) => {
    try {
      payIntent = await stripeHelper.retrievePI(req.body.id);
      if (payIntent) {
        if ((payIntent.status = "succeeded")) {
          const updateVendor = await vendorModel.findOneAndUpdate(
            { email: req.vendorEmail },
            { subscription: true },
            { new: true, runValidators: true }
          );
          if (updateVendor) {
            return res.json({ status: Boolean(true) });
          } else {
            return res.json({ status: Boolean(false) });
          }
        } else if (updateVendor) return res.json({ status: Boolean(false) });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  unsubscribe: async (req, res) => {
    try {
      console.log({ a: req.body, b: req.vendorEmail });
      const subDetails = await subDetailsModel.find({
        vendorMail: req.vendorEmail,
      });
      if (subDetails) {
        const cancelSub = await stripeHelper.deleteSubscription(
          subDetails[subDetails.length - 1].subId
        );
        if (cancelSub) {
          const vendor = await vendorModel.findOne({ email: req.vendorEmail });
          const updateSub = await subDetailsModel.findOneAndUpdate(
            { vendorMail: req.vendorEmail, subId: cancelSub.id },
            { $push: { subStatus: cancelSub.status } },
            { new: true, runValidators: true }
          );
          if (updateSub)
            return res.json({
              status: Boolean(true),
              data: { sub: vendor.subscription },
            });
          else {
            console.log({ updateSub });
            return res.json({ status: Boolean(false) });
          }
        } else {
          console.log({ cancelSub });
          return res.json({ status: Boolean(false) });
        }
      } else {
        console.log({ subDetails });
        return res.json({ status: Boolean(false) });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  deleteVendor: async (req, res) => {
    try {
      const deleteUser = await vendorModel.findOneAndDelete({
        email: req.body.userData.email,
      });
      await subDetailsModel.deleteMany({ vendorMail: req.body.userData.email });
      await subPayDetailsModel.deleteMany({
        vendorMail: req.body.userData.email,
      });
      await cardModel.deleteMany({ vendorMail: req.body.userData.email });
      return res.json({ deleteUser });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  //this profile api is when subscription is added
  // profile: async (req, res) => {
  //   try {
  //     const vendor = await vendorModel.findOne({
  //       email: req.vendorEmail,
  //     });

  //     if (vendor) {
  //       var bills = [],
  //         savedCards = [],
  //         billsFound = [],
  //         daysLeft;

  //       const { pageNo, rows } = req.body.invoiceData,
  //         payDetails = await subDetailsModel.find({
  //           vendorMail: req.vendorEmail,
  //         }),
  //         cards = await cardModel.find({ vendorMail: req.vendorEmail });

  //       daysLeft =
  //         Math.floor(
  //           (payDetails[payDetails.length - 1].endDate - new Date()) / 86400000
  //         ) >= 0
  //           ? Math.floor(
  //               (payDetails[payDetails.length - 1].endDate - new Date()) /
  //                 86400000
  //             )
  //           : 0;

  //       payDetails.forEach((v) => {
  //         v.subStatus.forEach((val) => {
  //           var getDiff = billsFound.push({
  //             date: moment.utc(v.startDate).format("MMMM DD,YYYY"),
  //             amount: v.amount,
  //             status: val,
  //             pdf: v.invoicePdf,
  //             endDate: moment.utc(v.endDate).format("MMMM DD,YYYY"),
  //           });
  //         });
  //       });

  //       if (billsFound.length > 0) {
  //         bills = billsFound.filter((v, i) => {
  //           if (
  //             v.date.includes(`${req.query.search}`) ||
  //             String(v.amount).includes(`${req.query.search}`) ||
  //             v.details.includes(`${req.query.search}`) ||
  //             v.endDate.includes(`${req.query.search}`) ||
  //             v.status.includes(`${req.query.search}`)
  //           )
  //             return v;
  //         });
  //         bills = bills.splice((pageNo - 1) * rows, rows);
  //       }

  //       return res.json({
  //         status: Boolean(true),
  //         email: vendor.email,
  //         name: vendor.name,
  //         sub: vendor.subscription,
  //         bills: bills.reverse(),
  //         cards,
  //         daysLeft,
  //         totalLength: billsFound.length,
  //       });
  //     }
  //   } catch (error) {
  //     return commonHelpers.somethingWentWrong(error, res);
  //   }
  // },

  profile: async (req, res) => {
    try {
      const vendor = await vendorModel.findOne({
        email: req.vendorEmail,
      });
      if (vendor) {
        return res.json({
          status: Boolean(true),
          message: "Vendor Profile Data",
          data: vendor,
        });
      } else {
        return res.json({
          status: Boolean(false),
          message: "No vendor profile data found",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getVendor: async (req, res) => {
    try {
      const vendor = await vendorModel.findOne({
        email: req.body.userData.email,
      });
      if (vendor) return res.json({ vendor });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  test: async (req, res) => {
    try {
      id = req.body.id;
      const sub = await stripeHelper.retrieveSubscription(id);
      const inv = await stripeHelper.retrieveIN(sub?.latest_invoice);
      const pi = await stripeHelper.retrievePI(inv?.payment_intent);
      return res.json({ sub, inv, pi });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  emilss: async (req, res) => {
    const mails = await letterModel.find();

    data = mails.map((v) => v.email);
    data2 = [];
    data3 = [];
    data.filter((v) => {
      if (!data2.includes(v)) data2.push(v);
    });
    data2.forEach((v, i) => {
      mails.forEach((val, ind) => {
        if (val.email == v) {
          data3[val] = { code: val.airportCode, name: val.airportName };
        }
      });
    });

    return res.json({ data3 });
  },

  getSubsription: async (req, res) => {
    try {
      let getdetails = await vendorModel.find({ email: req.email });

      if (getdetails) {
        res.json({ status: Boolean, data: getdetails.subscription });
      } else {
        res.json({ status: false, message: "No vendor found with this email" });
      }
    } catch (err) {
      return commonHelpers.somethingWentWrong(err, res);
    }
  },
};

module.exports = vendorController;
