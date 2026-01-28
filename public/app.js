        let chart = null;

        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        async function fetchData() {
            const field = document.getElementById('field').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const chartType = document.getElementById('chartType').value;

            if (!startDate || !endDate) {
                showError('Please select both start and end dates');
                return;
            }

            showLoading(true);

            try {
                const response = await fetch(
                    `/api/measurements?field=${field}&start_date=${startDate}&end_date=${endDate}`
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to fetch data');
                }

                const result = await response.json();
                visualizeData(result, chartType);
                showLoading(false);
            } catch (error) {
                showError(error.message);
                showLoading(false);
            }
        }

        async function fetchMetrics() {
            const field = document.getElementById('field').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            showLoading(true);

            try {
                const response = await fetch(
                    `/api/metrics?field=${field}&start_date=${startDate}&end_date=${endDate}`
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to fetch metrics');
                }

                const metrics = await response.json();
                displayMetrics(metrics);
                showLoading(false);
            } catch (error) {
                showError(error.message);
                showLoading(false);
            }
        }

        function displayMetrics(metrics) {
            document.getElementById('count').textContent = metrics.count;
            document.getElementById('average').textContent = metrics.average;
            document.getElementById('minimum').textContent = metrics.minimum;
            document.getElementById('maximum').textContent = metrics.maximum;
            document.getElementById('stdDev').textContent = metrics.standardDeviation;
            document.getElementById('statsContainer').style.display = 'grid';
        }

        function visualizeData(result, chartType) {
            const ctx = document.getElementById('dataChart').getContext('2d');

            const labels = result.data.map(item => 
                new Date(item.timestamp).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    hour12: false
                }).replace(',', '')
            );
            const values = result.data.map(item => item[result.field]);

            if (chart) {
                chart.destroy();
            }

            chart = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: result.field,
                        data: values,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: chartType === 'bar' ? 
                            'rgba(75, 192, 192, 0.5)' : 
                            'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `${result.field} Time Series (${result.start_date} to ${result.end_date})`
                        }
                    }
                }
            });
        }