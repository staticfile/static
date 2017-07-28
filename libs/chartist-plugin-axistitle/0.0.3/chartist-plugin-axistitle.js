(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(["chartist"], function (Chartist) {
      return (root.returnExportsGlobal = factory(Chartist));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require("chartist"));
  } else {
    root['Chartist.plugins.ctAxisTitle'] = factory(Chartist);
  }
}(this, function (Chartist) {

  /**
   * Chartist.js plugin to display a title for 1 or 2 axes.
   * version 0.0.3
   * author: alex stanbury
   */
  /* global Chartist */
  (function (window, document, Chartist) {
      'use strict';

      var axisDefaults = {
          axisTitle: '',
          axisClass: 'ct-axis-title',
          offset: {
              x: 0,
              y: 0
          },
          textAnchor: 'middle',
          flipText: false
      };

      var defaultOptions = {
          xAxis: axisDefaults,
          yAxis: axisDefaults
      };

      var getTitle = function (title) {
          if (title instanceof Function) {
              return title();
          }
          return title;
      };

      var getClasses = function (classes) {
          if (classes instanceof Function) {
              return classes();
          }
          return classes;
      };

      Chartist.plugins = Chartist.plugins || {};
      Chartist.plugins.ctAxisTitle = function(options) {

          options = Chartist.extend({}, defaultOptions, options);

          return function ctAxisTitle(chart) {

              chart.on('created', function(data) {

                  if (!options.axisX.axisTitle && !options.axisY.axisTitle) {
                      throw new Error(
                          'ctAxisTitle plugin - You must provide at least one axis title'
                      );
                  } else if (!data.axisX && !data.axisY) {
                      throw new Error(
                          'ctAxisTitle plugin can only be used on charts that have at least one axis'
                      );
                  }

                  var xPos;
                  var yPos;
                  var title;

                  //position axis X title
                  if (options.axisX.axisTitle && data.axisX) {

                      xPos = (data.axisX.axisLength / 2) + data.options.axisY.offset +
                          data.options.chartPadding.left;

                      yPos = data.options.chartPadding.top;

                      if (data.options.axisY.position === 'end') {
                          xPos -= data.options.axisY.offset;
                      }

                      if (data.options.axisX.position === 'end') {
                          yPos += data.axisY.axisLength;
                      }

                      title = new Chartist.Svg("text");
                      title.addClass(getClasses(options.axisX.axisClass));
                      title.text(getTitle(options.axisX.axisTitle));
                      title.attr({
                          x: xPos + options.axisX.offset.x,
                          y: yPos + options.axisX.offset.y,
                          "text-anchor": options.axisX.textAnchor
                      });

                      data.svg.append(title, true);

                  }

                  //position axis Y title
                  if (options.axisY.axisTitle && data.axisY) {
                      xPos = 0;


                      yPos = (data.axisY.axisLength / 2) + data.options.chartPadding
                              .top;

                      if (data.options.axisX.position === 'start') {
                          yPos += data.options.axisX.offset;
                      }

                      if (data.options.axisY.position === 'end') {
                          xPos = data.axisX.axisLength;
                      }

                      var transform = 'rotate(' + (options.axisY.flipTitle ? -
                                  90 : 90) + ', ' + xPos + ', ' + yPos + ')';

                      title = new Chartist.Svg("text");
                      title.addClass(getClasses(options.axisY.axisClass));
                      title.text(getTitle(options.axisY.axisTitle));
                      title.attr({
                          x: xPos + options.axisY.offset.x,
                          y: yPos + options.axisY.offset.y,
                          transform: transform,
                          "text-anchor": options.axisY.textAnchor
                      });
                      data.svg.append(title, true);
                  }
              });
          };
      };
  }(window, document, Chartist));

  return Chartist.plugins.ctAxisTitle;

}));
