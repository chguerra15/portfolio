let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedCommits = [];
let data = [];
let commits = [];
let filteredCommits = [];
let brushSelection = null;
let commitProgress = 100;
let commitMaxTime;
let timeScale;
let NUM_ITEMS = 100; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 30; // Feel free to change
let VISIBLE_COUNT = 10; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
 const scrollTop = scrollContainer.property('scrollTop');
 let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
 startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
 renderItems(startIndex);
});


const width = 450;
const height = 420;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };


let xScale, yScale, rScale;


function renderItems(startIndex) {
   // ✅ Ensure it removes previous commit divs
   itemsContainer.selectAll('div').remove();


   const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
   let visibleCommits = commits.slice(startIndex, endIndex);


   updateScatterplot(visibleCommits);


   itemsContainer.selectAll('div')
       .data(visibleCommits)
       .enter()
       .append('div')
       .attr('class', 'item')
       .style('position', 'relative')
       .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
       .html(d => `
           <p>
               <strong>${new Date(d.datetime).toLocaleString("en", {dateStyle: "full", timeStyle: "short"})}</strong><br>
               <a href="${d.url}" target="_blank">
                   ${d.index > 0 ? 'another glorious commit' : 'one of my commits, and it was glorious'}
               </a><br>
               Edited <b>${d.totalLines}</b> lines across
               <b>${d3.rollups(d.lines, D => D.length, d => d.file).length}</b> files.
           </p>
       `);
}






function updateSummary(commits) {
   console.log("Updating summary with commits:", commits); // Debugging output


   if (!commits || commits.length === 0) {
       console.warn("No commit data available!");
       return;
   }


   document.getElementById("total-commits").textContent = commits.length;


   // ✅ Fix: Extract unique files properly from commits
   const allFiles = commits.flatMap(commit => commit.lines.map(line => line.file));
   document.getElementById("total-files").textContent = new Set(allFiles).size;


   document.getElementById("total-loc").textContent = commits.reduce((sum, c) => sum + c.totalLines, 0);
   document.getElementById("max-depth").textContent = Math.max(...commits.map(c => c.depth || 0));
   document.getElementById("longest-line").textContent = Math.max(...commits.map(c => c.length || 0));
   document.getElementById("max-lines").textContent = Math.max(...commits.map(c => c.totalLines || 0));
}


document.addEventListener("DOMContentLoaded", async () => {
   await loadData(); // ✅ Load commits & summary
});




async function loadData() {
   data = await d3.csv('loc.csv', (row) => ({
       ...row,
       line: Number(row.line),
       depth: Number(row.depth),
       length: Number(row.length),
       date: new Date(row.date + 'T00:00' + row.timezone),
       datetime: new Date(row.datetime),
       file: row.file,
       type: row.file.split('.').pop()
   }));


   processCommits(); 


   // ✅ Adjust scroll height dynamically after loading commits
   const totalHeight = commits.length * ITEM_HEIGHT;
   spacer.style('height', `${totalHeight}px`);


   initializeTimeScale(); 
   filterCommitsByTime(); 
   updateScatterplot(commits);
   updateFileList();
   updateSummary(commits);
}








function processCommits() {
    commits = d3.groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            return {
                id: commit,
                url: `https://github.com/YOUR_REPO/commit/${commit}`,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
                lines: lines,
            };
        })
        .sort((a, b) => d3.ascending(a.datetime, b.datetime)); // ✅ Sort by datetime (Oldest to Newest)
}



function initializeTimeScale() {
   if (!commits.length) return;


   timeScale = d3.scaleTime()
       .domain(d3.extent(commits, d => d.datetime))
       .range([0, 100]);


   commitMaxTime = timeScale.invert(commitProgress);
}


function filterCommitsByTime() {
   filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
}


