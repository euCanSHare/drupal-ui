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

namespace Obiba\ObibaMicaClient\MicaCache;

use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;

class MicaDrupalClientCache implements MicaCacheInterface {
  function __construct() {
  }

  /**
   * query the cache.
   *
   * @param string $resource_query
   *   Study, dce, network ...
   *
   * @return $this
   */
  public function MicaGetCache($resource_query) {
    $cached_result = $this->clientGetCache($resource_query);
    if (isset($cached_result)) {
      return $cached_result;
    }
    return FALSE;
  }

  public function MicaSetCache($resource_query, $value) {
    $this->clientSetCache($resource_query, $value);
  }

  public function clientGetCache($key) {
    $client_get_cache = MicaConfig\MicaDrupalConfig::CLIENT_GET_CACHE;
    return $client_get_cache($key);
  }

  public function clientSetCache($key, $value) {
    $client_set_cache = MicaConfig\MicaDrupalConfig::CLIENT_SET_CACHE;
    if (isset($value)) {
      $client_set_cache($key, $value);
    }
  }
}
