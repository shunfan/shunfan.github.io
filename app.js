let data;
let scatterplotSVG;
let pieChartSVG;
let barChartSVG;
let currentScene = 0;

async function loadCSV() {
  data = await d3.csv('https://raw.githubusercontent.com/shunfan/data-visualization-project/main/Forbes%20Billionaires.csv');
  paintFirstScene();
  paintSecondScene();
  paintThirdScene();
}

function handleSceneChange(sceneButton) {
  const sceneButtons = Array.from(document.getElementById('sidebar').children);
  const scenes = Array.from(document.getElementById('scene-container').children);
  const nthScene = sceneButtons.indexOf(sceneButton);

  for (let i = 0; i < sceneButtons.length; i += 1) {
    if (i === nthScene) {
      sceneButtons[i].classList = ['selected'];
    } else {
      sceneButtons[i].classList = [];
    }
  }

  for (let i = 0; i < sceneButtons.length; i += 1) {
    if (i === nthScene) {
      scenes[i].classList = ['scene selected'];
    } else {
      scenes[i].classList = ['scene'];
    }
  }

  currentScene = nthScene;
}

function handleNextScene() {
  currentScene += 1;

  if (currentScene >= 3) {
    currentScene = 0;
  }

  const sceneButtons = Array.from(document.getElementById('sidebar').children);
  handleSceneChange(sceneButtons[currentScene]);
}

function handleIndustryChange(industryOption) {
  const industry = industryOption.value;
  paintSecondScene(industry);
}

function handleCountryChange(countryOption) {
  const country = countryOption.value;
  paintThirdScene(country);
}

function countryToColor(country) {
  switch (country) {
    case 'United States':
      return '#08306b';
    case 'China':
      return '#0b4d94';
    case 'India':
      return '#1c6aaf';
    case 'Germany':
      return '#3787c0';
    case 'France':
      return '#59a1cf';
    case 'Hong Kong':
      return '#82badb';
    case 'Russia':
      return '#abcfe6';
    case 'Canada':
      return '#cadef0';
    case 'Australia':
      return '#e1edf8';
    case 'United Kingdom':
      return '#f7fbff';
    default:
      return '#ffffff';
  }
}

function paintFirstScene() {
  if (barChartSVG) barChartSVG.remove();

  // Process Data
  const countryMap = {}
  data.forEach(row => {
    const country = row['Country'];
    if (!countryMap[country]) {
      countryMap[country] = 0;
    }

    countryMap[country] += parseFloat(row['Networth']);
  })

  const sortedTopTenEntries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const xs = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).range([0, 500]);
  const ys = d3.scaleLinear().domain([0, 5000]).range([0, 500]);
  const xAxis = d3.scaleBand().domain(sortedTopTenEntries.map(entry => entry[0])).range([0, 500]);
  const yAxis = d3.scaleLinear().domain([0, 4800]).range([500, 0]);

  barChartSVG = d3
    .select('#scene-1')
    .append('svg')
    .attr('width', 800)
    .attr('height', 800);
  
  barChartSVG
    .append('g')
    .attr('transform', `translate(50, 50)`)
    .selectAll()
    .data(sortedTopTenEntries)
    .enter()
    .append('rect')
    .attr('x', (_, i) => xs(i))
    .attr('y', (d) => 500 - ys(d[1]))
    .attr('width', 33.3333)
    .attr('height', (d) => ys(d[1]))
    .attr('fill', (d) => countryToColor(d[0]));
  
  barChartSVG
    .append('g')
    .attr('transform', `translate(50, 50)`)
    .call(d3.axisLeft(yAxis));

  // Reference: https://d3-graph-gallery.com/graph/custom_axis.html
  barChartSVG
    .append('g')
    .attr('transform', `translate(50, 550)`)
    .call(d3.axisBottom(xAxis))
    .selectAll("text")
    .attr("transform", "translate(-10, 10) rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", 15)
    .style("fill", "#000000");
}

function paintSecondScene(industry) {
  const xs = d3.scaleLog().domain([15, 100]).range([0, 500]);
  const ys = d3.scaleLog().domain([1, 220]).range([0, 500]);
  const yAxis = d3.scaleLog().domain([1, 220]).range([500, 0]);

  if (scatterplotSVG) scatterplotSVG.remove();

  scatterplotSVG = d3
    .select('#scene-2')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600);

  scatterplotSVG
    .append('g')
    .attr('transform', 'translate(50,50)')
    .selectAll()
    .data(data)
    .enter()
    .append('circle')
    .filter((d) => { return industry ? d['Industry'].trim() === industry : true })
    .attr('cx', (d) => xs(parseInt(d['Age'])))
    .attr('cy', (d) => 500 - ys(parseFloat(d['Networth'])))
    .attr('r', () => 5)
    .style('fill', (d) => countryToColor(d['Country']))
    .style('stroke', '#000000');

  scatterplotSVG
    .append('g')
    .attr('transform', 'translate(50,50)')
    .call(d3.axisLeft(yAxis).tickValues([1, 2, 3, 4, 5, 10, 20, 50, 100, 220]).tickFormat(d3.format('~s')));

  scatterplotSVG
    .append('g')
    .attr('transform', 'translate(50,550)')
    .call(d3.axisBottom(xs).tickValues([15, 20, 30, 40, 50, 60, 70, 80, 90, 100]).tickFormat(d3.format('~s')));
}

function paintThirdScene(country) {
  if (pieChartSVG) pieChartSVG.remove();

  pieChartSVG = d3
    .select('#scene-3')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600);

  const color = [
    "#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33",
    "#a65628","#f781bf","#999999","#66c2a5","#fc8d62","#8da0cb",
    "#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3", "#8dd3c7"]

  // Process Data
  const industryMap = {}
  data.forEach(row => {
    if (!country || row['Country'] === country) {
      const industry = row['Industry'].trim();
      if (!industryMap[industry]) {
        industryMap[industry] = 0;
      }
  
      industryMap[industry] += parseFloat(row['Networth']);
    }
  })

  const pie = d3.pie().value((d) => d[1]);
  const sortedEntries = Object.entries(industryMap).sort((a, b) => b[1] - a[1])
  const pieData = pie(sortedEntries);
  const arc = d3.arc().innerRadius(0).outerRadius(300);

  pieChartSVG
    .append('g')
    .attr('transform', 'translate(300, 300)')
    .selectAll()
    .data(pieData)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (_, i) => color[i])

  // Add annotations
  // Reference: https://d3-graph-gallery.com/graph/pie_annotation.html
  pieChartSVG
    .append('g')
    .attr('transform', 'translate(300, 300)')
    .selectAll()
    .data(pieData)
    .enter()
    .append('text')
    .text((d, i) => i <= 8 ? d.data[0] : '...')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", 17);
}



loadCSV();
