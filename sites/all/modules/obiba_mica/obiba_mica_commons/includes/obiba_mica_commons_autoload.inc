<?php

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;
use Obiba\ObibaMicaClient\MicaLocalisation as MicaLocalisation;
use \Obiba\ObibaMicaClient\MicaCache as MicaCache;
use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;
use Obiba\ObibaMicaClient\MicaWatchDog as MicaWatchDog;


if (class_exists('Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient\MicaClient')) {
  class DrupalMicaClientResource extends DrupalMicaClient\MicaClient {
    protected $micaClient;

    function __construct($mica_url) {
      parent::__construct($mica_url,
        new MicaCache\MicaDrupalClientCache(),
        new MicaConfig\MicaDrupalConfig(),
        new MicaWatchDog\MicaDrupalClientWatchDog());
    }

    public static function DrupalMicaErrorHandler($force = NULL, $message_parameters = NULL) {
      $current_path = current_path();
      if ($force) {
        drupal_set_message(t($message_parameters['message'],
          $message_parameters['placeholders']),
          $message_parameters['severity']);

        watchdog('php', $message_parameters['message'],
          $message_parameters['placeholders'],
          $message_parameters['severity']);

        $message = t($message_parameters['message'], $message_parameters['placeholders']);
        error_log('PHP Parse error: ' . $message);
        header('Location: ' . HIDE_PHP_FATAL_ERROR_URL . '?destination=' . $current_path, FALSE);
        exit;
      }
      if ((!is_null($error = error_get_last()) && $error['type'] === E_ERROR)) {
        header('Location: ' . HIDE_PHP_FATAL_ERROR_URL . '?destination=' . $current_path);

        // We need to reuse the code from _drupal_error_handler_real() to
        // force the maintenance page.
        require_once DRUPAL_ROOT . '/includes/errors.inc';

        $types = drupal_error_levels();
        list($severity_msg, $severity_level) = $types[$error['type']];

        if (!function_exists('filter_xss_admin')) {
          require_once DRUPAL_ROOT . '/includes/common.inc';
        }

        // We consider recoverable errors as fatal.
        $error = array(
          '%type' => isset($types[$error['type']]) ? $severity_msg : 'Unknown error',
          // The standard PHP error handler considers that the error messages
          // are HTML. We mimick this behavior here.
          '!message' => filter_xss_admin($error['message']),
          '%file' => $error['file'],
          '%line' => $error['line'],
          'severity_level' => $severity_level,
        );

        watchdog('php', '%type: !message (line %line of %file).', $error, $error['severity_level']);
        exit;
      }
      else{
        if(obiba_mica_commons_is_ajax()){
          header('HTTP/1.0 '. $message_parameters['placeholders']['@code'] . ' ' . $message_parameters['placeholders']['@message']);
          exit;
        }
      }
    }

  }
}
else {
  class DrupalMicaClientResource {
  }
}

if (class_exists('Obiba\ObibaMicaClient\MicaLocalisation\MicaDrupalLocalization')) {
  class drupalLocalization extends MicaLocalisation\MicaDrupalLocalization{
    private static $instance;

    function __construct(){
      parent::__construct();
      return $this;
    }

    // Singelton Pattern to load the class once on evry context
    public static function singleton() {
      if (!isset(self::$instance)) {
        $c = __CLASS__;
        self::$instance = new $c;
      }

      return self::$instance;
    }

  }
}
else{
  /*
   * Need de fake this class on cli drupal actions (installation , drush command etc...)
   * */
  class drupalLocalization{
    private static $instance;

    function __construct(){
    }

    public static function singleton() {
      if (!isset(self::$instance)) {
        $c = __CLASS__;
        self::$instance = new $c;
      }

      return self::$instance;
    }

    public function getTranslation($vocabulary){
      return $vocabulary;
    }
  }
}

class DrupalMicaConfigResource {
  public $micaClientConfigResource;

  function __construct($mica_url = NULL) {
    $this->micaClientConfigResource = new DrupalMicaClient\MicaClientConfigResource($mica_url);
    return $this->micaClientConfigResource;
  }
}