function updateScatterplot(filteredCommits) {
   d3.select("#chart svg").remove(); // ✅ Clear existing scatter plot


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


   // ✅ Add a white background rectangle
   svg.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", width)
       .attr("height", height)
       .attr("fill", "white");


   xScale = d3.scaleTime()
       .domain(d3.extent(filteredCommits, d => d.datetime))
       .range([usableArea.left, usableArea.right])
       .nice();


   yScale = d3.scaleLinear()
       .domain([0, 24])
       .range([usableArea.bottom, usableArea.top]);


   const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
   rScale = d3.scaleSqrt()
       .domain([minLines, maxLines])
       .range([3, 20]);


   svg.append("g")
       .attr("class", "gridlines")
       .attr("transform", `translate(${usableArea.left}, 0)`)
       .call(d3.axisLeft(yScale).tickSize(-usableArea.width).tickFormat(""));


   svg.append("g")
       .attr("transform", `translate(0,${usableArea.bottom})`)
       .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")));


   svg.append("g")
       .attr("transform", `translate(${usableArea.left},0)`)
       .call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));


   const dots = svg.append("g").attr("class", "dots");


   dots.selectAll("circle")
       .data(filteredCommits)
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
           updateTooltipVisibility(false);
       });


   const brush = d3.brush()
       .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
       .on("start brush end", brushed);


   svg.append("g").attr("class", "brush").call(brush);
}




function brushed(evt) {
   brushSelection = evt.selection;
   selectedCommits = !brushSelection
     ? []
     : filteredCommits.filter((commit) => {
         let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
         let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
         let x = xScale(commit.datetime);
         let y = yScale(commit.hourFrac);
          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
       });


   updateSelection();
}


function updateSelection() {
   d3.selectAll("circle").classed("selected", d => selectedCommits.includes(d));
}


function updateTimeDisplay() {
   commitProgress = Number(document.getElementById("commitSlider").value);
   commitMaxTime = timeScale.invert(commitProgress);
   document.getElementById("commitTime").textContent = commitMaxTime.toLocaleString();


   filterCommitsByTime();
   updateScatterplot(filteredCommits);
   updateFileList(); // 🔹 Ensure unit visualization updates dynamically
}




function updateFileList(startIndex = 0) {
    let endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
    let visibleCommits = commits.slice(startIndex, endIndex); // 🔥 Only take visible commits

    let lines = visibleCommits.flatMap(d => d.lines);
  
    let files = d3.groups(lines, d => d.file)
        .map(([name, lines]) => ({ name, lines }))
        .sort((a, b) => d3.descending(a.lines.length, b.lines.length)); // Sort files by line count

    let filesContainer = d3.select(".files");

    filesContainer.selectAll("div").remove(); // Clear existing files

    let fileItems = filesContainer.selectAll("div")
        .data(files)
        .enter()
        .append("div");

    fileItems.append("dt")
        .append("code")
        .text(d => d.name)
        .append("small")
        .style("display", "block")
        .style("opacity", "0.7")
        .text(d => `${d.lines.length} lines`);

    fileItems.append("dd")
        .selectAll("div")
        .data(d => d.lines)
        .enter()
        .append("div")
        .attr("class", "line")
        .style("background", d => fileTypeColors(d.type)); // 🔹 Apply color scale based on file type
}








function updateTooltipContent(commit) {
   const tooltip = document.getElementById("commit-tooltip");
   if (!commit.id) return;


   tooltip.querySelector("#commit-link").href = commit.url;
   tooltip.querySelector("#commit-link").textContent = commit.id;
   tooltip.querySelector("#commit-date").textContent = commit.datetime?.toLocaleString("en", { dateStyle: "full" });
   tooltip.querySelector("#commit-time").textContent = commit.time;
   tooltip.querySelector("#commit-author").textContent = commit.author;
   tooltip.querySelector("#commit-lines").textContent = commit.totalLines;
}


function updateTooltipVisibility(isVisible) {
   document.getElementById("commit-tooltip").hidden = !isVisible;
}


