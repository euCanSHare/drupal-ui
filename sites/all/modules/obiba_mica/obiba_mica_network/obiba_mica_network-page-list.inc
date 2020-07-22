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
 * @file code for list networks page
 */

function obiba_mica_network_get_networks($study_id, $query = NULL, $sort = NULL, $order = NULL, $network_limits = NULL) {
  $from = 0;
  $network_resource = new DrupalMicaNetworkResource();
  $size_response = !empty($network_limits) ? $network_limits : DrupalMicaClientResource::getResponsePageSizeSmall();
  $type = 'networks';

  prepopulate_session_with_network_count_if_needed($type, $network_resource);

  if (!empty($_GET['page'])) {
    $from = $network_resource->paginationListSearchParameters($_GET['page'], $type, $size_response);
  }

  if (empty($order)) {
    $network_order = variable_get_value('network_list_default_order_sort');
    $order = !empty($network_order) ? $network_order : '';
  }

  if (empty($sort)) {
    $network_list_sort_option = variable_get_value('network_list_default_field_sort');
    if (!empty($network_list_sort_option)) {
      $sort = $network_list_sort_option;
    }
  }

  $fields = array("studyIds", "acronym.*", "name.*", "description.*", "logo");
  $networks = $network_resource->getNetworks($study_id, $query, $from, $size_response, $sort, $order, $fields);

  populate_session_with_network_count($networks, $type);

  return $networks;
}

function prepopulate_session_with_network_count_if_needed($type, DrupalMicaNetworkResource $network_resource) {

  if (empty(@$_SESSION[$type])) {
    $networks = $network_resource->getNetworks(NULL, NULL, 0, 1);
    populate_session_with_network_count($networks, $type);
  }
}

function populate_session_with_network_count($networks, $type) {
  if (!empty($networks)) {
    $_SESSION[$type]['aggregations']['total_hits'] = $networks->getTotalHits();
  }
}

function obiba_mica_network_networks_table($networks_result) {
  $rows = array();
  //may this is a fix for "PHP Fatal error:  Call to a member function getTotalHits()" see log mails from root@mr-portal.obiba.oicr.on.ca
  if(!method_exists($networks_result,'getTotalHits')){
    return NULL;
  }
    $total = $networks_result->getTotalHits();

    if ($total > 0) {
      $rows = obiba_mica_network_networks_table_rows($networks_result->getSummaries());
    }
    $headers = obiba_mica_network_networks_table_headers();
    $per_page = 20;

    if (empty($total)) {
      return NULL;
    }

    $args = array(
      'quantity' => $total,
      'element' => DrupalMicaNetworkResource::PAGINATE_NETWORKS
    );
    $current_page = pager_default_initialize($total, $per_page, DrupalMicaNetworkResource::PAGINATE_NETWORKS);
    $chunks = array_chunk($rows, $per_page, TRUE);
    return $themed_network_table = theme(
        'table',
        array(
          'header' => $headers,
          'rows' => empty($chunks) ? array() : $chunks[$current_page],
          'empty' => variable_get_value('networks_empty_label')
        )
      ) . theme('pager', $args);
  return NULL;
}

function obiba_mica_network_networks_table_rows($networks) {
  $rows = array();

  if (!empty($networks)) {
    foreach ($networks as $network) {
      $stats = $network->{'obiba.mica.CountStatsDto.networkCountStats'};
      $study_count = MicaClientAnchorHelper::networkStudies($stats->studies, $network->id);
      $rows[] = array(
        MicaClientAnchorHelper::network($network),
        obiba_mica_commons_get_localized_field($network, 'name'),
        $study_count,
      );
    }
  }
  return $rows;
}

function obiba_mica_network_networks_table_headers() {
  $localize = obiba_mica_commons_mica_server_localisation();
  return array(
    $localize->getTranslation('network.acronym'),
    $localize->getTranslation('name'),
    $localize->getTranslation('studies'),
  );
}




