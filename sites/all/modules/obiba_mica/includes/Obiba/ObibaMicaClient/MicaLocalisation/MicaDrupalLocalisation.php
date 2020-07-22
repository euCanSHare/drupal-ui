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


namespace Obiba\ObibaMicaClient\MicaLocalisation;

use Flow\JSONPath\JSONPath as JSONPath;
use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient\MicaClientConfigResource as MicaDrupalConfigResources;
use Obiba\ObibaMicaClient\MicaCache as MicaCache;

class MicaDrupalLocalization implements MicaLocalizationInterface {

  public $langJson;
  private $jsonParser;

   function __construct() {
     $cache = new MicaCache\MicaDrupalClientCache();
     $cachedJsonParser = $cache->MicaGetCache('cachedJsonParser');
     if(!empty($cachedJsonParser)){
       $this->jsonParser = $cachedJsonParser;
     }
     else{
       $configResources = new MicaDrupalConfigResources();
       $jsonTranslation = $configResources->getTranslations();
       $translation = !empty($jsonTranslation) ? json_decode($jsonTranslation) : NULL;
       if (!empty($translation)) {
         $this->jsonParser = new JSONPath($translation);
         $cache->MicaSetCache('cachedJsonParser', $this->jsonParser);
       }
     }
    return $this;
  }

  private function sanitizeStringKey($vocabulary) {
    $sanitizedString = '$';
    $paths = explode('.', $vocabulary);
    foreach ($paths as $keyPath => $path) {
      if ($keyPath == 0) {
        $sanitizedString .= ".";
      }
      if (strstr($path, '-')) {
        $sanitizedString .= "\"$path\".";
      }
      else {
        $sanitizedString .= $path . '.';
      }
    }
    return rtrim($sanitizedString, ".");
  }

  function getTranslation($vocabulary) {
    $sanitizedKey = $this->sanitizeStringKey($vocabulary);
    if(!empty($this->jsonParser)){
      try {
        $locals = $this->jsonParser->find($sanitizedKey);
        if (!empty($locals)) {
          foreach ($locals as  $local)
            if (!empty($local) && is_string($local)) {
              return $local;
            }
        }
      } catch (\Exception $e) {
        return false;
      }
    }
    return $vocabulary;
  }

}
