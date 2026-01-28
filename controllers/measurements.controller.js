const Measurement = require('../models/measurement');

exports.getMeasurement = async (req, res) => {
	try {
		const { field, start_date, end_date } = req.query;

		const validFields = ['field1', 'field2', 'field3'];
		if (!field || !validFields.includes(field)) {
		return res.status(400).json({ 
			error: 'Invalid field name. Valid fields are: field1, field2, field3' 
		});
		}

		if (!start_date || !end_date) {
		return res.status(400).json({ 
			error: 'start_date and end_date are required' 
		});
		}

		const startDate = new Date(start_date);
		const endDate = new Date(end_date);
		endDate.setHours(23, 59, 59, 999);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
		return res.status(400).json({ 
			error: 'Invalid date format. Use YYYY-MM-DD format' 
		});
		}

		if (startDate > endDate) {
		return res.status(400).json({ 
			error: 'start_date must be before end_date' 
		});
		}

		const measurements = await Measurement.find({
		timestamp: {
			$gte: startDate,
			$lte: endDate
		}
		}).select(`timestamp ${field} -_id`).sort({ timestamp: 1 });

		if (measurements.length === 0) {
		return res.status(404).json({ 
			error: 'No data found in the specified range' 
		});
		}

		res.json({
			field,
			start_date,
			end_date,
			count: measurements.length,
			data: measurements
		});

	} catch (error) {
		res.status(500).json({ 
		error: 'Server error', 
		message: error.message 
		});
	}};

exports.getMetrics = async (req, res) => {
	try {
		const { field, start_date, end_date } = req.query;

		const validFields = ['field1', 'field2', 'field3'];
		if (!field || !validFields.includes(field)) {
		return res.status(400).json({ 
			error: 'Invalid field name. Valid fields are: field1, field2, field3' 
		});
		}

		let query = {};
		if (start_date && end_date) {
		const startDate = new Date(start_date);
		const endDate = new Date(end_date);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return res.status(400).json({ 
			error: 'Invalid date format. Use YYYY-MM-DD format' 
			});
		}

		query.timestamp = {
			$gte: startDate,
			$lte: endDate
		};
		}

		const measurements = await Measurement.find(query).select(`${field} -_id`);

		if (measurements.length === 0) {
		return res.status(404).json({ 
			error: 'No data found' 
		});
		}

		const values = measurements.map(m => m[field]);

		const sum = values.reduce((acc, val) => acc + val, 0);
		const average = sum / values.length;
		const minimum = Math.min(...values);
		const maximum = Math.max(...values);
		
		const squaredDiffs = values.map(val => Math.pow(val - average, 2));
		const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
		const standardDeviation = Math.sqrt(avgSquaredDiff);

		res.json({
		field,
		count: values.length,
		average: parseFloat(average.toFixed(2)),
		minimum,
		maximum,
		standardDeviation: parseFloat(standardDeviation.toFixed(2))
		});

	} catch (error) {
		res.status(500).json({ 
		error: 'Server error', 
		message: error.message 
		});
}};
