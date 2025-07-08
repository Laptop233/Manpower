document.addEventListener('DOMContentLoaded', function() {
            const apiUrl = 'https://raw.githubusercontent.com/Laptop233/Manpower/main/data.json'; // Updated URL based on debugging
            const loadingMessage = document.getElementById('loading-message');
            const tableContainer = document.getElementById('table-container');
            const errorMessageDiv = document.getElementById('error-message');
            const dateFilterInput = document.getElementById('dateFilterInput');
            const podFilterInput = document.getElementById('podFilterInput');

            let allPodsData = []; // Store the original fetched data for filtering

            // Function to display an error message
            function showErrorMessage(message) {
                loadingMessage.classList.add('hidden'); // Hide loading
                errorMessageDiv.textContent = `Error: ${message}`;
                errorMessageDiv.classList.remove('hidden');
                tableContainer.innerHTML = ''; // Clear table area
            }

            // Function to build and display the table
            function displayPodsAsTable(data, dateFilterText = '', podFilterText = '') {
                tableContainer.innerHTML = ''; // Clear existing table

                if (!data || data.length === 0) {
                    tableContainer.innerHTML = '<p class="text-gray-600 p-4">No pod data available.</p>';
                    return;
                }

                // Filter the data based on both date and pod filters
                const lowerCaseDateFilterText = dateFilterText.toLowerCase().trim();
                const lowerCasePodFilterText = podFilterText.toLowerCase().trim();

                const filteredData = data.filter(pod => {
                    // Ensure that pod.Date and pod.POD exist before calling toLowerCase
                    const podDate = pod.Date ? String(pod.Date).toLowerCase() : '';
                    const podPod = pod.POD ? String(pod.POD).toLowerCase() : '';

                    const matchesDate = podDate.includes(lowerCaseDateFilterText);
                    const matchesPod = podPod.includes(lowerCasePodFilterText);
                    return matchesDate && matchesPod;
                });

                if (filteredData.length === 0) {
                    tableContainer.innerHTML = '<p class="text-gray-600 p-4">No matching pods found.</p>';
                    return;
                }

                // Create table elements
                const table = document.createElement('table');
                table.className = 'min-w-full bg-white';

                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');

                // Create table header row
                const headerRow = document.createElement('tr');
                const headers = ["Date", "POD", "QA audits", "Errors", "External Reported", "Errors %"];
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    th.className = 'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider';
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                // Populate table body with filtered data
                filteredData.forEach(pod => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50';

                    // Calculate Errors % (ensure values are numbers)
                    const qaAudits = parseInt(pod.QA_audits || 0); // Default to 0 if undefined/null
                    const errors = parseInt(pod.Errors || 0);     // Default to 0 if undefined/null

                    const errorsPercentage = qaAudits > 0 ?
                        ((errors / qaAudits) * 100).toFixed(2) + '%' :
                        '0.00%';

                    const cellData = [
                        pod.Date || '', // Use empty string if undefined/null
                        pod.POD || '',
                        pod.QA_audits || 0,
                        pod.Errors || 0,
                        pod.External_Reported || '',
                        errorsPercentage
                    ];

                    cellData.forEach(cellValue => {
                        const td = document.createElement('td');
                        td.textContent = cellValue;
                        td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });

                table.appendChild(thead);
                table.appendChild(tbody);
                tableContainer.appendChild(table);
            }

            // Function to apply filters and re-render the table
            function applyFilters() {
                const dateFilterValue = dateFilterInput.value;
                const podFilterValue = podFilterInput.value;
                displayPodsAsTable(allPodsData, dateFilterValue, podFilterValue);
            }

            // Add event listeners to filter inputs
            dateFilterInput.addEventListener('keyup', applyFilters);
            podFilterInput.addEventListener('keyup', applyFilters);

            // Fetch data when the DOM is fully loaded
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    allPodsData = data; // Store the original fetched data
                    loadingMessage.classList.add('hidden'); // Hide loading message
                    displayPodsAsTable(allPodsData); // Initial display of the table
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    showErrorMessage(error.message); // Display error on page
                });
        });
