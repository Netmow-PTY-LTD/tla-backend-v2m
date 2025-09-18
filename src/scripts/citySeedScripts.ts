import mongoose from "mongoose";
import { City } from "../app/module/Country/city.model";
import { citiesData } from "./data/citiesData";







async function insertCities() {
  try {
    await mongoose.connect("mongodb+srv://tla-db:ucTzNJuV5jmerx2U@rh-dev.enoq8.mongodb.net/tlaDB?retryWrites=true&w=majority&appName=rh-dev"); // adjust DB name
    console.log("Connected to MongoDB");

    await City.insertMany(citiesData);
    console.log("Cities inserted successfully");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error inserting cities:", error);
  }
}

insertCities();

// command 
// npx ts-node src/scripts/citySeedScripts.ts