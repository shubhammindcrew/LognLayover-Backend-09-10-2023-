const { json } = require("express");
const moment = require("moment");
const bcrypt = require("bcrypt");
const { airportModel, vendorModel } = require("../models/index");
const userModel = require("../models/user");
const { registerValidation } = require("../JoiValidations/register");
const { loginValidation } = require("../JoiValidations/login");
const {
  forgetPasswordValidation,
} = require("../JoiValidations/forgetPassword");
const {
  confirmPasswordValidation,
} = require("../JoiValidations/confirmPassResetOtp");
const { BlogValidation } = require("../JoiValidations/blogs");
const { BASE_URL } = require("../config");
const { somethingWentWrong } = require("../helpers/common-helpers");
const mongoose = require("mongoose");
const {
    sign,
    forgotPassword,
    stripeHelper,
    commonHelpers,
    upload,
    deleteFile,
  } = require("../helpers"),
  { destinationModel, letterModel, blogModel } = require("../models");
const { IMAGEURL } = require("../config/index");
userController = {
  getDestinations: async (req, res) => {
    try {
      const data = await destinationModel
        .find({
          $or: [
            { airportName: req.body.airportName },
            { airportCode: req.body.airportCode },
          ],
        })
        .sort({ _id: -1 });

      data.forEach((destData) => {
        destData.images.forEach((image) => {
          image.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${image.name}`;
        });
      });

      data.forEach((destData) => {
        destData.coverImage.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${destData.coverImage.name}`;
      });

      if (data.length > 0) {
        var featuredDestination = "";
        var popularDestination = "";
        return res.json({ status: Boolean(true), data });
      } else
        return res.json({
          status: Boolean(false),
          message: "No destinations found near selected Airport",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getAirports: async (req, res) => {
    try {
      airports = await airportModel.find();
      // if ((req.query.search).trim() == "") return res.json({ status: Boolean(false), message: 'No airports found' })
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

  filterDestinations: async (req, res) => {
    try {
      let data = await destinationModel
        .find({
          $or: [
            { airportName: req.body.airportName },
            { airportCode: req.body.airportCode },
          ],
        })
        .sort({ _id: -1 });

      if (data) {
        data.forEach((destData) => {
          destData.images.forEach((image) => {
            image.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${image.name}`;
          });
        });

        data.forEach((destData) => {
          destData.coverImage.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${destData.coverImage.name}`;
        });
        let filterData = data.filter((v) => {
          var getRadius =
            v.waysToReach[0].mode == "driving" ||
            "walking" ||
            "train" ||
            "bus" ||
            "subway"
              ? v.waysToReach[0].data[0].elements[0].distance.text.split(" ")[0]
              : 1.5;

          if (
            req.body.filterData.radius == "all" &&
            req.body.filterData.category == "all"
          ) {
            return v;
          } else if (
            req.body.filterData.radius == "all" &&
            !req.body.filterData.category
          ) {
            return v;
          } else if (
            req.body.filterData.category == "all" &&
            !req.body.filterData.radius
          ) {
            return v;
          } else if (
            req.body.filterData.radius == "all" &&
            req.body.filterData.category
          ) {
            return req.body.filterData.category == v.category;
          } else if (
            req.body.filterData.category == "all" &&
            req.body.filterData.radius
          ) {
            return getRadius <= Number(req.body.filterData.radius);
          } else if (
            req.body.filterData.category &&
            !req.body.filterData.radius
          ) {
            return v.category == req.body.filterData.category;
          } else if (
            req.body.filterData.radius &&
            !req.body.filterData.category
          ) {
            return getRadius <= Number(req.body.filterData.radius);
          } else if (
            req.body.filterData.radius &&
            req.body.filterData.category
          ) {
            return (
              getRadius <= Number(req.body.filterData.radius) &&
              req.body.filterData.category == v.category
            );
          }
        });
        res.json({
          status: Boolean(true),
          message: "filter data",
          data: filterData,
          length: filterData.length,
        });
      } else {
        res.json({
          status: Boolean(false),
          message: "No destination under this airport",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getDestination: async (req, res) => {
    try {
      const data = await destinationModel
        .find({
          $or: [
            { airportName: req.body.keyword },
            { airportCode: req.body.keyword },
          ],
        })
        .sort({ _id: -1 });
      if (data.length > 0) return res.json({ status: Boolean(true), data });
      else
        return res.json({
          status: Boolean(false),
          message: "No destinations found near selected Airport",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getSingleDestination: async (req, res) => {
    try {
      //here id is destination id;
      let getDestinationId = req.params.id;
      if (!mongoose.isValidObjectId(getDestinationId)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }

      let getDestination = await destinationModel.findOne({
        _id: getDestinationId,
      });
      getDestination.coverImage.imageURL = `${IMAGEURL}/destination-images/${getDestination._id}/${getDestination.coverImage.name}`;

      getDestination.images.forEach((data) => {
        data.imageURL = `${IMAGEURL}/destination-images/${getDestination._id}/${data.name}`;
      });
      if (getDestination) {
        res.json({
          status: Boolean(true),
          message: "Destination details",
          data: getDestination,
        });
      } else {
        res.json({
          status: Boolean(false),
          message: "No destination found with this id",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  subscribeToWeeklyELetter: async (req, res) => {
    try {
      const { email, airportCode, airportName } = req.body,
        data = await letterModel.findOne({ email, airportCode, airportName });
      if (data)
        return res.json({
          status: Boolean(false),
          message: "Already Subscribed",
        });
      else {
        const sub = await new letterModel({
          email,
          airportCode,
          airportName,
        }).save();
        if (sub)
          return res.json({
            status: Boolean(true),
            message: "Subscribed successfully",
          });
        else {
          res.json({
            status: Boolean(false),
            message: "Subscription failed",
          });
        }
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getELetterSubscribers: async (req, res) => {
    try {
      const data = await letterModel.find();
      return res.json({ data });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  //In this we are making popular the destination of airport based on total number of click on this particular destination which is click shown in frontend
  //We are popular the destination based on TotalReads we are increasing the totalreads and that make the destiantion popular
  popularingDestinationsByClick: async (req, res) => {
    try {
      let destinationId = req.body.destinationId;
      if (!mongoose.isValidObjectId(destinationId)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }

      let getDestination = await destinationModel.findOne({
        _id: destinationId,
      });
      if (getDestination) {
        let updateHits = await destinationModel.findOneAndUpdate(
          { _id: getDestination._id },
          { totalReads: getDestination.totalReads + 1 },
          { new: true }
        );

        res.json({ status: Boolean(true), updateHits });
      } else {
        res.json({
          status: Boolean(false),
          message: "No Destination found with this id",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  //get all popular destination of airport based on those whose who has maximum totalReads from high to low
  getAllPopularDestination: async (req, res) => {
    try {
      let getDestination = await destinationModel
        .find({
          $or: [
            { airportName: req.body.airportName },
            { airportCode: req.body.airportCode },
          ],
        })
        .sort({ totalReads: -1 });
      getDestination.forEach((destData) => {
        destData.images.forEach((image) => {
          image.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${image.name}`;
        });
      });

      getDestination.forEach((destData) => {
        destData.coverImage.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${destData.coverImage.name}`;
      });

      if (getDestination) {
        res.json({
          status: Boolean(true),
          data: getDestination,
          length: getDestination.length,
        });
      } else {
        res.json({ status: false, message: "No popular destination found" });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getAllPopularDestinationByCategoryAndRadius: async (req, res) => {
    try {
      let getDestination = await destinationModel
        .find({
          $or: [
            { airportName: req.body.airportName },
            { airportCode: req.body.airportCode },
          ],
        })
        .sort({ totalReads: -1 });
      getDestination.forEach((destData) => {
        destData.images.forEach((image) => {
          image.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${image.name}`;
        });
      });

      getDestination.forEach((destData) => {
        destData.coverImage.imageURL = `${IMAGEURL}/destination-images/${destData._id}/${destData.coverImage.name}`;
      });

      if (getDestination) {
        let filterData = getDestination.filter((v) => {
          var getRadius =
            v.waysToReach[0].mode == "driving" ||
            "walking" ||
            "train" ||
            "bus" ||
            "subway"
              ? v.waysToReach[0].data[0].elements[0].distance.text.split(" ")[0]
              : 1.5;

          if (
            req.body.filterData.radius == "all" &&
            req.body.filterData.category == "all"
          ) {
            return v;
          } else if (
            req.body.filterData.radius == "all" &&
            !req.body.filterData.category
          ) {
            return v;
          } else if (
            req.body.filterData.category == "all" &&
            !req.body.filterData.radius
          ) {
            return v;
          } else if (
            req.body.filterData.radius == "all" &&
            req.body.filterData.category
          ) {
            return req.body.filterData.category == v.category;
          } else if (
            req.body.filterData.category == "all" &&
            req.body.filterData.radius
          ) {
            return getRadius <= Number(req.body.filterData.radius);
          } else if (
            req.body.filterData.category &&
            !req.body.filterData.radius
          ) {
            return v.category == req.body.filterData.category;
          } else if (
            req.body.filterData.radius &&
            !req.body.filterData.category
          ) {
            return getRadius <= Number(req.body.filterData.radius);
          } else if (
            req.body.filterData.radius &&
            req.body.filterData.category
          ) {
            return (
              getRadius <= Number(req.body.filterData.radius) &&
              req.body.filterData.category == v.category
            );
          }
        });

        res.json({
          status: Boolean(true),
          message: "filter data",
          data: filterData,
          length: filterData.length,
        });
      } else {
        res.json({
          status: false,
          message: "No popular destination found With this Data",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getLatestBlogs: async (req, res) => {
    const { airportName, airportCode } = req.body;
    try {
      let getBlogByLatestDate = await blogModel
        .find({
          $or: [
            {
              "nearbyLocation.name": airportName,
            },
            {
              "nearbyLocation.code": airportCode,
            },
          ],
        })
        .sort({ createdAt: -1 });

      getBlogByLatestDate.forEach((data) => {
        data.blogImage.imageURL = `${IMAGEURL}/blog-images/${data.blogImage.name}`;
      });

      if (getBlogByLatestDate) {
        return res.json({
          status: Boolean(true),
          message: "All latest blogs",
          data: getBlogByLatestDate,
        });
      } else {
        return res.json({
          status: Boolean(false),
          message: "No latest blog found",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getSingleBlog: async (req, res) => {
    try {
      let blogId = req.params.id;
      if (!mongoose.isValidObjectId(blogId)) {
        // If the ID is invalid, throw an error
        return res.json({
          status: false,
          message: "Invalid Id",
        });
      }
      let getBlog = await blogModel.findOne({ _id: blogId });
      getBlog.blogImage.imageURL = `${IMAGEURL}/blog-images/${getBlog.blogImage.name}`;
      if (getBlog) {
        return res.json({
          status: Boolean(true),
          message: "Blog details",
          data: getBlog,
        });
      } else {
        return res.json({
          status: Boolean(false),
          message: "No Blog found with this id",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  // when we hit any post api to add data of destination or blog either by user or vendor in local change
  // file path must be like this ./public in file-helper and ./public in code of add blog,edit blog,destination also but
  // whenever upload the code on live need to use ../public path in file-helper and in code check onces while upload on live
  // because it must in ../public not ./public

  userRegistration: async (req, res) => {
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
        const emailFound = await userModel.find({ email: email });
        const vendorEmail = await vendorModel.find({ email: email }),
          date = new Date();

        if (emailFound.length > 0) {
          return res.json({
            status: Boolean(false),
            message: "User already exist with this email",
          });
        } else if (vendorEmail.length > 0) {
          return res.json({
            status: Boolean(false),
            message: "Vendor already exists with this email",
          });
        } else if (password.length >= 8) {
          const token = await sign(email, password, date);
          const hash = await bcrypt.hash(password, 8),
            user = new userModel({
              name,
              email,
              password: hash,
            }),
            saveData = await user
              .save()
              .catch((error) => commonHelpers.somethingWentWrong(error, res));
          return res.json({
            status: Boolean(true),
            data: saveData,
            message: "User registered successfully",
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

  userLogin: async (req, res) => {
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
        const userFound = await userModel.findOne({ email });
        if (userFound) {
          hash = await bcrypt.compare(password, userFound.password);
          if (hash) {
            const token = await sign(email, password, date);

            data = {
              email: userFound.email,
              token: token,
            };

            return res.json({
              status: Boolean(true),
              message: "Login Successfull",
              token: token,
              name: userFound.name,
              email: email,
              role: userFound.role,
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

  userForgetPassword: async (req, res) => {
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
        user = await userModel.findOne({ email: req.body.email });

      if (user) {
        codeSent = await forgotPassword({ to: req.body.email, code });
        if (codeSent) {
          const updateUser = await userModel.findOneAndUpdate(
            { email: req.body.email },
            { code },
            { new: true, runValidators: true }
          );
          if (updateUser)
            return res.json({
              status: Boolean(true),
              message: "OTP sent successfully",
              code: updateUser.code,
            });
          else
            return res.json({
              status: Boolean(false),
              message: "OTP not sent",
            });
        }
      } else {
        res.json({ status: Boolean(false), message: "User not found" });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  userConfirmPassword: async (req, res) => {
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
        vendor = await userModel.findOne({ email, code });
      if (vendor) {
        const hash = await bcrypt.hash(password, 8);
        if (hash) {
          const userUpdate = await userModel.findOneAndUpdate(
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

  //Add blogs by user
  addBlogByUser: async (req, res) => {
    try {
      upload(req, res, async (errors) => {
        if (errors) {
          console.log(errors);
          return commonHelpers.somethingWentWrong(errors, res);
        }

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
            let url1 = `./public/blog-images/${req.files.blog_image[i].filename}`;
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
              userEmail: req.userEmail,
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

  allBlogsByUser: async (req, res) => {
    try {
      const { pageNo, rows } = req.body.blogData;

      var blog = await blogModel
          .find({ userEmail: req.userEmail })
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
            v.description
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase()) ||
            v.datePosted
              .toLowerCase()
              .includes(`${req.query.search}`.toLowerCase())
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

  //api for check user-profile
  userProfile: async (req, res) => {
    try {
      let data = await userModel.findOne({ email: req.userEmail });
      if (data) {
        return res.json({
          status: true,
          message: "User profile",
          data: { fullName: data.name, email: data.email },
        });
      } else {
        return res.json({ status: false, message: "No user found" });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  getSingleBlogOfUser: async (req, res) => {
    try {
      //here id is blog id.
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
          status: true,
          message: "blog detail",
          data: getBlog,
        });
      } else {
        return res.json({
          status: false,
          message: "No blog found with this id",
        });
      }
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  deleteBlogOfUser: async (req, res) => {
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
      } else
        return res.json({
          status: Boolean(false),
          message: "Blog(s) not found",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },

  editBlogByUser: async (req, res) => {
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
                imageURL: `${IMAGEURL}/blog-images/${fileName}`,
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
};

module.exports = userController;
