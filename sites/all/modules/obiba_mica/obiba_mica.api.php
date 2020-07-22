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
 * Hooks provided by Mica client
 */

/**
 * A hook implementation.
 *
 * Given a harmonization csv file, this hook can alter the content as required.
 *
 * @param array $csv
 *   The csv array.
 *
 * @return array
 *   Can be the csv array modified on the implemented hook
 */
function hook_harmonization_csv_alter($csv) {
  return $csv;
}
