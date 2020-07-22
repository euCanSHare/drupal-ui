  /*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

  'use strict';

  mica.ObibaGraphicCharts
    .controller('ChartController', ['$rootScope','$scope', 'GraphicChartsUtils', 'ChartType',
      function ($rootScope, $scope, GraphicChartsUtils, ChartType) {
        /**
         * Helper to test whether to show the chart title or not
         *
         * @returns {boolean}
         */
        var canShowTitle = function() {
          return $scope.type >= 0 && [ChartType.NUMBER_PARTICIPANTS, ChartType.BIO_SAMPLES, ChartType.STUDY_DESIGN, ChartType.START_YEAR].indexOf($scope.type) === -1;
        };

        $scope.chart = {};
        /**
         * Depending on the type of the chart, returns the corresponding options
         *
         * @param type
         */
        var graphs = GraphicChartsUtils.getGraphConfig();

        function getChartOptions(type) {
          switch (type) {
            case ChartType.GEO_CHARTS:
              $scope.chart = graphs['populations-model-selectionCriteria-countriesIso'];
              break;
            case ChartType.STUDY_DESIGN:
              $scope.chart =  graphs['model-methods-design'];
              break;
            case ChartType.NUMBER_PARTICIPANTS:
              $scope.chart =graphs['model-numberOfParticipants-participant-number-range'];
              break;
            case ChartType.BIO_SAMPLES:
              $scope.chart = graphs['populations-dataCollectionEvents-model-bioSamples'];
              break;
            case ChartType.START_YEAR:
              $scope.chart = graphs['model-startYear-range'];
              break;

            default:
              throw new Error('Invalid type: ' + type);
          }

        }

        $scope.canShowTitle = canShowTitle;
        $scope.$watch('type', function(type) {
          getChartOptions(type);
        });

    }])
    .controller('ChartBlockController', ['$rootScope','$scope', 'GraphicChartsUtils', '$timeout',
      function ($rootScope, $scope, GraphicChartsUtils, $timeout) {
        /**
         * Depending on the type of the chart, returns the corresponding options
         */
        $timeout(function(){
          var graphs = GraphicChartsUtils.getGraphConfig();

          var type = $scope.type;
        switch (type){
          case 'geoChart':
            $scope.graphConfig = graphs['populations-model-selectionCriteria-countriesIso'];
          break;
          case 'studiesDesigns':
            $scope.graphConfig =  graphs['model-methods-design'];
          break;
          case 'numberParticipants' :
            $scope.graphConfig =graphs['model-numberOfParticipants-participant-number-range'];
          break;
          case 'biologicalSamples' :
            $scope.graphConfig = graphs['populations-dataCollectionEvents-model-bioSamples'];
          break;
          case 'startYear':
            $scope.graphConfig = graphs['model-startYear-range'];
          break;

            default:
              throw new Error('Invalid type: ' + type);
          }
        });
    }])
    .controller('VariableCoverageChartController', ['$scope', '$location', 'CoverageResource', 'D3ChartConfig', '$translate', function ($scope, $location, CoverageResource, D3ChartConfig, $translate) {
      function normalizeData(data) {
        data.sort(function(prev, curr) {
          return prev.values.length - curr.values.length;
        }).sort(function(prev, curr) {
          if (prev.key > curr.key) {
            return 1;
          }
          if (prev.key < curr.key) {
            return -1;
          }
          return 0;
        });
        // template with zero value
        var zeroValues = data.reduce(function (prev, curr) {
          return prev.values.length > curr.values.length ? prev : curr;
        }).values.map(function (v) {
          return { key: v.key, title: v.title, notEllipsedTitle: v.notEllipsedTitle, value: 0 };
        });

        // values normalization
        data.forEach(function (d) {
          var normalized = [];
          zeroValues.forEach(function (z) {
            var item = d.values.filter(function (value) { return value.title === z.title; }).pop();
            if(item && (item.itemTerm && item.itemTerm.length > 0)){
              item.itemTerm.forEach(function(itemTerm){
                normalized.push({
                  key: z.key,
                  value: itemTerm ? itemTerm.value : 0,
                  title: itemTerm.term,
                  notEllipsedTitle: z.notEllipsedTitle,
                  notEllipsedTermTitle: itemTerm.notEllipsedTitle,
                  link: itemTerm ? itemTerm.link : null
                });
              });
            }
            else{
              normalized.push({
                key: z.key,
                value: item ? item.value : 0,
                title: z.title,
                notEllipsedTitle: z.notEllipsedTitle,
                link: item ? item.link : null
              });
            }
          });

          d.values = normalized;
        });
      }

      function doNormalizationByType(chartData, type) {
        var data = [];

        if (type !== 'variable') {
          chartData.map(function (d) { return d.key; }).filter(function (f, i, arr) {
            return arr.indexOf(f) === i;
          }).forEach(function (k) {
            data.push({key: k, values: chartData.filter(function (f) { return f.key === k; })});
          });

          normalizeData(data);
        } else {
          data = chartData;
        }

        return data;
      }

      function getLabelMargin(data, horizontalBarChar) {
        if(horizontalBarChar){
          var maxVal = 0;
          var text = document.createElement("span");
          // Technique to get Text with in svg pattern
          document.body.appendChild(text);
          text.style.font = "arial";
          text.style.fontSize = 14 + "px";
          text.style.height = 'auto';
          text.style.width = 'auto';
          text.style.position = 'absolute';
          text.style.whiteSpace = 'no-wrap';

          data.forEach(function(dataEntry){
            var currentValMax;
            currentValMax =  d3.max(dataEntry.itemTerm, function(d) {
              text.textContent = d.term;
              return Math.ceil(text.clientWidth);
            });
            maxVal = currentValMax > maxVal ? currentValMax : maxVal;
          });
          return maxVal;
        }
        else{
          return  d3.max(data, function(d) {
            return Math.ceil(d.title.length);
          });
        }
      }

      function processConfig(config, type, data, colors, showLegend, renderOptions) {
        var horizontalBarChar = (renderOptions.graphicChartType === "multiBarHorizontalChart") ? true : false;
        var labelMargin = getLabelMargin(data, horizontalBarChar);
        config.options.chart.margin = {
          left: 200,
          top:20,
          right:50,
          bottom:50
        };
        if (type === 'variable') {
          if (!showLegend) {
            config.options.chart.margin = {top: 0, right:0, bottom: 0, left: 0}
          }

          config.withType('pieChart');
          config.options.chart.legendPosition = 'right';
          config.options.chart.legend = {
            margin : {
              top: 0,
              right:15,
              bottom: 0,
              left: 15
            }
          };
          config.options.chart.multibar = false;
          config.options.chart.groupSpacing = false;
          config.options.chart.stacked = false;
          config.options.chart.showLegend = showLegend;
          config.options.chart.showLabels = true;
          config.options.chart.labelThreshold = 0.05;
          config.options.chart.labelType =  function (d) {
            var percent = (d.endAngle - d.startAngle) / (2 * Math.PI);
            return d3.format('.2%')(percent);
          };
        } else {
          config.options.chart.wrapLabels = false;
          // re-generate the tooltips bar chart
          config.options.chart.tooltip.contentGenerator = function (o) {
              var series = o.series[0];
              if (series === null) { return; }

              var s = '',
                notEllipsedTermTitle = '',
                bottom = '<span>' + series.key + ': <strong>' + series.value + '</strong></span>';
            if(o.data.notEllipsedTermTitle){
              notEllipsedTermTitle = '<strong>' + o.data.notEllipsedTermTitle + '</strong><br/>';
            }
              if (o.value) {
                s = '<strong>' + o.data.notEllipsedTitle + '</strong><br/>';
              }

              return '<div class="chart-tooltip">' + s + notEllipsedTermTitle + bottom + '</div>';
            };
          // Configure when the x- labels have to be wrap
          if (renderOptions.nbrStack > 3 && renderOptions.nbrStack <= renderOptions.numberBars) {
            config.options.chart.wrapLabels = true;
          }
          // configure when the x-labels have to be rotated withe margin in graphics
          if(renderOptions.graphicMargins){
            config.options.chart.margin = renderOptions.graphicMargins;
          }
          if ((renderOptions.nbrStack > renderOptions.numberBars) && (renderOptions.graphicChartType!=='multiBarHorizontalChart')) {
            config.options.chart.rotateLabels = renderOptions.rotateLabels;
            config.options.chart.margin.left = renderOptions.graphicMargins.left + labelMargin;
            config.options.chart.margin.bottom = renderOptions.graphicMargins.bottom + labelMargin;
          } else {
            config.options.chart.margin.left = renderOptions.horizontalBarCharMarginLeft + labelMargin;
            if(data.reduce((max, b) => Math.max(max, b.value), data[0].value) < 5){
              config.options.chart.yAxis.ticks = data[0].value;
            }
          }
          config.options.chart.staggerLabels = true;
          config.options.chart.showLegend = false;

        }
        config.options.chart.color = colors;
        config.options.chart.height = 500;
        if(renderOptions.graphicHeight){
          config.options.chart.height = renderOptions.graphicHeight + config.options.chart.margin.bottom + config.options.chart.margin.top;
        }
        if(renderOptions.graphicChartType){
          config.options.chart.type = renderOptions.graphicChartType;
        }

        config.options.chart.autoMargins = false;

      }

      // type and id
      var absUrl = $location.absUrl();
      var re = /mica\/([a-z_-]+)\/([^\/#]+)/;
      var found = absUrl.match(re);

      if (found) {
        var type = found[1], id = found[2];
        if (type.indexOf('dataset') !== -1) {
          type = 'dataset';
        }

        if (type === 'variable') {
          id = decodeURIComponent(id);
        }

        // resource query
        var result = CoverageResource.get({type: type, id: id});

        $scope.d3Configs = [];
        result.$promise.then(function (res) {
          if(res.code && res.code !== 200){
              $translate(['data-coverage-error']).then(function(translate){
              $scope.message = translate['data-coverage-error'] + ' ' + res.code + ' ' + res.message;
            });
          }

          if(res.charts){
            res.charts.forEach(function (chart) {
              var chartData = (chart.data && chart.data.length ? chart.data : chart.variableData);

              if (chartData && chartData.length) {
                var data = doNormalizationByType(chartData, type);
                var config = new D3ChartConfig().withData(data, true).withTitle(chart.title).withSubtitle(chart.subtitle);
                processConfig(config, type, chartData, chart.color.colors, chart.showLegend, chart.renderOptions);
                $scope.d3Configs.push(config);
              }
            });
          }
        });
      }
    }]);
