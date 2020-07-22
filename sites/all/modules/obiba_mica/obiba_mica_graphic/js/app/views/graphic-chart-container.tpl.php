<div class="row">
  <div class="col-md-6">
    <div obiba-chart
         chart-config = "chart"
         chart-type="chart.chartType"
         chart-aggregation-name="chart.chartAggregationName"></div>
  </div>
  <div class="col-md-6"
       obiba-table
       chart-config = "chart"
       chart-type="{{'Table-' + chart.chartType}}"
       chart-aggregation-name="chart.chartAggregationName">
  </div>
</div>
