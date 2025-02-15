async function loadData() {
    try {
        let data = await d3.csv("loc.csv");
        data.forEach(d => {
            d.datetime = new Date(d.time);
            d.hourFrac = d.datetime.getHours() + d.datetime.getMinutes() / 60;
            d.lines = +d.length;
        });
        return data;
    } catch (error) {
        console.error("Error loading CSV:", error);
        d3.select("#summary").append("p").text("Failed to load data.");
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const data = await loadData();
    createScatterplot(data);
    createSummary(data);
});

function createScatterplot(commits) {
    if (!commits.length) return;

    const width = 1000;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#fff")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, width - margin.left - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - margin.top - margin.bottom, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(24).tickFormat(d => `${d}:00`));

    const circles = svg.selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => Math.sqrt(d.lines) * 2 + 3)
        .attr("fill", "steelblue")
        .style("opacity", 0.7)
        .on("mouseover", function() {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "steelblue");
        });

    const brush = d3.brush()
        .extent([[0, 0], [width - margin.left - margin.right, height - margin.top - margin.bottom]])
        .on("brush", brushed);

    svg.append("g").call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        circles.attr("fill", d => {
            const isSelected =
                xScale(d.datetime) >= x0 && xScale(d.datetime) <= x1 &&
                yScale(d.hourFrac) >= y0 && yScale(d.hourFrac) <= y1;
            return isSelected ? "red" : "steelblue";
        });
    }
}
