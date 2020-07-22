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
 * class tools provided by Mica client
 */

class ObibaDatasetConstants {
  const FACET_TYPE_HIDE = 0;
  const FACET_TYPE_AUTOCOMPLETE = 1;
  const FACET_TYPE_CHECKBOX = 2;

  /*
   * Function to call correct Callback in the boutton template
   * */
  public static function bouttonAnchor($method, $text = NULL ,$id , $attributes){
    return call_user_func($method, $text, $id, $attributes);;
  }
}
