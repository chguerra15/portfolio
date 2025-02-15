const width = 900, height = 500;
const margin = { top: 20, right: 40, bottom: 50, left: 60 };

// Select chart container
const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "hidden");

// Load Data
async function loadData() {
    try {
        let data = await d3.csv('loc.csv', d => ({
            datetime: new Date(d.datetime),
            hourFrac: +d.hourFrac * 24, // Ensure proper mapping
            totalLines: +d.length
        }));

        createScatterplot(data);
    } catch (error) {
        console.error("Error loading CSV:", error);
    }
}

// Scatterplot Function
function createScatterplot(commits) {
    console.log("✅ Creating Scatterplot with Data:", commits);

    if (commits.length === 0) {
        console.error("❌ No commits to display.");
        return;
    }

    // Define Scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([24, 0])  // Flip Y-axis (00:00 at bottom)
        .range([height - margin.bottom, margin.top]);

    // Radius Scale
    const rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
        .range([3, 20]);

    // Add Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d'))); // Fix X-axis labels

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}:00`)); // Fix Y-axis labels

    // Add Gridlines
    svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickSize(-width + margin.right + margin.left).tickFormat(""));

    // Scatterplot Dots
    svg.append("g").attr("class", "dots")
        .selectAll("circle")
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

// Load Data on Page Load
document.addEventListener('DOMContentLoaded', loadData);
