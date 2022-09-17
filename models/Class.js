import { DataTypes } from "sequelize";
import db from "../config/db.js";


const Class = db.define("classes", {
  nameCategory: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
});


export default Class