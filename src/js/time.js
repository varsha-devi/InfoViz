var margin = { top: 100, right: 100, bottom: 40, left: 100 },
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]);

var y = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 1]);

var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.tsv('../data/income/FR.tsv', function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, d => +d.year));

  p50 = data.filter(d => +d.high == 0.5).sort((a, b) => +a.year - +b.year);

  p90 = data.filter(d => +d.high == 0.9).sort((a, b) => +a.year - +b.year);

  p95 = data.filter(d => +d.high == 0.95).sort((a, b) => +a.year - +b.year);

  var ts = d3
    .line()
    .x(function(d) {
      return x(+d.year);
    })
    .y(function(d) {
      return y(+d.cumul);
    });

  var l50 = svg
    .append('path')
    .datum(p50)
    .attr('d', ts)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  var l90 = svg
    .append('path')
    .datum(p90)
    .attr('d', ts)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  var l95 = svg
    .append('path')
    .datum(p95)
    .attr('d', ts)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  var l0 = svg
    .append('line')
    .attr('x1', x(d3.min(data, d => +d.year)))
    .attr('x2', x(d3.max(data, d => +d.year)))
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

  var l100 = svg
    .append('line')
    .attr('x1', x(d3.min(data, d => +d.year)))
    .attr('x2', x(d3.max(data, d => +d.year)))
    .attr('y1', y(1))
    .attr('y2', y(1))
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

  var xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));

  svg
    .append('g')
    .attr('transform', 'translate(0,' + (y(0) + 5) + ')')
    .call(xAxis);

  svg
    .append('text')
    .text('year')
    .attr('text-anchor', 'end')
    .attr('x', x(1))
    .attr('y', y(0) + 38);

  var yAxis = d3.axisRight(y);
  svg
    .append('g')
    .attr('transform', 'translate(' + (x(d3.max(data, d => +d.year)) + 5) + ')')
    .call(yAxis);

  svg
    .append('text')
    .text('share of income')
    .attr('transform', 'translate(' + (x(d3.max(data, d => +d.year)) + 45) + ',' + y(1) + ') rotate(-90)')
    .attr('text-anchor', 'end');

  svg
    .append('text')
    .text('share of population')
    .attr('transform', 'translate(' + (x(d3.min(data, d => +d.year)) - 45) + ',' + y(0.5) + ') rotate(-90)')
    .attr('text-anchor', 'middle');

  l = data.filter(d => (+d.high == 1) | (+d.high == 0.95) | (+d.high == 0.9) | (+d.high == 0.5)).filter(d => +d.year == 1970);

  lf = d3.format('.2p');
  svg
    .selectAll('.label')
    .data(l)
    .enter()
    .append('text')
    .text(d => lf(d.high))
    .attr('x', d => x(+d.year) - 5)
    .attr('y', d => y(+d.cumul))
    .attr('text-anchor', 'end');

  console.log(l);
});
