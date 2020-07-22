/*Copyright (c) 2015 OBiBa. All rights reserved.
* This program and the accompanying materials
* are made available under the terms of the GNU Public License v3.0.
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see  <http://www.gnu.org/licenses>

* obiba-progressbar - v1.0.1
* Date: 2016-11-29
 */
(function ($) {

  "use strict";

  var bar = null;
  var spinner = null;
  var step = 0;
  var animationSettings = {'duration': 15000, 'complete': completeCallback, 'step': stepCallback, 'easing': 'linear'};
  var settings = {
    duration: 15000,
    showSpinner: true,
    parent: 'body',
    template: '<div class="obiba-progress-bar" role="bar"></div><div class="obiba-progress-spinner" role="spinner"><div class="obiba-progress-spinner-icon"></div></div>',
    barCssOverride: null,
    spinnerCssOverride: null
  };
  var defaultSettings =  jQuery.extend(true, {}, settings);

  /**
   * @constructor
   */
  $.ObibaProgressBar = function (options) {
    if (options) configure(options);
  };

  /**
   * public methods exposed
   */
  $.ObibaProgressBar.prototype = {
    start: startAnimation,
    pause: pauseAnimation,
    resume: resumeAnimation,
    finish: finishAnimation,
    inc: incrementStep,
    set: setPercentage,
    duration: duration,
    update: updateAnimation
  };

  function startAnimation() {
    render();
    play();
  }

  function pauseAnimation() {
    if (bar === null) return;
    bar.stop();
    stopSpinner();
  }

  function resumeAnimation() {
    if (bar === null) return;
    updateDuration();
    play();
  }

  function finishAnimation() {
    if (bar === null) return;
    bar.stop().animate({'width': '100%'}, 'fast', completeCallback);
  }

  function incrementStep(inc) {
    if (bar === null) return;
    pauseAnimation();
    setPercentage(Math.min(100, Math.round(step) + inc), true);
  }

  function setPercentage(percent, resumeAnimation) {
    if (bar === null) return;
    bar.stop().animate({'width': percent+'%'}, 250, function() {
      step = percent;
      updateDuration();
      if (resumeAnimation) play();
    });
  }

  function duration(time) {
    if (bar === null) return;
    bar.stop();
    settings.duration = time;
    updateDuration();
    resumeAnimation();
  }

  function updateAnimation(options) {
    pauseAnimation();

    if (options) {
      // start where we had paused
      if (!options.hasOwnProperty('barCssOverride')) options.barCssOverride = {};
      options.barCssOverride.width = step+'%';
      configure(options);
    } else {
      settings = jQuery.extend(true, {}, defaultSettings);
      configure(settings);
      reset();
    }
    updateDuration();
    startAnimation();
  }

  // P R I V A T E     F U N C T I O N S

  function configure(options) {
    if (options === null) return;
    $.each(options, function(key, value){
      if (value !== undefined && settings.hasOwnProperty(key)) settings[key] = value;
    });

    animationSettings.duration = settings.duration;
  }

  function play() {
    if (bar === null) return;
    bar.stop();
    bar.animate({'width': '100%'}, animationSettings);
    rotateSpinner();
  }

  /**
   * Creates the widgets
   */
  function render() {
    if(bar !== null) {
      dispose();
    }

    var template = $(settings.template);
    if (template) {
      $(settings.parent).append(template);
      bar = $('[role="bar"]');
      if (bar.length > 0) overrideBarCss();

      spinner = $('[role="spinner"]');
      if (settings.showSpinner) {
        if (spinner.length > 0) overrideSpinnerCss();
        rotateSpinner();
      } else {
        spinner.remove();
        spinner = null;
      }
    }
  }

  function overrideBarCss() {
    if (settings.barCssOverride) {
      $.each(settings.barCssOverride, function(key, value){
        bar.css(key, value);
      });
    }
  }

  function overrideSpinnerCss() {
    if (settings.spinnerCssOverride) {
      $.each(settings.spinnerCssOverride, function(key, value){
        if (key === 'iconCssOverride') {
          var icon = $('.obiba-progress-spinner-icon', spinner);
          if (icon.length > 0) {
            $.each(settings.spinnerCssOverride.iconCssOverride, function(key, value){
              icon.css(key, value);
            });
          }
          return;
        }
        spinner.css(key, value);
      });
    }
  }

  /**
   * Deletes all widgets and resets state
   */
  function dispose() {
    if (bar === null) return;
    bar.stop();
    stopSpinner();
    bar.remove();
    if (spinner !== null) spinner.remove();
    reset();
  }

  /**
   * Resets the state
   */
  function reset() {
    step = 0;
    animationSettings.duration = settings.duration;
  }

  function rotateSpinner() {
    if (spinner === null) return;
    spinner.removeClass('animation-off');
  }

  function stopSpinner() {
    if (spinner === null) return;
    spinner.addClass('animation-off');
  }

  /**
   * Need to recalculate remaining time for smooth animation
   */
  function updateDuration() {
    animationSettings.duration = Math.round(settings.duration*0.01*(100 - Math.round(step)));
  }

  /**
   * Save current animation step for further interventions!
   * @param value
   */
  function stepCallback(value) {
    step = value;
  }

  /**
   * Clean up callback
   */
  function completeCallback() {
    if (spinner) spinner.animate({'opacity': 0}, 250);
    bar.animate({'opacity': 0}, 250, dispose);
  }

}(jQuery));
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress-wrapper" aria-live="polite"></div>');
  this.element.html('<div id ="' + id + '" class="progress progress-striped active">' +
                    '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                    '<div class="percentage sr-only"></div>' +
                    '</div></div>' +
                    '</div><div class="percentage pull-right"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.progress-bar', this.element).css('width', percentage + '%');
    $('div.progress-bar', this.element).attr('aria-valuenow', percentage);
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="alert alert-block alert-error"><a class="close" data-dismiss="alert" href="#">&times;</a><h4>Error message</h4></div>').append(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
(function ($) {

  Drupal.behaviors.autologout = {
    attach: function(context, settings) {

      if (context != document) {
        return;
      }

      var paddingTimer;
      var t;
      var theDialog;
      var localSettings;

      // Activity is a boolean used to detect a user has
      // interacted with the page.
      var activity;

      // Timer to keep track of activity resets.
      var activityResetTimer;

      // Prevent settings being overriden by ajax callbacks by cloning the settings.
      localSettings = jQuery.extend(true, {}, settings.autologout);

      if (localSettings.refresh_only) {
        // On pages that cannot be logged out of don't start the logout countdown.
        t = setTimeout(keepAlive, localSettings.timeout);
      }
      else {
        // Set no activity to start with.
        activity = false;

        // Bind formUpdated events to preventAutoLogout event.
        $('body').bind('formUpdated', function(event) {
          $(event.target).trigger('preventAutologout');
        });

        // Support for CKEditor.
        if (typeof CKEDITOR !== 'undefined') {
          CKEDITOR.on('instanceCreated', function(e) {
            e.editor.on('contentDom', function() {
              e.editor.document.on('keyup', function(event) {
                // Keyup event in ckeditor should prevent autologout.
                $(e.editor.element.$).trigger('preventAutologout');
              });
            });
          });
        }

        $('body').bind('preventAutologout', function(event) {
          // When the preventAutologout event fires
          // we set activity to true.
          activity = true;

          // Clear timer if one exists.
          clearTimeout(activityResetTimer);

          // Set a timer that goes off and resets this activity indicator
          // after a minute, otherwise sessions never timeout.
          activityResetTimer = setTimeout(function () {
            activity = false;
          }, 60000);
        });

        // On pages where the user can be logged out, set the timer to popup
        // and log them out.
        t = setTimeout(init, localSettings.timeout);
      }

      function init() {
        var noDialog = Drupal.settings.autologout.no_dialog;

        if (activity) {
          // The user has been active on the page.
          activity = false;
          refresh();
        }
        else {

          // The user has not been active, ask them if they want to stay logged in
          // and start the logout timer.
          paddingTimer = setTimeout(confirmLogout, localSettings.timeout_padding);

          // While the countdown timer is going, lookup the remaining time. If there
          // is more time remaining (i.e. a user is navigating in another tab), then
          // reset the timer for opening the dialog.
          Drupal.ajax['autologout.getTimeLeft'].autologoutGetTimeLeft(function(time) {
              if (time > 0) {
                clearTimeout(paddingTimer);
                t = setTimeout(init, time);
              }
              else {
                // Logout user right away without displaying a confirmation dialog.
                if (noDialog) {
                  logout();
                  return;
                }
                theDialog = dialog();
              }
          });
        }
      }

      function dialog() {
        var buttons = {};
        buttons[Drupal.t('Yes')] = function() {
          $(this).dialog("destroy");
          clearTimeout(paddingTimer);
          refresh();
        };

        buttons[Drupal.t('No')] = function() {
          $(this).dialog("destroy");
          logout();
        };

        return $('<div id="autologout-confirm"> ' +  localSettings.message + '</div>').dialog({
          modal: true,
               closeOnEscape: false,
               width: "auto",
               dialogClass: 'autologout-dialog',
               title: localSettings.title,
               buttons: buttons,
               close: function(event, ui) {
                 logout();
               }
        });
      }

      // A user could have used the reset button on the tab/window they're actively
      // using, so we need to double check before actually logging out.
      function confirmLogout() {
        $(theDialog).dialog('destroy');

        Drupal.ajax['autologout.getTimeLeft'].autologoutGetTimeLeft(function(time) {
          if (time > 0) {
            t = setTimeout(init, time);
          }
          else {
            logout();
          }
        });
      }

      function logout() {
        if (localSettings.use_alt_logout_method) {
          window.location = Drupal.settings.basePath + "?q=autologout_ahah_logout/alt";
        }
        else {
          $.ajax({
            url: Drupal.settings.basePath + "?q=autologout_ahah_logout",
            type: "POST",
            success: function() {
              window.location = localSettings.redirect_url;
            },
            error: function(XMLHttpRequest, textStatus) {
              if (XMLHttpRequest.status == 403 || XMLHttpRequest.status == 404) {
                window.location = localSettings.redirect_url;
              }
            }
          });
        }
      }

      /**
       * Use the Drupal ajax library to handle get time remaining events
       * because if using the JS Timer, the return will update it.
       *
       * @param function callback(time)
       *   The function to run when ajax is successful. The time parameter
       *   is the time remaining for the current user in ms.
       */
      Drupal.ajax.prototype.autologoutGetTimeLeft = function(callback) {
        var ajax = this;

        if (ajax.ajaxing) {
          return false;
        }

        ajax.options.success = function (response, status) {
          if (typeof response == 'string') {
            response = $.parseJSON(response);
          }

          if (typeof response[1].command === 'string' && response[1].command == 'alert') {
            // In the event of an error, we can assume
            // the user has been logged out.
            window.location = localSettings.redirect_url;
          }

          callback(response[2].settings.time);

          // Let Drupal.ajax handle the JSON response.
          return ajax.success(response, status);
        };

        try {
          ajax.beforeSerialize(ajax.element, ajax.options);
          $.ajax(ajax.options);
        }
        catch (e) {
          ajax.ajaxing = false;
        }
      };

      Drupal.ajax['autologout.getTimeLeft'] = new Drupal.ajax(null, $(document.body), {
        url: Drupal.settings.basePath  + '?q=autologout_ajax_get_time_left',
        event: 'autologout.getTimeLeft',
        error: function(XMLHttpRequest, textStatus) {
          // Disable error reporting to the screen.
        }
      });

      /**
       * Use the Drupal ajax library to handle refresh events
       * because if using the JS Timer, the return will update
       * it.
       *
       * @param function timerFunction
       *   The function to tell the timer to run after its been
       *   restarted.
       */
      Drupal.ajax.prototype.autologoutRefresh = function(timerfunction) {
        var ajax = this;

        if (ajax.ajaxing) {
          return false;
        }

        ajax.options.success = function (response, status) {
          if (typeof response == 'string') {
            response = $.parseJSON(response);
          }

          if (typeof response[1].command === 'string' && response[1].command == 'alert') {
            // In the event of an error, we can assume
            // the user has been logged out.
            window.location = localSettings.redirect_url;
          }

          t = setTimeout(timerfunction, localSettings.timeout);
          activity = false;

          // Let Drupal.ajax handle the JSON response.
          return ajax.success(response, status);
        };

        try {
          ajax.beforeSerialize(ajax.element, ajax.options);
          $.ajax(ajax.options);
        }
        catch (e) {
          ajax.ajaxing = false;
        }
      };

      Drupal.ajax['autologout.refresh'] = new Drupal.ajax(null, $(document.body), {
        url: Drupal.settings.basePath  + '?q=autologout_ahah_set_last',
        event: 'autologout.refresh',
        error: function(XMLHttpRequest, textStatus) {
          // Disable error reporting to the screen.
        }
      });

      function keepAlive() {
        Drupal.ajax['autologout.refresh'].autologoutRefresh(keepAlive);
      }

      function refresh() {
        Drupal.ajax['autologout.refresh'].autologoutRefresh(init);
      }

      // Check if the page was loaded via a back button click.
      var $dirty_bit = $('#autologout-cache-check-bit');
      if ($dirty_bit.length !== 0) {

        if ($dirty_bit.val() == '1') {
          // Page was loaded via a back button click, we should
          // refresh the timer.
          refresh();
        }

        $dirty_bit.val('1');
      }
    }
  };
})(jQuery);
;
/*
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
 * JavaScript ajax helper for Algorithm variables retrieving
 */

