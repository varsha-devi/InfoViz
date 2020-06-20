var margin = { top: 100, right: 100, bottom: 40, left: 100 },
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var x = d3
  .scaleLinear()
  .range([0, width])
  .domain([0, 1]);

var y = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 20]);

var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.tsv('../data/income/FR.tsv', function(error, data) {
  if (error) throw error;

  data = data.filter(d => +d.year == 2014);

  var g = svg
    .selectAll('.hist')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(+d.low))
    .attr('y', d => y(+d.share / +d.width))
    .attr('width', d => x(+d.high) - x(+d.low))
    .attr('height', d => y(0) - y(+d.share / +d.width));

  var xAxis = d3.axisBottom(x);
  svg
    .append('g')
    .attr('transform', 'translate(0,' + (y(0) + 5) + ')')
    .call(xAxis);

  svg
    .append('text')
    .text('share of population')
    .attr('text-anchor', 'end')
    .attr('x', x(1))
    .attr('y', y(0) + 38);

  var yAxis = d3.axisRight(y);
  svg
    .append('g')
    .attr('transform', 'translate(' + (x(1) + 5) + ')')
    .call(yAxis);

  svg
    .append('text')
    .text('share of income/population')
    .attr('transform', 'translate(' + (x(1) + 45) + ',' + y(20) + ') rotate(-90)')
    .attr('text-anchor', 'end');
});
