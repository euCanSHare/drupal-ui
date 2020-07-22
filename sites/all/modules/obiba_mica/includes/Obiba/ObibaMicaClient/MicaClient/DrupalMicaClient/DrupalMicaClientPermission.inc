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

use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;

class DrupalMicaClientPermission {
    public $user;
  function __construct() {
    $currentUserObject = MicaConfig\MicaDrupalConfig::CLIENT_CURRENT_USER;
    $this->user = $currentUserObject();
  }

  public function canEditDraftDocument($document) {
    $variableGetValue = MicaConfig\MicaDrupalConfig::CLIENT_VARIABLE_GET_VALUE;
    return $this->user->uid !== 0 // authenticated
    && $variableGetValue('mica_enable_to_mica_server_link') //
    && !empty($document) //
    && !empty($document->permissions) //
    && $document->permissions->edit; //
  }

  public function userHasRole($role) {
    return in_array($role, $this->user->roles);
  }
}