(function ($) {
  Drupal.behaviors.micaDataset_variable_harmo_algo_datable_init = {

    attach: function (context, settings) {

      if (context === document) {
        var TitleButtonVar = $('#harmo-algo').attr('title-button-var');
        $('#harmo-algo').on('click', function () {
          var idHarmonizationVariable = $(this).attr('var-id');
          var sectionContainer = $('div#harmo-algo');
          $(this).text(Drupal.t('Hide') + ' ' + TitleButtonVar);
          var $btn = $(this).button('loading');
          $('.collapse').collapse();
          $.ajax({
            'url': Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/variables-harmonization-algo/' + idHarmonizationVariable + '/' + JSON.stringify(getSortedVariableNames()),
            'type': 'GET',
            'dataType': 'html',
            'data': '',
            'success': function (data) {
              try {
                var data_decoded = jQuery.parseJSON(data);
                if (!data_decoded.algo) {
                  $('#harmo-algo-empty').removeClass('hidden');
                } else {
                  $('#harmo-algo-empty').addClass('hidden');

                  sectionContainer.append(data_decoded['algo']);
                }
              } catch (e) {
                console.error('micaDataset_variable_harmo_algo_datable_init', e);
              }
            },
            'error': function (data) {
              console.log('Some errors....');
            }
          });

          // WORKAROUND: When the harmonization table is a child, the DataTable is not drawn properly
          Drupal.behaviors.micaDataset_variable_harmo_datatable_init.invalidate(context, $('#harmo-algo'));

          $("#harmo-algo").unbind("click");
          $(this).removeAttr('id');
          $(this).attr('id', 'harmo-algo-toggle');

          $btn.button('reset')
        });
        $('.collapse').on('hidden.bs.collapse', function () {

          $('#harmo-algo-toggle').text(Drupal.t('Show') + ' ' + TitleButtonVar);
        });
        $('.collapse').on('shown.bs.collapse', function () {

          $('#harmo-algo-toggle').text(Drupal.t('Hide') + ' ' + TitleButtonVar);
        });

        function getSortedVariableNames() {
          var table = $('#table-variable-harmonization').DataTable();
          var variableNames = {};
          $.each(table.rows().data(), function (i, cell) {
            variableNames[cell[cell.length - 1]] = null;
          });

          return variableNames;
        }
      }
    }
  }
}(jQuery));
;
/*
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
 * JavaScript ajax helper for Statistics variables retrieving
 */