function updateTooltipPosition(event) {
   const tooltip = document.getElementById("commit-tooltip");
   tooltip.style.left = `${event.clientX}px`;
   tooltip.style.top = `${event.clientY}px`;
}


function displayStats() {
   d3.select("#total-commits").text(commits.length);
   d3.select("#total-files").text(d3.group(data, d => d.file).size);
   d3.select("#total-loc").text(data.length);
   d3.select("#max-depth").text(d3.max(data, d => d.depth));
   d3.select("#longest-line").text(d3.max(data, d => d.length));
   d3.select("#max-lines").text(d3.max(data, d => d.line));
}


document.addEventListener("DOMContentLoaded", async () => {
   await loadData();
});


let NUM_FILE_ITEMS = 100;
let FILE_ITEM_HEIGHT = 30;
let FILE_VISIBLE_COUNT = 10;
let totalFileHeight = (NUM_FILE_ITEMS - 1) * FILE_ITEM_HEIGHT;


const fileScrollContainer = d3.select('#file-scroll-container');
const fileSpacer = d3.select('#file-spacer');
fileSpacer.style('height', `${totalFileHeight}px`);
const fileItemsContainer = d3.select('#file-items-container');


scrollContainer.on("scroll", () => {
    const scrollTop = scrollContainer.property("scrollTop");
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));

    renderItems(startIndex);
    updateFileList(startIndex); // 🔥 Now updates files with visible commits
});



function renderFileItems(startIndex) {
   fileItemsContainer.selectAll('div').remove();


   const endIndex = Math.min(startIndex + FILE_VISIBLE_COUNT, commits.length);
   let newFileSlice = commits.slice(startIndex, endIndex);


   updateFileBarChart(newFileSlice);


   fileItemsContainer.selectAll('div')
       .data(newFileSlice)
       .enter()
       .append('div')
       .attr('class', 'file-item')
       .style('position', 'relative')
       .style('top', (_, idx) => `${idx * FILE_ITEM_HEIGHT}px`)
       .html(d => `
           <p>
               <strong>${new Date(d.datetime).toLocaleString("en", {dateStyle: "full", timeStyle: "short"})}</strong><br>
               Edited <b>${d.totalLines}</b> lines in
               <b>${d3.rollups(d.lines, D => D.length, d => d.file).length}</b> files.
           </p>
       `);
}


const fileNarrativeSections = d3.selectAll(".scroll-text");
let currentStep = 0;


function handleScroll() {
   let scrollPosition = fileNarrative.node().getBoundingClientRect().top;


   let step = Math.floor((-scrollPosition) / 100);
   step = Math.max(0, Math.min(step, fileNarrativeSections.size() - 1));


   if (step !== currentStep) {
       currentStep = step;
       updateFileBarChart(step);
       highlightTextStep(step);
   }
}


function highlightTextStep(step) {
   fileNarrativeSections.classed("active", (_, i) => i === step);
}


d3.select("#file-narrative").on("scroll", handleScroll);


function updateFileBarChart(step) {
   d3.select("#file-bar-chart svg").remove();


   const svg = d3.select("#file-bar-chart").append("svg")
       .attr("width", width)
       .attr("height", height);


   const filteredData = commits.slice(0, (step + 1) * 5); // Show more commits with each step


   const xScale = d3.scaleTime()
       .domain(d3.extent(filteredData, d => d.datetime))
       .range([margin.left, width - margin.right]);


   const yScale = d3.scaleLinear()
       .domain([0, d3.max(filteredData, d => d.totalLines)])
       .range([height - margin.bottom, margin.top]);


   svg.selectAll("rect")
       .data(filteredData)
       .join("rect")
       .attr("x", d => xScale(d.datetime))
       .attr("y", d => yScale(d.totalLines))
       .attr("width", 10)
       .attr("height", d => height - margin.bottom - yScale(d.totalLines))
       .attr("fill", "green");
}


















