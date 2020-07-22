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
 * Code to implement response server wrapper.
 */

namespace Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient;

abstract class AbstractResponseWrapper {
  const STUDY_RESULT_EXTENSION_ID = 'obiba.mica.StudyResultDto.result';
  const NETWORK_RESULT_EXTENSION_ID = 'obiba.mica.NetworkResultDto.result';
  const DATASET_RESULT_EXTENSION_ID = 'obiba.mica.DatasetResultDto.result';
  const VARIABLE_RESULT_EXTENSION_ID = 'obiba.mica.DatasetVariableResultDto.result';

  protected $dto = NULL;
  protected $documentDto = NULL;

  /**
   * Instance initialisation.
   *
   * @param object $join_query_response_dto
   *   The response dto.
   */
  protected function __construct($join_query_response_dto) {
    $this->dto = $join_query_response_dto;
  }

  /**
   * Document is empty.
   *
   * @return bool
   *   False/The document Dto.
   */
  public function isEmpty() {
    return empty($this->documentDto);
  }

  /**
   * Get the total response hits.
   *
   * @return int
   *   The total hits.
   */
  public function getTotalHits() {
    return empty($this->documentDto) ? 0 : $this->documentDto->totalHits;
  }

  /**
   * Get the total count.
   *
   * @return int
   *   The total count.
   */
  public function getTotalCount() {
    return empty($this->documentDto) ? 0 : $this->documentDto->totalCount;
  }

  /**
   * Abstraction has summaries method.
   */
  public abstract function hasSummaries();

  /**
   * Abstraction get summaries method.
   */
  public abstract function getSummaries();
}

class JoinQueryResponseWrapper {
  const VARIABLES = 'variables';
  const DATASETS = 'datasets';
  const STUDIES = 'studies';
  const NETWORKS = 'networks';

  private $dto = NULL;

  /**
   * Instance initialisation.
   *
   * @param object $join_query_response_dto
   *   The response dto.
   */
  public function __construct($join_query_response_dto) {
    $this->dto = $join_query_response_dto;
  }

  /**
   * Get response Dto.
   *
   * @return object
   *   The current response Dto object.
   */
  public function getResponseDto() {
    return $this->dto;
  }

  /**
   * GEt count state.
   *
   * @return array
   *   An array count stats.
   */
  public function getCountStats() {
    return array(
      'study_total_hits' => empty($this->dto->studyResultDto) ? 0 : $this->dto->studyResultDto->totalHits,
      'study_total_count' => empty($this->dto->studyResultDto) ? 0 : $this->dto->studyResultDto->totalCount,
      'variable_total_hits' => empty($this->dto->variableResultDto) ? 0 : $this->dto->variableResultDto->totalHits,
      'variable_total_count' => empty($this->dto->variableResultDto) ? 0 : $this->dto->variableResultDto->totalCount,
      'network_total_hits' => !empty($this->dto->networkResultDto->totalHits) ? $this->dto->networkResultDto->totalHits : 0,
      'network_total_count' => !empty($this->dto->networkResultDto->totalCount) ? $this->dto->networkResultDto->totalCount : 0,
      'dataset_total_hits' => !empty($this->dto->datasetResultDto->totalHits) ? $this->dto->datasetResultDto->totalHits : 0,
      'dataset_total_count' => !empty($this->dto->datasetResultDto->totalCount) ? $this->dto->datasetResultDto->totalCount : 0,
    );
  }

  /**
   * Get response wrapper by type.
   *
   * @param string $type
   *   The type of the wrapper.
   *
   * @return object
   *   The result wrapper by type.
   */
  public function getResponseWrapper($type) {
    switch ($type) {
      case JoinQueryResponseWrapper::VARIABLES:
        return $this->getVariableResponseWrapper();

      case JoinQueryResponseWrapper::DATASETS:
        return $this->getDatasetResponseWrapper();

      case JoinQueryResponseWrapper::STUDIES:
        return $this->getStudyResponseWrapper();

      case JoinQueryResponseWrapper::NETWORKS:
        return $this->getNetworkResponseWrapper();

    }

    throw new InvalidArgumentException("Invalid wrapper type: $type");
  }