(function ($) {

  Drupal.behaviors.obiba_mica_variable = {
    attach: function (context, settings) {
      if (context === document) {
        getAjaxTable();
      }

      function getAjaxTable() {
        var alertMEssage = '<div class="alert alert-warning alert-dismissible" role="alert">' +
          '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span>' +
          '<span class="sr-only">Close</span></button> ' + Drupal.t('Unable to retrieve statistics...') + '</div>';

        var message_div_stat_tab = $('#toempty');
        var param_stat_tab = $('#param-statistics');

        var var_id = param_stat_tab.attr('var-id');
        if (var_id) {
          $.ajax({
            'url': Drupal.settings.basePath + Drupal.settings.pathPrefix + 'variable-detail-statistics/' + var_id,
            'type': 'GET',
            'dataType': 'html',
            'data': '',
            'success': function (data) {
              try {
                var data_decoded = jQuery.parseJSON(data);
              } catch (e) {
                console.log(e.message);
              }

              if (typeof data_decoded == 'object') {
                //   console.log(data_decoded);
              }
              if (! data_decoded) {
                param_stat_tab.empty();

                $(alertMEssage).appendTo(param_stat_tab);
              }
              else {
                if (data_decoded.table) {
                  message_div_stat_tab.empty();
                  param_stat_tab.css({'padding-top': '0'});
                  $(data_decoded.table).appendTo(param_stat_tab);
                }
                else {
                  message_div_stat_chart.empty();
                }

                Drupal.attachBehaviors(param_stat_tab, settings);
              }
            },
            'error': function (data) {
              param_stat_tab.empty();
              var $errorMessage = Drupal.t('Error!');
              console.log($errorMessage);
              $($errorMessage).appendTo(param_stat_tab);
            }
          });
        }
        else{
          $('section#section-statistics').remove();
        }
      }
    }
  };

}(jQuery));
;
/*
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
 * JsScript to deal with  attachment files
 */

