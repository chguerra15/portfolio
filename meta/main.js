document.addEventListener("DOMContentLoaded", function() {
    d3.csv("loc.csv").then(function(data) {
        data.forEach(d => {
            d.datetime = new Date(d.time);
            d.hourFrac = d.datetime.getHours() + d.datetime.getMinutes() / 60;
            d.lines = +d.lines;
        });

        createScatterplot(data);
        createSummary(data);
    }).catch(error => {
        console.error("Error loading data:", error);
        d3.select("#summary").html("Failed to load data.");
    });
});

function createScatterplot(commits) {
    const width = 1000;
    const height = 600;

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue');
}

function createSummary(data) {
    const summaryData = {
        commits: data.length,
        files: new Set(data.map(d => d.file)).size,
        totalLoc: d3.sum(data, d => d.lines),
        maxDepth: d3.max(data, d => d.depth),
        longestLine: d3.max(data, d => d.lines),
        maxLines: d3.max(data, d => d.lines)
    };

    const summaryContainer = d3.select("#summary");
    summaryContainer.html(`
        <div class='summary-item'><div class='summary-label'>COMMITS</div><div class='summary-value'>${summaryData.commits}</div></div>
        <div class='summary-item'><div class='summary-label'>FILES</div><div class='summary-value'>${summaryData.files}</div></div>
        <div class='summary-item'><div class='summary-label'>TOTAL LOC</div><div class='summary-value'>${summaryData.totalLoc}</div></div>
        <div class='summary-item'><div class='summary-label'>MAX DEPTH</div><div class='summary-value'>${summaryData.maxDepth}</div></div>
        <div class='summary-item'><div class='summary-label'>LONGEST LINE</div><div class='summary-value'>${summaryData.longestLine}</div></div>
        <div class='summary-item'><div class='summary-label'>MAX LINES</div><div class='summary-value'>${summaryData.maxLines}</div></div>
    `);
}
