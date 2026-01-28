require('dotenv').config();
const mongoose = require('mongoose');
const Measurement = require('./models/measurement');

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI)
		console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1);
	}
};

const generateSampleData = () => {
	const data = [];
	const startDate = new Date('2024-10-01');
	const endDate = new Date('2024-10-31');

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Generate multiple measurements per day
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(currentDate);
      timestamp.setHours(i);

      data.push({
        timestamp,
        field1: parseFloat((Math.random() * 50 + 20).toFixed(2)), // Temperature (20-70)
        field2: parseFloat((Math.random() * 40 + 30).toFixed(2)), // Humidity (30-70)
        field3: parseFloat((Math.random() * 1000 + 300).toFixed(2)) // CO2 levels (300-1300)
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Measurement.deleteMany({});
    console.log('Existing data cleared');

    // Generate and insert sample data
    const sampleData = generateSampleData();
    await Measurement.insertMany(sampleData);
    console.log(`${sampleData.length} measurements inserted successfully`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();