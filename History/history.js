// ES module import for D3 (if you are using <script type="module" src="history.js">)
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// If you're using a plain script tag, remove the above import and instead
// ensure <script src="https://d3js.org/d3.v7.min.js"></script> is loaded BEFORE this file.

// 1) MAIN FUNCTION - called on DOMContentLoaded
function initFileHistory() {
  // 1A) SELECT DOM ELEMENTS
  const chartContainer = d3.select("#chart-files");
  const stepSel = d3.selectAll("#items-container-files .step");

  // 1B) CREATE SVG
  const margin = { top: 20, right: 30, bottom: 30, left: 100 };
  const width = 600;
  const height = 500;
  const svg = chartContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // We'll store the data globally so updateChart can use it.
  let fileData = [];

  // 1C) SETUP THE OBSERVER
  const observerOptions = {
    root: null,
    threshold: 0.6 // step is "active" once 60% of it is visible
  };

  function onIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = +d3.select(entry.target).attr("data-index");
        updateChart(index);
      }
    });
  }
  const observer = new IntersectionObserver(onIntersect, observerOptions);

  stepSel.each(function(d, i) {
    d3.select(this).attr("data-index", i);
    observer.observe(this);
  });

  // 2) LOAD YOUR CSV (adjust filename or columns as needed)
  d3.csv("loc.csv").then(data => {
    // Convert size to numeric
    data.forEach(d => {
      d.size = +d.size;
    });
    fileData = data.sort((a,b) => d3.descending(a.size, b.size)); // biggest first

    // Draw initial chart (stepIndex = 0)
    updateChart(0);
  });

  // 3) FUNCTION: updateChart(stepIndex)
  //    We'll do a simple bar chart but highlight different subsets based on stepIndex
  function updateChart(stepIndex) {
    // We'll do one bar per file
    // For demonstration, let's highlight different subsets:
    //  - step 0: show all files
    //  - step 1: highlight largest 3
    //  - step 2: highlight smallest 3
    //  - step 3: revert to all

    let subset = fileData; // default is all files
    if (stepIndex === 1) {
      subset = fileData.slice(0, 3); // largest 3
    } else if (stepIndex === 2) {
      subset = fileData.slice(-3); // smallest 3
    } else if (stepIndex === 3) {
      subset = fileData; // all again
    }

    // SCALES
    const x = d3.scaleLinear()
      .domain([0, d3.max(subset, d => d.size) || 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(subset.map(d => d.filename))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    // DRAW AXES
    svg.selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(x).ticks(5));

    svg.selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // DRAW/UPDATE BARS
    const bars = svg.selectAll(".bar")
      .data(subset, d => d.filename); // key by filename

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", d => y(d.filename))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.size) - x(0))
      .attr("fill", "#333")
      .merge(bars)
      .transition()
      .duration(600)
      .attr("y", d => y(d.filename))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.size) - x(0));

    bars.exit().remove();
  }
}

// 4) KICK OFF ON DOM LOADED
document.addEventListener("DOMContentLoaded", initFileHistory);