(function ($) {
  Drupal.behaviors.attachement_download = {
    attach: function (context, settings) {
      $('a#download-attachment').each(function () {
        $(this).on('click', function (event) {
          // create a form for the file upload
          var entityType = $(this).attr('entity');
          var idEntity = $(this).attr('id_entity');
          var fileName = $(this).attr('file_name');
          var filepath = $(this).attr('file_path');
          var form = $("<form action='" + Drupal.settings.basePath + 'download/' + idEntity + '/' + entityType + '/' + fileName + "' method='post'><input name='file_path' type='hidden' value='" + filepath + "'>");
          $(this).after(form);
          form.submit().remove();
          return false;
        });

      });

    }
  }
})(jQuery);
;
/*
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
 * JsScript to deal with the switch links lang widget
 */

(function ($) {

  Drupal.behaviors.hrefLanWrapper = {
    attach: function (context, settings) {

      if (document === context) {
        function updateLinkLang(){
          var redirectPath = Drupal.settings.hrefLanWrapper.path;
          $('a.fragment-link-place-holder').each(function (i,link) {
            var urlParts = location.href.split(redirectPath);
            var newLink = $(link).attr('href').split('#')[0] + (urlParts[1] || '');
            $(link).attr('href', newLink);
          });
        }
        updateLinkLang();
        window.onhashchange = function(){
          updateLinkLang();
        }
        
      }
    }
  };

})(jQuery);
;
(function ($) {

Drupal.toolbar = Drupal.toolbar || {};

/**
 * Attach toggling behavior and notify the overlay of the toolbar.
 */
Drupal.behaviors.toolbar = {
  attach: function(context) {

    // Set the initial state of the toolbar.
    $('#toolbar', context).once('toolbar', Drupal.toolbar.init);

    // Toggling toolbar drawer.
    $('#toolbar a.toggle', context).once('toolbar-toggle').click(function(e) {
      Drupal.toolbar.toggle();
      // Allow resize event handlers to recalculate sizes/positions.
      $(window).triggerHandler('resize');
      return false;
    });
  }
};

/**
 * Retrieve last saved cookie settings and set up the initial toolbar state.
 */
Drupal.toolbar.init = function() {
  // Retrieve the collapsed status from a stored cookie.
  var collapsed = $.cookie('Drupal.toolbar.collapsed');

  // Expand or collapse the toolbar based on the cookie value.
  if (collapsed == 1) {
    Drupal.toolbar.collapse();
  }
  else {
    Drupal.toolbar.expand();
  }
};

/**
 * Collapse the toolbar.
 */
Drupal.toolbar.collapse = function() {
  var toggle_text = Drupal.t('Show shortcuts');
  $('#toolbar div.toolbar-drawer').addClass('collapsed');
  $('#toolbar a.toggle')
    .removeClass('toggle-active')
    .attr('title',  toggle_text)
    .html(toggle_text);
  $('body').removeClass('toolbar-drawer').css('paddingTop', Drupal.toolbar.height());
  $.cookie(
    'Drupal.toolbar.collapsed',
    1,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

/**
 * Expand the toolbar.
 */
Drupal.toolbar.expand = function() {
  var toggle_text = Drupal.t('Hide shortcuts');
  $('#toolbar div.toolbar-drawer').removeClass('collapsed');
  $('#toolbar a.toggle')
    .addClass('toggle-active')
    .attr('title',  toggle_text)
    .html(toggle_text);
  $('body').addClass('toolbar-drawer').css('paddingTop', Drupal.toolbar.height());
  $.cookie(
    'Drupal.toolbar.collapsed',
    0,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

/**
 * Toggle the toolbar.
 */
Drupal.toolbar.toggle = function() {
  if ($('#toolbar div.toolbar-drawer').hasClass('collapsed')) {
    Drupal.toolbar.expand();
  }
  else {
    Drupal.toolbar.collapse();
  }
};

Drupal.toolbar.height = function() {
  var $toolbar = $('#toolbar');
  var height = $toolbar.outerHeight();
  // In modern browsers (including IE9), when box-shadow is defined, use the
  // normal height.
  var cssBoxShadowValue = $toolbar.css('box-shadow');
  var boxShadow = (typeof cssBoxShadowValue !== 'undefined' && cssBoxShadowValue !== 'none');
  // In IE8 and below, we use the shadow filter to apply box-shadow styles to
  // the toolbar. It adds some extra height that we need to remove.
  if (!boxShadow && /DXImageTransform\.Microsoft\.Shadow/.test($toolbar.css('filter'))) {
    height -= $toolbar[0].filters.item("DXImageTransform.Microsoft.Shadow").strength;
  }
  return height;
};

})(jQuery);
;
/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function ($) {
  Drupal.behaviors.obiba_scroll_up_widget = {
    attach: function (context, settings) {

      if (context != document) {
        return;
      }

      var theScrollUp = document.createElement('a');
      theScrollUp.setAttribute('href', "#");
      theScrollUp.setAttribute('id', "back-to-top");
      theScrollUp.setAttribute('title', Drupal.t('Back to top'));
      theScrollUp.setAttribute('class', "btn btn-default btn-xs");

      var icone = document.createElement('i');
      icone.setAttribute('class', "glyphicon glyphicon-chevron-up");

      theScrollUp.appendChild(icone);

      document.getElementsByClassName("region region-content")[0].appendChild(theScrollUp);
      if ($('#back-to-top').length) {

        var scrollTrigger = 100, // px
            backToTop = function () {
              var scrollTop = $(window).scrollTop();
              if (scrollTop > scrollTrigger) {
                $('#back-to-top').addClass('show');
              } else {
                $('#back-to-top').removeClass('show');
              }
            };
        backToTop();
        $(window).on('scroll', function () {
          backToTop();
        });
        $('#back-to-top').on('click', function (e) {
          e.preventDefault();
          $('html,body').animate({
            scrollTop: 0
          }, 700);
        });
      }

    }
  }
}(jQuery));;
