const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js"); // require model for listing which we create
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js"); // require file from utils (means utility folder) to handle errors
const ExpressError = require("./utils/ExpressError.js"); // require express error file from utils (means utility folder) to handle express errors
const {listingSchema} = require("./schema.js");   // here require schema.js file for schema validation which is of object type

//--- connecting to DataBase start ---
const MONGO_URL = "mongodb://127.0.0.1:27017/roamsphere";

main()
  .then(() => {
    console.log("Connected to DataBase");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// setting up middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); // to use static files

//Basic api routes for the application.
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// making function for Joi to make it as an middleware for schema validation
const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error) {
    let errMsg = error.details.map(el => el.message).join(",");  // here we fetch the error msg from the error
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({}); // store all data from our database to allListings variable
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show route -- to get particular details of a single item
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params; // we get the id now find the item using this id
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post(
  "/listings", validateListing,
  wrapAsync(async (req, res) => {
    // let {title, description, image, price, country, location} = req.body;  // 1st way to featch the data from the form
    // let listing = req.body.listing; // 2nd way to fetch form data by making an object key in form inside new.ejs file
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }

    // here now we use our validation schema which we require from schema.js file to validate our schema

    //we define joi function above for validate schema to convert it to middleware
    // let result = listingSchema.validate(req.body);
    const newListing = new Listing(req.body.listing);

    // One way to validate schema is to write if for all the validations
    // but it is very much hectic if there are many validations and to write if for each validations
    // Another way is to use (joi) -> It is use to validate the schema

    // if(!newListing.description) {
    //     throw new ExpressError(400, "Description is required.");
    // }

    // if(!newListing.title) {
    //   throw new ExpressError(400, "Title is required.")
    // }

    // if(!newListing.location) {
    //   throw new ExpressError(400, "Location is required")
    // }

    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params; // we get the id now find the item using this id
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  // now our validation is done by joi function which is a middleware so no need to declare if by ourself  
  // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

// test listing
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: 'Sample Title',
//         description: 'By the Sea',
//         price: 130000.99,
//         location:  'Gulf of Genoa',
//         country: "SwitzerLand",
//     });

//     await sampleListing.save()
//             .then((res) => {
//                 console.log(res);
//             })
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// Express Error check for all route if match not found with any route then execute this
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//Middleware for handling errors
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", {message});
//   res.status(statusCode).send(message);
});

// server start and on port 8080
app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
