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

namespace Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient;


class DrupalMicaClientResourcePathHelper {
  const WS_STUDIES_SEARCH = '/studies/_rql?query=%';
  const WS_NETWORKS_SEARCH = '/networks/_rql?query=%';
  const WS_COLLECTION_STUDY = '/individual-study/%';
  const WS_COLLECTION_DRAFT_STUDY = '/draft/individual-study/%?key=%';
  const WS_HARMONIZATION_STUDY = '/harmonization-study/%';
  const WS_HARMONIZATION_DRAFT_STUDY = '/draft/harmonization-study/%?key=%';
  const WS_HARMONIZED_DATASET = 'harmonized-dataset';
  const WS_DATASETS_SEARCH = '/datasets/_rql?query=%';

  static public function getResourcePath($path, $args){
    $path = strtr($path, array('%' => '%s'));
    array_unshift($args, $path);
    return call_user_func_array('sprintf', $args);
  }
}