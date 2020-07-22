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
?>

<div class="row sm-bottom-margin document-item-list flex-row">
  <div class="col-xs-12">
    <div>
      <h4>
        <?php print MicaClientPathProvider::project($project->id, obiba_mica_commons_get_localized_field($project, 'title')); ?>
      </h4>
    </div>
    <hr class="no-margin">
    <p class="md-top-margin">
      <small>
        <?php
          print MicaClientAnchorHelper::ellipses(
            t('Read more'),
            obiba_mica_commons_get_localized_field($project, 'summary'),
            MicaClientPathProvider::project($project->id)
          );
        ?>
      </small>
    </p>
    <p class="md-top-margin">
      <blockquote-small class="help-block">
        <?php
          if (!empty($content->startDate)) :
            print($localize->getTranslation('research-project.default.status.start') . ': ' . obiba_mica_commons_convert_and_format_string_date($content->startDate, 'd-m-Y'));
          endif;
        ?>
        <?php
        if (!empty($content->startDate) && !empty($content->endDate)) :
          print(' / ');
        endif;
        ?>
        <?php
          if (!empty($content->endDate)) :
            print($localize->getTranslation('research-project.default.status.end') . ': ' . obiba_mica_commons_convert_and_format_string_date($content->endDate, 'd-m-Y'));
          endif;
        ?>
      </blockquote-small>
    </p>
  </div>
</div>
