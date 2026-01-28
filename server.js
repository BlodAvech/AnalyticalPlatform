require('dotenv').config()
const express = require('express')
const path = require('path');
const connectDB = require('./config/db')
const measurementRoutes = require('./routes/measurements.routes')

const app = express()

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI;

connectDB(MONGODB_URI)

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.use('/api' , measurementRoutes)

app.get('/' , (req , res) => {
	res.sendFile(path.join(__dirname , "views" , "index.html"))
})

app.listen(PORT , () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
})