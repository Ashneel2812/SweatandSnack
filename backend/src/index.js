const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const questionnaireRoutes = require('./routes/questionarrieRoutes');
const regenerateRoutes = require('./routes/regenerateRoutes');
const planRoutes = require('./routes/planRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fitnessApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

app.use('/api', questionnaireRoutes);
app.use('/api', regenerateRoutes);
app.use('/api', planRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