  /**
   * Get variable response wrapper.
   *
   * @return \VariableJoinResponseWrapper
   *   Variable response wrapper.
   */
  public function getVariableResponseWrapper() {
    return new VariableJoinResponseWrapper($this->dto);
  }

  /**
   * Get dataset response wrapper.
   *
   * @return \DatasetJoinResponseWrapper
   *   Dataset response wrapper.
   */
  public function getDatasetResponseWrapper() {
    return new DatasetJoinResponseWrapper($this->dto);
  }

  /**
   * Get study response wrapper.
   *
   * @return \StudyJoinResponseWrapper
   *   Study response wrapper.
   */
  public function getStudyResponseWrapper() {
    return new StudyJoinResponseWrapper($this->dto);
  }

  /**
   * Get network response wrapper.
   *
   * @return \NetworkJoinResponseWrapper
   *   Network response wrapper.
   */
  public function getNetworkResponseWrapper() {
    return new NetworkJoinResponseWrapper($this->dto);
  }
}

class StudyJoinResponseWrapper extends AbstractResponseWrapper {

  private $studyToNetwork = array();

  /**
   * Instance initialisation.
   *
   * @param object $join_query_response_dto
   *   The response dto.
   */
  public function __construct($join_query_response_dto) {
    parent::__construct($join_query_response_dto);
    if (!empty($this->dto) && !empty($this->dto->studyResultDto)) {
      $this->documentDto = $this->dto->studyResultDto;
      $this->networks = $this->mapNetworkDigests();
    }
  }

  /**
   * Check this Dto response has summaries.
   *
   * @return bool
   *   False/TRUE statement.
   */
  public function hasSummaries() {
    return !empty($this->documentDto)
    && !empty($this->documentDto->{self::STUDY_RESULT_EXTENSION_ID})
    && !empty($this->documentDto->{self::STUDY_RESULT_EXTENSION_ID}->summaries);
  }

  /**
   * Get summaries.
   *
   * @return array
   *   Summaries server response.
   */
  public function getSummaries() {
    return $this->hasSummaries() ? $this->documentDto->{self::STUDY_RESULT_EXTENSION_ID}->summaries : array();
  }

  /**
   * Get network digests by study id.
   *
   * @param string $study_id
   *   Study id.
   *
   * @return array
   *   A networks array.
   */
  public function getNetworkDigests($study_id) {
    $networks = array();
    if (!empty($this->studyToNetwork[$study_id])) {
      $networks = $this->studyToNetwork[$study_id];
    }
    return empty($networks) ? array() : $networks;
  }

  /**
   * Map the network digest.
   */
  private function mapNetworkDigests() {
    if (!$this->hasSummaries()) {
      return;
    }

    foreach ($this->getSummaries() as $study) {
      $study_id = $study->id;
      $networks = $this->mapNetwork($study_id);
      if (!empty($networks)) {
        $this->studyToNetwork[$study_id] = $networks;
      }
    }
  }

  /**
   * Map the network by study id.
   *
   * @param string $study_id
   *   The study id.
   *
   * @return array
   *   Filtered network array.
   */
  private function mapNetwork($study_id) {
    $network_dto_wrapper = new NetworkJoinResponseWrapper($this->dto);
    if (!$network_dto_wrapper->isEmpty() && $network_dto_wrapper->hasDigsts()) {
      return array_filter($network_dto_wrapper->getDigests(),
        function ($network) use ($study_id) {
        $studies = $network->{'obiba.mica.NetworkDigestDto.studies'};
        return !empty($studies) && !empty($studies->ids) && in_array($study_id, $studies->ids);
        }
      );
    }
    else {
      return array();
    }
  }
}

class NetworkJoinResponseWrapper extends AbstractResponseWrapper {

  /**
   * Instance initialisation.
   *
   * @param object $join_query_response_dto
   *   The response dto.
   */
  public function __construct($join_query_response_dto) {
    parent::__construct($join_query_response_dto);
    if (!empty($this->dto) && !empty($this->dto->networkResultDto)) {
      $this->documentDto = $this->dto->networkResultDto;
    }
  }

