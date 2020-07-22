(function ($) {

  "use strict";

  /**
   * Constructor
   * @constructor
   */
  $.MicaTimeline = function (dtoParser, popupIdFormatter, useBootstrapTooltip, seedModal) {
    this.parser = dtoParser;
    this.popupIdFormatter = popupIdFormatter;
    this.useBootstrapTooltip = useBootstrapTooltip;
    this.seedModal = seedModal;
  };

  /**
   * Class method definition
   * @type {{create: create}}
   */
  $.MicaTimeline.prototype = {

    create: function (selectee, studyDto) {
      var clone = jQuery.extend(true,{} , studyDto);
      if (this.parser === null || clone === null) return;
      var timelineData = this.parser.parse(clone);
      if (timelineData) createTimeline(this, timelineData, selectee, clone);
      return this;
    },

    addLegend: function () {
      if (!this.timelineData || !this.timelineData.hasOwnProperty('data') || this.timelineData.data.length === 0) return;
      var ul = $("<ul id='legend' class='timeline-legend'>");

      $(this.selectee).after(ul);

      var processedPopulations = {};
      $.each(this.timelineData.data, function(i, item) {
        if (!processedPopulations.hasOwnProperty(item.population.title)) {
          processedPopulations[item.population.title] = true;
          var li = $(createLegendRow(item.population.color, item.population.title));
          ul.append(li);
        }
      });

      return this;
    },

    reset: function() {
      $(this.selectee).empty();
      $('.timeline-legend').remove();
      return this;
    }
  };

  function createTimeline(timeline, timelineData, selectee, studyDto) {
    var width = $(selectee).width();
    var chart = d3.timeline()
      .startYear(timelineData.start)
      .beginning(timelineData.min)
      .ending(timelineData.max)
      .width(width)
      .stack()
      .tickFormat({
        format: d3.format("d"),
        tickTime: 1,
        tickNumber: 1,
        tickSize: 10
      })
      .margin({left: 15, right: 15, top: 0, bottom: 20})
      .rotateTicks(timelineData.max > $.MicaTimeline.defaultOptions.maxMonths ? 45 : 0)
      .click(function (d, i, datum) {
        if (timeline.popupIdFormatter) {
          var modal = timeline.popupIdFormatter(studyDto, datum.population, d);
          var popup = $(modal.id);
          if (popup.length > 0) {
            popup.modal();
            timeline.seedModal(popup, modal.dceId);
          }
        }
      });

    d3.select(selectee).append("svg").attr("width", width).datum(timelineData.data).call(chart);

    if (timeline.useBootstrapTooltip === true) {
      // Bootstrap 3.3.7, Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
      // have to update Jquery to version 3
      //ToDo
      // d3.select(selectee).selectAll('#line-path')
      //   .attr('data-placement', 'top')
      //   .attr('data-toggle', 'tooltip')
      //   .attr('title', function (d) {
      //     return d.title;
      //   })
      //   .selectAll('title').remove(); // remove default tooltip
      // $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
      //   var top = $(this).css('top');
      //   console.log(top);
      //
      // });
    }

    timeline.timelineData = timelineData;
    timeline.selectee = selectee;
  }

  /**
   * @param color
   * @param title
   * @returns {*|HTMLElement}
   */
  function createLegendRow(color, title) {
    var rect ="<rect width='20' height='20' x='2' y='2' rx='5' ry='5' style='fill:COLOR;'>".replace(/COLOR/, color);
    return $("<li><svg width='25' height='25'>"+rect+"</svg>"+title+"</li>");
  }

  /**
   * Default options
   * @type {{maxMonths: number}}
   */
  $.MicaTimeline.defaultOptions = {
    maxMonths: 300
  };

}(jQuery));
