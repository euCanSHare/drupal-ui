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

class MicaDatasetUtils {

  const TABLE_NONE = 0;
  const TABLE_STUDY = 1;
  const TABLE_NETWORK = 2;
  const TABLE_STUDY_NETWORK = 3;

  public static function getDataschemaVariableTableType($variable) {
    if (empty($variable)) return self::TABLE_NONE;

    $hasStudyTables = property_exists($variable, 'studySummaries');
    $hasNetworkTables = property_exists($variable, 'networkSummaries');

    if ($hasStudyTables && $hasNetworkTables) {
      return self::TABLE_STUDY_NETWORK;
    } else if ($hasStudyTables) {
        return self::TABLE_STUDY;
    } else if ($hasNetworkTables) {
      return self::TABLE_NETWORK_TABLE;
    }

    return self::TABLE_NONE;
  }
}