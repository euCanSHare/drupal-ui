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


<div class="row md-top-margin">
  <div class="col-xs-12">
    <?php print obiba_mica_commons_markdown(obiba_mica_commons_get_localized_field($project, 'summary')) ?>
  </div>
</div>

<article class="bordered-article md-top-margin">
  <section>
    <div class="row">
      <div class="col-lg-6 col-xs-12">
        <h2><?php print $localize->getTranslation('client.label.overview') ?></h2>

        <?php if (!empty($model->startDate) && !empty($model->endDate)) {
          $progress = obiba_mica_commons_progress_bar($model->startDate, $model->endDate);
          print render($progress); } ?>
        <table class="table table-striped">
          <tbody>
          <?php if(!empty($model->startDate)) : ?>
            <tr>
              <th><?php print $localize->getTranslation('research-project.default.status.start') ?></th>
              <td>
                <p><?php print obiba_mica_commons_convert_and_format_string_date($model->startDate, 'd-m-Y') ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if(!empty($model->endDate)) : ?>
            <tr>
              <th><?php print $localize->getTranslation('research-project.default.status.end') ?></th>
              <td>
                <p><?php print obiba_mica_commons_convert_and_format_string_date($model->endDate, 'd-m-Y') ?></p>
              </td>
            </tr>  
          <?php endif; ?>

          <?php if (module_exists('obiba_mica_data_access_request') && (!empty($project->request) && $project->request->viewable)) : ?>
            <tr>
              <th><?php print $localize->getTranslation('research-project.data-access-request') ?></th>
              <td>
                <p>
                  <?php print MicaClientPathProvider::data_access_request($project->request->id) ?>
                </p>
              </td>
            </tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
      <?php if(!empty($model->name) || !empty($model->institution)) : ?>
        <div class="col-lg-6 col-xs-12">
          <h2><?php print $localize->getTranslation('research-project.default.contact.title') ?></h2>
          <table class="table table-striped">
            <tbody>
            <?php if(!empty($model->name)) : ?>
              <tr>
                <th><?php print $localize->getTranslation('research-project.default.contact.name') ?></th>
                <td>
                  <p><?php print filter_xss($model->name, obiba_mica_commons_allowed_filter_xss_tags()); ?></p>
                </td>
              </tr>
            <?php endif; ?>
            <?php if (!empty($model->institution)) : ?>
              <tr>
                <th><?php print $localize->getTranslation('research-project.default.contact.institution') ?></th>
                <td>
                  <p><?php print filter_xss($model->institution, obiba_mica_commons_allowed_filter_xss_tags()); ?></p>
                </td>
              </tr>
            <?php endif; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <?php if (!empty($file_browser)): ?>
    <section>
      <h2><?php print variable_get_value('files_documents_label'); ?></h2>
      <?php print $file_browser; ?>
    </section>
  <?php endif; ?>

</article>
