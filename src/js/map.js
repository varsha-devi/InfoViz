$.getJSON('../data/income_avg.json', function (data) {
  var current_country = null;
  let map_data = new Map();
  array = Object.values(data);
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    //If the element is in the array then we add the new data (year, gini)
    if (map_data.has(element['ISO3166-1-Alpha-3'])) {
      newValue = map_data.get(element['ISO3166-1-Alpha-3']);
      newValue[element['year']] = element['gini_index']; //add year - gini
      arr = Object.values(newValue);
      average = 0;
      arr.forEach(e => {
        if (typeof e === 'number') average = average + e;
      });
      average = average / arr.length;

      newValue['fillKey'] = average.toFixed(1);
      map_data.set(element['ISO3166-1-Alpha-3'], newValue);
    } else {
      newValue = Object();
      newValue[element['year']] = element['gini_index'];
      newValue['fillKey'] = element['gini_index'].toFixed(1);
      map_data.set(element['ISO3166-1-Alpha-3'], newValue);
    }
  }

  const xah_map_to_obj = aMap => {
    const obj = {};
    aMap.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  };
  data = xah_map_to_obj(map_data);

  // Initialize map
  var map = new Datamap({
    // The element we want to display the map in
    element: document.getElementById('container'),
    // React to changes in window size
    responsive: false,
    data: data,
    fills: {
      defaultFill: '#F2F2F2',
      0.4: '#A7E4F2',
      0.5: '#72DBF2',
      0.6: '#80D2F2',
      0.7: '#6DBFF2',
    },
    done: function (datamap) {

      datamap.svg.selectAll('.datamaps-subunit').on('mousedown', function (geo) {
        debugger;
        if (current_country != geo && current_country != null) {
          debugger;
          var group = getGroupOfBarchart();
          for (let i = 0; i <= group.length; i++) {
            group.item(0).remove();
          }
        }
        if (geo === current_country) {
          console.log('Do nothing');
          return;
        }
        else {
          updateBars(geo, map_data.get(geo.id));
          updateIncomeBars(geo);
        }
      });
    },
    geographyConfig: {
      borderColor: '#DEDEDE',
      highlightBorderWidth: 2,
      // don't change color on mouse hover
      highlightFillColor: function (geo) {
        return geo['fillColor'] || '#F5F5F5';
      },
      // only change border
      highlightBorderColor: '#B7B7B7',
      // show desired information in tooltip
      popupTemplate: function (geo, data) {
        // don't show tooltip if country don't present in dataset
        // tooltip content
        return [
          '<div class="hoverinfo">',
          '<div class="country-data"><strong>',
          geo.properties.name,
          '</strong><br/>',
          'x&#772;: ',
          data.fillKey,
          '</div>',
          '</div>'
        ].join('');
      }
    }
  });

  function convertToCSV(objArray) {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line != '') line += ',';

        line += array[i][index];
      }

      str += line + '\r\n';
    }

    return str;
  }

  function getGroupOfBarchart() {
    var container = document.getElementById('barchart');
    var groups = container.getElementsByTagName('svg');
    return groups;
  }

  function updateIncomeBars(selectedCountry) {
    var margin = { top: 20, right: 0, bottom: 20, left: 0 },
      width = 700 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg
      .axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient('left')
      .ticks(10);

    var svg = d3
      .select('#gini')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g');

    d3.json('../data/income_avg.json', function (error, incomes) {
      if (error) throw error;
      objects = []
      array = Object.values(incomes);
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        //If the element is in the array then we add the new data (year, gini)
        if (element['ISO3166-1-Alpha-3'] == selectedCountry.id) {
          object_aux = Object();
          object_aux.year = element['year']
          object_aux.average = element['average']
          objects.push(object_aux);
        }
      }
      x.domain(objects.map(function (d) { return d.year; }).sort(function(a, b){return a-b}));
      y.domain([0, d3.max(objects, function (d) { return d.average; })]);


      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(50,' + height + ')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.5em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

      svg
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(50,0)')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')

      svg
        .selectAll('bar')
        .data(objects)
        .enter()
        .append('rect')
        .attr('transform', 'translate(50,0)')
        .style('fill', '#90E6FF')
        .attr('x', function (d) {
          return x(d.year);
        })
        .attr('width', x.rangeBand())
        .attr('y', function (d) {
          return y(d.average);
        })
        .attr('height', function (d) {
          return height - y(d.average);
        });
    });
  }

  // Updates the bar chart
  function updateBars(selectedCountry, data) {
    current_country = selectedCountry;
    var margin = { top: 20, right: 0, bottom: 20, left: 0 },
      width = 700 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg
      .axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient('left')
      .ticks(10);

    var svg = d3
      .select('#average')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g');

    var keys = Object.keys(data);
    keys.pop(data.length);
    var values = Object.values(data);
    values.pop(data.length);

    x.domain(keys);
    y.domain([0, d3.max(values)]);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(50,' + height + ')')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.5em')
      .attr('dy', '-.55em')
      .attr('transform', 'rotate(-90)');

    svg
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(50,0)')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')

    var objects = [];
    for (let index = 0; index < keys.length; index++) {
      object_aux = Object();
      object_aux.year = keys[index];
      object_aux.gini = values[index];
      objects.push(object_aux);
    }

    svg
      .selectAll('bar')
      .data(objects)
      .enter()
      .append('rect')
      .attr('transform', 'translate(50,0)')
      .style('fill', '#7FE3EB')
      .attr('x', function (d) {
        return x(d.year);
      })
      .attr('width', x.rangeBand())
      .attr('y', function (d) {
        return y(d.gini);
      })
      .attr('height', function (d) {
        return height - y(d.gini);
      });
  }
});