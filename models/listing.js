const mongoose = require("mongoose");
const Schema = mongoose.Schema; // we store mongoose.Schema in variable schema so that  it can be reused throughout our application without Writing (mongoose.Schema)

// Create schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1562663859-71a6ee73e65e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => 
            v === "" ? "https://images.unsplash.com/photo-1562663859-71a6ee73e65e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    }
});


//Now using above schema we are creating our model
const Listing = mongoose.model("Listing",  listingSchema);

// Exporting our model so that it can be used elsewhere in the application
module.exports = Listing;