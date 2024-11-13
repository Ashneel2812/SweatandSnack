const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const questionnaireRoutes = require('./routes/questionarrieRoutes');
const regenerateRoutes = require('./routes/regenerateRoutes');
const planRoutes = require('./routes/planRoutes');
const googleSheetRoutes = require('./routes/googleSheetRoutes');



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://dbUser:dbUserPassword@sweatandsnack.5nd6x.mongodb.net/SweatandSnack?retryWrites=true&w=majority&appName=SweatandSnack';

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDB();

app.use('/api', questionnaireRoutes);
app.use('/api', regenerateRoutes);
app.use('/api', planRoutes);
app.use('/api', googleSheetRoutes);

app.get('/home', (req, res) => {
  res.json({ message: 'Welcome to the SweatandSnack API!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Export the express app as a serverless function
// module.exports = (req, res) => {
//   app(req, res);
// };