  /**
   * Has digests.
   *
   * @return bool
   *   FALSE/TRUE statement.
   */
  public function hasDigsts() {
    return !empty($this->documentDto)
    && !empty($this->documentDto->{self::NETWORK_RESULT_EXTENSION_ID})
    && !empty($this->documentDto->{self::NETWORK_RESULT_EXTENSION_ID}->digests);
  }

  /**
   * GEt digest.
   *
   * @return array
   *   The document digest.
   */
  public function getDigests() {
    return $this->hasDigsts() ? $this->documentDto->{self::NETWORK_RESULT_EXTENSION_ID}->digests : array();
  }

  /**
   * Check this Dto response has summaries.
   *
   * @return bool
   *   False/TRUE statement.
   */
  public function hasSummaries() {
    return !empty($this->documentDto)
    && !empty($this->documentDto->{self::NETWORK_RESULT_EXTENSION_ID})
    && !empty($this->documentDto->{self::NETWORK_RESULT_EXTENSION_ID}->networks);
  }

  /**
   * Get summaries.
   *
   * @return array
   *   Summaries server response.
   */
  public function getSummaries() {
    return $this->hasSummaries() ? $this->documentDto->{self::NETWORK_RESULT_EXTENSION_ID}->networks : array();
  }
}

class VariableJoinResponseWrapper extends AbstractResponseWrapper {

  /**
   * Instance initialisation.
   *
   * @param object $join_query_response_dto
   *   The response dto.
   */
  public function __construct($join_query_response_dto) {
    parent::__construct($join_query_response_dto);
    if (!empty($this->dto) && !empty($this->dto->variableResultDto)) {
      $this->documentDto = $this->dto->variableResultDto;
    }
  }

  /**
   * Check this Dto response has details.
   *
   * @return bool
   *   False/TRUE statement.
   */
  public function hasDetails() {
    return !empty($this->documentDto)
    && !empty($this->documentDto->{self::VARIABLE_RESULT_EXTENSION_ID})
    && !empty($this->documentDto->{self::VARIABLE_RESULT_EXTENSION_ID}->variables);
  }

  /**
   * Get details.
   *
   * @return array
   *   details document server response.
   */
  public function getDetails() {
    return $this->hasDetails() ? $this->documentDto->{self::VARIABLE_RESULT_EXTENSION_ID}->variables : array();
  }

  /**
   * Check this Dto response has summaries.
   *
   * @return bool
   *   False/TRUE statement.
   */
  public function hasSummaries() {
    return !empty($this->documentDto)
    && !empty($this->documentDto->{self::VARIABLE_RESULT_EXTENSION_ID})
    && !empty($this->documentDto->{self::VARIABLE_RESULT_EXTENSION_ID}->summaries);
  }

  /**
   * Get summaries.
   *
   * @return array
   *   Summaries server response.
   */
  public function getSummaries() {
    return $this->hasSummaries() ? $this->documentDto->{self::VARIABLE_RESULT_EXTENSION_ID}->summaries : array();
  }

}

class DatasetJoinResponseWrapper extends AbstractResponseWrapper {

  /**
   * Instance initialisation.
   *
   * @param object $join_query_response_dto
   *   The response dto.
   */
  public function __construct($join_query_response_dto) {
    parent::__construct($join_query_response_dto);
    if (!empty($this->dto) && !empty($this->dto->datasetResultDto)) {
      $this->documentDto = $this->dto->datasetResultDto;
    }
  }

  /**
   * Check this Dto response has summaries.
   *
   * @return bool
   *   False/TRUE statement.
   */
  public function hasSummaries() {
    return !empty($this->documentDto)
    && !empty($this->documentDto->{self::DATASET_RESULT_EXTENSION_ID})
    && !empty($this->documentDto->{self::DATASET_RESULT_EXTENSION_ID}->datasets);
  }

  /**
   * Get summaries.
   *
   * @return array
   *   Summaries server response.
   */
  public function getSummaries() {
    return $this->hasSummaries() ? $this->documentDto->{self::DATASET_RESULT_EXTENSION_ID}->datasets : array();
  }

}
