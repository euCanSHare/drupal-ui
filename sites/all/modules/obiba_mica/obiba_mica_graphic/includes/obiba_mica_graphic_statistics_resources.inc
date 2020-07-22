<?php
/**
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file
 * Mica networks file
 */
class NetworkStatistics extends ObibaSearchResources {
  const MODULE_GRAPHIC_CHARTS_GEO_CHART = 'GraphicChartsGeoChart';
  const MODULE_GRAPHIC_CHARTS_STUDY_DESIGN_CHART = 'GraphicChartsStudyDesignChart';

  const GEO_NBR_STAT = 'countriesIso';
  const METHODS_DESIGNS = 'methods-designs';
  const NUMBER_PARTICIPANTS = 'number-participants';
  const BIO_SAMPLES = 'populationDceBioSamples';
  const START_YEAR = 'start-year';
  public $id_networks;

  function __construct($id_networks) {
    parent::__construct();
    $id_networks= explode(',', $id_networks);
    $this->id_networks = json_encode($id_networks);
  }

  static function deltaAggregationsMap(){
    return array(
      NetworkStatistics::GEO_NBR_STAT =>'populations-selectionCriteria-countriesIso',
      NetworkStatistics::METHODS_DESIGNS => 'methods-designs',
      NetworkStatistics::NUMBER_PARTICIPANTS => 'numberOfParticipants-participant-number-range',
      NetworkStatistics::BIO_SAMPLES => 'populations-dataCollectionEvents-bioSamples',
      NetworkStatistics::START_YEAR => 'start-range',
      );
  }

  public function getTableData($chart_data, $percentage = FALSE) {
    $header = $chart_data[0];
    array_shift($chart_data);
    if (!empty($percentage)) {
      $total_studies = array_sum(array_column($chart_data, 1));
      foreach ($chart_data as $key_tab => $item_value) {
        $chart_data[$key_tab][1] = round(($chart_data[$key_tab][1] * 100) / $total_studies, 1) . ' %';
      }
    }
    return theme('table', array('header' => $header, 'rows' => $chart_data));
  }

}
