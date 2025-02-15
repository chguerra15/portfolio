const width = 1000, height = 600;
const margin = { top: 20, right: 40, bottom: 50, left: 60 };

// Append SVG for scatterplot
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#f9f9f9");

// Load data and create visualizations
async function loadData() {
    try {
        let data = await d3.csv('loc.csv', d => ({
            datetime: new Date(d.datetime),
            hourFrac: +d.hourFrac,
            length: +d.length,
            file: d.file,
            author: d.author
        }));
        
        console.log("CSV Data Loaded:", data);
        
        createScatterplot(data);
        createSummaryTable(data);
    } catch (error) {
        console.error("Error loading CSV:", error);
    }
}

// Create scatterplot
function createScatterplot(commits) {
    console.log("✅ Creating Scatterplot with Data:", commits);

    if (commits.length === 0) {
        console.error("❌ No commits to display.");
        return;
    }

    // Define X and Y scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([24, 0])  // Flip Y-axis so 00:00 is at the bottom
        .range([height - margin.bottom, margin.top]);

    // Radius scale
    const [minLines, maxLines] = d3.extent(commits, d => d.length);
    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([3, 20]);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    // Add grid lines
    const gridlines = svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(${margin.left}, 0)`);

    gridlines.call(
        d3.axisLeft(yScale)
            .tickSize(-width + margin.right + margin.left)
            .tickFormat("")
    );

    // Scatterplot dots
    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.length))
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.7)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
            d3.select(this)
                .transition().duration(200)
                .attr("fill-opacity", 1)
                .attr("r", rScale(d.length) * 1.3);
        })
        .on("mouseleave", function (event, d) {
            d3.select(this)
                .transition().duration(200)
                .attr("fill-opacity", 0.7)
                .attr("r", rScale(d.length));
        });
}

// Create summary table
function createSummaryTable(data) {
    const summaryDiv = d3.select("#summary");

    const stats = [
        { label: "Commits", value: data.length },
        { label: "Files", value: d3.group(data, d => d.file).size },
        { label: "Total LOC", value: d3.sum(data, d => d.length).toLocaleString() },
        { label: "Authors", value: d3.group(data, d => d.author).size },
        { label: "Days Worked", value: d3.group(data, d => d.datetime.toDateString()).size }
    ];

    summaryDiv.selectAll(".summary-item")
        .data(stats)
        .enter()
        .append("div")
        .attr("class", "summary-item")
        .html(d => `
            <div class="summary-label">${d.label}</div>
            <div class="summary-value">${d.value}</div>
        `);
}

// Run script when page loads
document.addEventListener("DOMContentLoaded", loadData);
