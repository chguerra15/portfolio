const width = 1000, height = 500;
const margin = { top: 40, right: 40, bottom: 50, left: 60 };

// Append SVG for scatterplot
const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Tooltip setup
const tooltip = d3.select("#tooltip");

// Load data and create visualization
async function loadData() {
    try {
        let data = await d3.csv("loc.csv");

        // Convert datetime and ensure hourFrac is within 0-24 range
        data.forEach(d => {
            d.datetime = new Date(d.datetime);
            d.hourFrac = +d.hourFrac * 24; // Ensure correct scaling
            d.totalLines = +d.length;
        });

        console.log("CSV Data Loaded:", data);

        createScatterplot(data);
        createSummaryTable(data);
    } catch (error) {
        console.error("Error loading CSV:", error);
        d3.select("#summary").append("p").text("Failed to load data.");
    }
}

function createScatterplot(commits) {
    console.log("✅ Creating Scatterplot with Data:", commits);

    if (commits.length === 0) {
        console.error("❌ No commits to display.");
        return;
    }

    // Define scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([24, 0]) // Flip Y-axis
        .range([height - margin.bottom, margin.top]);

    const rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
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

    // Gridlines
    svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickSize(-width + margin.right + margin.left).tickFormat(""));

    // Dots
    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.totalLines))
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.7)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer");
}

document.addEventListener("DOMContentLoaded", loadData);
