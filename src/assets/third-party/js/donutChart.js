/* https://bl.ocks.org/mbhall88/22f91dc6c9509b709defde9dc29c63f2 */

import * as d3 from 'd3'
import filter from 'lodash.filter'

/* eslint-disable */
export default function donutChart() {
    var data = [],
        width,
        height,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        colour = d3.scaleOrdinal(d3.schemeCategory20c), // colour scheme
        variable, // value in data that will dictate proportions on chart
        category, // compare data by
        padAngle, // effectively dictates the gap between slices
        transTime, // transition time
        updateData,
        getOptions,
        floatFormat = d3.format('.4r'),
        toolTipHTML,
        cornerRadius, // sets how rounded the corners are on each slice
        percentFormat = d3.format(',.2%'),
        handleSliceClick,
        defaultCenterInfo;

    function chart(selection) {
        selection.each(function() {
            // generate chart
            // ===========================================================================================
            // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
            var radius = Math.min(width, height) / 2;

            // creates a new pie generator
            var pie = d3.pie()
                .value(function(d) { return d[variable]; })
                // .value(function(d) { return floatFormat(d[variable]); })
                .sort(null);

            // contructs and arc generator. This will be used for the donut. The difference between outer and inner
            // radius will dictate the thickness of the donut
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            // this arc is used for aligning the text labels
            var outerArc = d3.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);
            // ===========================================================================================

            // ===========================================================================================
            // append the svg object to the selection
            // var svg = selection.append('svg')
            var svg = selection.append('svg')
                // .attr('width', width + margin.left + margin.right)
                // .attr('height', height + margin.top + margin.bottom)
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

            // ===========================================================================================

            // ===========================================================================================
            // g elements to keep elements within svg modular
            svg.append('g').attr('class', 'slices');
            svg.append('g').attr('class', 'labelName');
            svg.append('g').attr('class', 'lines');
            // ===========================================================================================

            // ===========================================================================================
            // add and colour the donut slices
            var path = svg.select('.slices')
                .selectAll('path')
                .data(pie(data))
              .enter().append('path')
                .attr('fill', function(d) { return colour(d.data[category]); })
                .attr('d', arc);
            // ===========================================================================================

            // ===========================================================================================
            // add text labels
            var label = svg.select('.labelName').selectAll('text')
                .data(pie(data))
                .enter().append('text')
                .attr('dy', '.35em')
                .html(updateLabelText)
                .attr('transform', labelTransform)
                .style('text-anchor', function(d) {
                    // if slice centre is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                });
            // ===========================================================================================

            // ===========================================================================================
            // add lines connecting labels to slice. A polyline creates straight lines connecting several points

            var polyline = svg.select('.lines')
                .selectAll('polyline')
                .data(pie(data))
                .enter().append('polyline')
                .attr('points', calculatePoints);
            // ===========================================================================================

            // ===========================================================================================
            // add tooltip to mouse events on slices
            d3.selectAll('.labelName text, .slices path').call(toolTip);
            // add click event to slices
            d3.selectAll('.labelName text, .slices path').call(handleClick);
            // ===========================================================================================

            // ===========================================================================================
            // FUNCTION TO UPDATE CHART
            updateData = function() {
                var updatePath = d3.select('.slices').selectAll('path');
                var updateLines = d3.select('.lines').selectAll('polyline');
                var updateLabels = d3.select('.labelName').selectAll('text');

                // remove all items which do not have a value set
                data = filter(data, function(item) {
                  return !!item[variable];
                });

                var data0 = path.data(), // store the current data before updating to the new
                    data1 = pie(data);

                // update data attached to the slices, labels, and polylines. the key function assigns the data to
                // the correct element, rather than in order of how the data appears. This means that if a category
                // already exists in the chart, it will have its data updated rather than removed and re-added.
                updatePath = updatePath.data(data1, key);
                updateLines = updateLines.data(data1, key);
                updateLabels = updateLabels.data(data1, key);

                // adds new slices/lines/labels
                updatePath.enter().append('path')
                    .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
                    .attr('fill', function(d) {  return colour(d.data[category]); })
                    .attr('d', arc);

                updateLines.enter().append('polyline')
                    .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
                    .attr('stroke', function(d) { return colour(d.data[category]); })
                    .attr('points', calculatePoints);

                updateLabels.enter().append('text')
                    .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
                    .html(updateLabelText)
                    .attr('transform', labelTransform)
                    .style('text-anchor', function(d) { return (midAngle(d)) < Math.PI ? 'start' : 'end'; });

                // removes slices/labels/lines that are not in the current dataset
                updatePath.exit()
                    .transition()
                    .duration(transTime)
                    .attrTween("d", arcTween)
                    .remove();

                updateLines.exit()
                    .transition()
                    .duration(transTime)
                    .attrTween("points", pointTween)
                    .remove();

                updateLabels.exit()
                    .remove();

                // animates the transition from old angle to new angle for slices/lines/labels
                updatePath.transition().duration(transTime)
                    .attrTween('d', arcTween);

                updateLines.transition().duration(transTime)
                    .attrTween('points', pointTween);

                updateLabels.transition().duration(transTime)
                    .attrTween('transform', labelTween)
                    .styleTween('text-anchor', labelStyleTween);

                updateLabels.html(updateLabelText); // update the label text

                // add tooltip to mouse events on slices
                d3.selectAll('.labelName text, .slices path').call(toolTip);
                // add click event to slices
                d3.selectAll('.labelName text, .slices path').call(handleClick);

            };
            // ===========================================================================================
            // Functions
            // calculates the angle for the middle of a slice
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

            // function that creates and adds the tool tip to a selected element
            function toolTip(selection) {
                // add tooltip (svg circle element) when mouse enters label or slice
                selection.on('mouseenter', function (data) {
                    d3.selectAll('.toolCircle').remove();
                    svg.append('foreignObject')
                        .attr('class', 'toolCircle')
                        .append('xhtml:div')
                        .html(toolTipHTML(data));
                });

                // remove the tooltip when mouse leaves the slice/label
                selection.on('mouseleave', function () {
                    d3.selectAll('.toolCircle').remove();
                    svg.append('foreignObject')
                        .attr('class', 'toolCircle')
                        .html(defaultCenterInfo) // add text to the circle.
                        .style('text-anchor', 'middle')
                });
            }

            function handleClick(selection) {
                selection.on('click', function (data) {
                    handleSliceClick(data)
                });
            }

            // calculate the points for the polyline to pass through
            function calculatePoints(d) {
                // see label transform function for explanations of these three lines.
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.92 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), outerArc.centroid(d), pos];
            }

            function labelTransform(d) {
                // effectively computes the centre of the slice.
                // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                var pos = outerArc.centroid(d);

                // changes the point to be on left or right depending on where label is.
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                pos[1] = pos[1] + 5
                return 'translate(' + pos + ')';
            }

            function updateLabelText(d) {
                const currencyFormat = getOptions().currency === 'btc' ? '$,.5f' : '$,.2f'
                return d.data[category] + ': <tspan>' + d3.format(currencyFormat)(d.data[variable]) + '</tspan>';
            }

            // function that calculates transition path for label and also it's text anchoring
            function labelStyleTween(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t){
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? 'start':'end';
                };
            }

            function labelTween(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t){
                    var d2  = interpolate(t),
                        pos = outerArc.centroid(d2); // computes the midpoint [x,y] of the centre line that would be
                    // generated by the given arguments. It is defined as startangle + endangle/2 and innerR + outerR/2
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1); // aligns the labels on the sides
                    pos[1] = pos[1] + 5
                    return 'translate(' + pos + ')';
                };
            }

            function pointTween(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t){
                    var d2  = interpolate(t),
                        pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            }

            // function to calculate the tween for an arc's transition.
            // see http://bl.ocks.org/mbostock/5100636 for a thorough explanation.
            function arcTween(d) {
                var i = d3.interpolate(this._current, d);
                this._current = i(0);
                return function(t) { return arc(i(t)); };
            }

            function findNeighborArc(i, data0, data1, key) {
                var d;
                return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
                    : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
                        : null;
            }
            // Find the element in data0 that joins the highest preceding element in data1.
            function findPreceding(i, data0, data1, key) {
                var m = data0.length;
                while (--i >= 0) {
                    var k = key(data1[i]);
                    for (var j = 0; j < m; ++j) {
                        if (key(data0[j]) === k) return data0[j];
                    }
                }
            }

            function key(d) {
                return d.data[category];
            }

            // Find the element in data0 that joins the lowest following element in data1.
            function findFollowing(i, data0, data1, key) {
                var n = data1.length, m = data0.length;
                while (++i < n) {
                    var k = key(data1[i]);
                    for (var j = 0; j < m; ++j) {
                        if (key(data0[j]) === k) return data0[j];
                    }
                }
            }

            // ===========================================================================================

        });
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.radius = function(value) {
        if (!arguments.length) return radius;
        radius = value;
        return chart;
    };

    chart.padAngle = function(value) {
        if (!arguments.length) return padAngle;
        padAngle = value;
        return chart;
    };

    chart.cornerRadius = function(value) {
        if (!arguments.length) return cornerRadius;
        cornerRadius = value;
        return chart;
    };

    chart.colour = function(value) {
        if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.variable = function(value) {
        if (!arguments.length) return variable;
        variable = value;
        return chart;
    };

    chart.category = function(value) {
        if (!arguments.length) return category;
        category = value;
        return chart;
    };

    chart.transTime = function(value) {
        if (!arguments.length) return transTime;
        transTime = value;
        return chart;
    };

    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.updateCenterInfo = function() {
        d3.selectAll('.toolCircle').remove();
        const g = d3.select('#chart svg g');
        g.append('foreignObject')
            .attr('class', 'toolCircle')
            .style('text-anchor', 'middle')
            .html(defaultCenterInfo);
    };

    chart.toolTipHTML = function(value) {
        if (!arguments.length) return false;
        toolTipHTML = value;
        return chart;
    };

    chart.defaultCenterInfo = function(value) {
        if (!arguments.length) return false;
        defaultCenterInfo = value;
        return chart;
    };

    chart.handleSliceClick = function(value) {
        if (!arguments.length) return false;
        handleSliceClick = value;
        return chart;
    };

    chart.getOptions = function(value) {
        if (!arguments.length) return false;
        getOptions = value;
        return chart;
    };

    return chart;
}
