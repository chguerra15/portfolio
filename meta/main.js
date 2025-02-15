// Global variables
let data = [];
let commits = [];
let brushSelection = null;

// Scatterplot dimensions
const width = 900;
const height = 500;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };

// Define scales globally so they can be accessed in brush functions
let xScale, yScale, rScale;

// ✅ Load and process CSV data
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), 
        depth: Number(row.depth), 
        length: Number(row.length), 
        date: new Date(row.date + 'T00:00' + row.timezone), 
        datetime: new Date(row.datetime),
    }));

    processCommits();
    displayStats();
    createScatterplot(); // ✅ Call scatterplot function after data loads
}

// ✅ Process commit data
function processCommits() {
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

        return {
            id: commit,
            url: 'https://github.com/YOUR_REPO/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60, 
            totalLines: lines.length,
            lines: lines,
        };
    });
}

// ✅ Create scatterplot visualization
function createScatterplot() {
    if (!commits.length) return; // Ensure commits data exists

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // ✅ Define scales
    xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    // Scale for circle size (lines edited)
    const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
    rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([3, 20]); // Adjust for better visibility

    // ✅ Append gridlines (Y-axis)
    svg.append('g')
        .attr("class", "gridlines")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickSize(-usableArea.width).tickFormat(""));

    // ✅ Append axes
    svg.append("g")
        .attr("transform", `translate(0,${usableArea.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")));

    svg.append("g")
        .attr("transform", `translate(${usableArea.left},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));

    // ✅ Append dots for each commit
    const dots = svg.append("g").attr("class", "dots")
        .selectAll("circle")
        .data(commits.sort((a, b) => d3.descending(a.totalLines, b.totalLines))) // Ensure larger dots are behind
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.totalLines))
        .attr("fill", "steelblue")
        .attr("opacity", 0.7)
        .on("mouseenter", function (event, d) {
            d3.select(event.currentTarget).style("fill-opacity", 1);
            updateTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on("mouseleave", function () {
            d3.select(event.currentTarget).style("fill-opacity", 0.7);
            updateTooltipContent({});
            updateTooltipVisibility(false);
        });

    // ✅ Brushing (Selection)
    const brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
        .on("start brush end", brushed);

    svg.append("g").attr("class", "brush").call(brush);

    // ✅ 🔥 FIX TOOLTIP ISSUE: Raise circles ABOVE the brush overlay
    svg.select(".dots").raise(); 
    // Or, if this doesn't work, raise circles directly:
    svg.selectAll("circle").raise(); 
}


// ✅ Brush function
function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateLanguageBreakdown();
}

// ✅ Check if commit is selected
function isCommitSelected(commit) {
    if (!brushSelection) return false;

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);

    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

// ✅ Update selection state
function updateSelection() {
    d3.selectAll("circle").classed("selected", d => isCommitSelected(d));
}

// ✅ Update tooltip
function updateTooltipContent(commit) {
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const lines = document.getElementById("commit-lines");

    if (!commit.id) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", { dateStyle: "full" });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

// ✅ Tooltip visibility
function updateTooltipVisibility(isVisible) {
    document.getElementById("commit-tooltip").hidden = !isVisible;
}

// ✅ Tooltip positioning
function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// ✅ Update selection count
function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    document.getElementById("selection-count").textContent = `${selectedCommits.length || "No"} commits selected`;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const lines = selectedCommits.flatMap((d) => d.lines);

    // Count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Convert to sorted array
    const sortedBreakdown = Array.from(breakdown).sort((a, b) => b[1] - a[1]);

    // Get total lines
    const totalLines = d3.sum(sortedBreakdown, d => d[1]);

    // Render stats
    container.innerHTML = `
        <p class="commit-count">${selectedCommits.length} commits selected</p>
        <div class="language-grid">
            ${sortedBreakdown.map(([language, count]) => {
                let proportion = count / totalLines;
                let formatted = d3.format('.1~%')(proportion);
                return `
                    <div class="language-item">
                        <p class="lang-name">${language.toUpperCase()}</p>
                        <p class="lang-lines">${count} lines</p>
                        <p class="lang-percent">(${formatted})</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}


// ✅ Display summary stats
function displayStats() {
    processCommits();
    d3.select("#total-commits").text(commits.length);
    d3.select("#total-files").text(d3.group(data, d => d.file).size);
    d3.select("#total-loc").text(data.length);
    d3.select("#max-depth").text(d3.max(data, d => d.depth));
    d3.select("#longest-line").text(d3.max(data, d => d.length));
    d3.select("#max-lines").text(d3.max(data, d => d.line));
}

// ✅ Run functions when page loads
document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});