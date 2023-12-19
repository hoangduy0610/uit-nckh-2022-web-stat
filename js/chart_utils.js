const createChart = ({ type, data, title, legend_position = 'bottom', show_legend = true, ctx }) => new Chart(ctx, {
    type: type,
    data: data,
    options: {
        responsive: true,
        title: {
            display: true,
            text: title,
            fontSize: 20
        },
        legend: {
            display: show_legend,
            position: legend_position,
            labels: {
                fontColor: '#000',
                fontSize: 14
            }
        },
        tooltips: {
            enabled: true
        }
    }
})

const makeChartToday = (emotion_label, today, token) => {
    $.ajax({
        url: `${API_URL}/logs?from_date=${today}&to_date=${today}`,
        method: 'GET',
        headers: {
            'x-access-token': token
        },
        success: function (response) {
            // Count emotion based on dominant_emotion
            const emotion_count = {
                happy: 0,
                neutral: 0,
                fear: 0,
                disgusting: 0,
                surprise: 0,
                sad: 0,
                angry: 0
            };
            response.data.forEach(log => {
                emotion_count[log.dominant_emotion] += 1;
            });
            // convert to array with order: happy, neutral, fear, disgusting, surprise, sad, angry
            const emotion_count_array = Object.values(emotion_count);
            // Calculate percentage
            const total = emotion_count_array.reduce((a, b) => a + b, 0);
            const emotion_percentage = emotion_count_array.map(count => (count / total * 100).toFixed(1));


            var gradient = document.getElementById('columnChart').getContext('2d').createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(0,48,143,1)');
            gradient.addColorStop(1, 'rgba(0,48,143,0)');

            const column_chart_data = {
                labels: emotion_label,
                datasets: [{
                    backgroundColor: gradient,
                    label: 'Amount',
                    data: [...emotion_count_array],
                    borderWidth: 1,
                    borderColor: 'rgba(0,48,143, 1)',
                    hoverBorderColor: '#000'
                }]
            };

            const pie_chart_data = {
                labels: emotion_label,
                datasets: [{
                    label: 'Percentage',
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(80, 200, 120, 0.7)',
                        'rgba(253, 127, 27, 0.7)',
                        'rgba(110, 110, 110, 0.7)',
                        'rgba(153, 0, 255, 0.7)'
                    ],
                    // backgroundColor: gradient2,
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(80, 200, 120, 1)',
                        'rgba(253, 127, 27, 1)',
                        'rgba(110, 110, 110, 1)',
                        'rgba(153, 0, 255, 1)'
                    ],
                    borderWidth: 1,
                    data: [...emotion_percentage]
                }]
            };

            const columnChart = createChart({
                type: 'bar',
                data: column_chart_data,
                title: 'Today Statistics',
                legend_position: 'bottom',
                show_legend: false,
                ctx: document.getElementById('columnChart').getContext('2d')
            });
            const pieChart = createChart({
                type: 'pie',
                data: pie_chart_data,
                title: 'Mood trend',
                legend_position: 'top',
                ctx: document.getElementById('pieChart').getContext('2d')
            });

            columnChart.canvas.parentNode.style.width = '100%';
            pieChart.canvas.parentNode.style.width = '100%';
        },
        error: function (error) {
            // Handle error response
            console.log(error);
        }
    });
}

const makeChartThisWeek = (emotion_label, from_date, to_date, token) => {
    // Call API to get data in this week
    $.ajax({
        url: `${API_URL}/logs?from_date=${from_date}&to_date=${to_date}`,
        method: 'GET',
        headers: {
            'x-access-token': token
        },
        success: function (response) {
            // Create array_date with YYYY-MM-DD format from from_date to today
            const array_date = [];
            const from_date_timestamp = new Date(from_date).getTime();
            const today_timestamp = new Date(to_date).getTime();
            for (let i = from_date_timestamp; i <= today_timestamp; i += 86400000) {
                const date = new Date(i);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                array_date.push(`${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`);
            }
            const emotion_count = {
                happy: [0, 0, 0, 0, 0, 0, 0],
                neutral: [0, 0, 0, 0, 0, 0, 0],
                fear: [0, 0, 0, 0, 0, 0, 0],
                disgusting: [0, 0, 0, 0, 0, 0, 0],
                surprise: [0, 0, 0, 0, 0, 0, 0],
                sad: [0, 0, 0, 0, 0, 0, 0],
                angry: [0, 0, 0, 0, 0, 0, 0]
            };
            response.data.forEach(log => {
                const date = new Date(log.created_at).toISOString().split('T')[0];
                const index = array_date.indexOf(date);
                emotion_count[log.dominant_emotion][index] += 1;
            });
            const dataset = [];
            let index_color = 0;
            for (const emotion in emotion_count) {
                const backgroundColor = [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(80, 200, 120, 0.2)',
                    'rgba(253, 127, 27, 0.2)',
                    'rgba(110, 110, 110, 0.2)',
                    'rgba(153, 0, 255, 0.2)'
                ];

                const borderColor = [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(80, 200, 120, 1)',
                    'rgba(253, 127, 27, 1)',
                    'rgba(110, 110, 110, 1)',
                    'rgba(153, 0, 255, 1)'
                ];

                dataset.push({
                    label: emotion_label[index_color],
                    backgroundColor: backgroundColor[index_color % backgroundColor.length],
                    borderColor: borderColor[index_color % borderColor.length],
                    borderWidth: 1,
                    data: [...emotion_count[emotion]]
                });
                index_color++;
            }

            const line_chart_data = {
                labels: [...array_date],
                datasets: [...dataset]
            };

            const lineChart = createChart({
                type: 'line',
                data: line_chart_data,
                title: 'This week',
                legend_position: 'bottom',
                ctx: document.getElementById('lineChart').getContext('2d')
            });
            lineChart.canvas.parentNode.style.width = '100%';
        },
        error: function (error) {
            // Handle error response
            console.log(error);
        }
    });
}