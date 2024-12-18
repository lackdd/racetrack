const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema
const variableSchema = new Schema({
    key: String,
    value: Schema.Types.Mixed, // Allows for any data type
});

// Create the model
const Variable = mongoose.model('Variable', variableSchema);

// Export the model
module.exports = Variable;
