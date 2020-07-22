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

<div>
  <div class="row md-bottom-margin">
    <?php if (!empty($study_dto->logo->id)): ?>
      <div class="col-xs-12 col-md-6">
        <?php if (!empty($logo_study)): ?>
          <?php print render($logo_study); ?>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <div class="md-top-margin col-xs-12">
      <?php print obiba_mica_commons_markdown(obiba_mica_commons_get_localized_field($study_dto, 'objectives')); ?>
    </div>

  </div>

  <div class="pull-right md-bottom-margin">
    <?php if ($can_edit_draf_document): ?>
      <a title="<?php print $localize->getTranslation('edit') ?>"
         target="_blank"
         href="<?php print DrupalMicaStudyResource::study_draft_url($study_dto->id, DrupalMicaStudyResource::HARMONIZATION_STUDY) ?>"
         class="btn btn-default">
        <i class="fa fa-pencil-square-o"></i> <?php print $localize->getTranslation('edit')?></a>
    <?php endif; ?>

    <?php if (variable_get_value('harmo_study_detail_show_search_button') && $draft_view === FALSE): ?>
      <?php print theme('obiba_mica_search_bouton', array(
        'method' => 'MicaClientAnchorHelper::studyVariables',
        'document_id' => $study_dto->id,
        'anchor_attributes' => array('class' =>  MicaClientAnchorHelper::DEFAULT_PRIMARY_BUTTON_CLASSES),
      )); ?>
    <?php endif; ?>
  </div>
</div>

<div class="clearfix"></div>

<article class="bordered-article">

  <section>
    <div class="row">
      <div class="col-lg-6 col-xs-12 ">
        <!-- GENERAL INFORMATION -->
        <h2 id="overview"><?php print $localize->getTranslation('client.label.overview') ?></h2>

        <table class="table table-striped">
          <tbody>

          <?php if (!empty($study_dto->acronym)): ?>
            <tr>
              <th><?php print $localize->getTranslation('study.acronym') ?></th>
              <td>
                <p><?php print obiba_mica_commons_get_localized_field($study_dto, 'acronym'); ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($study_dto->model->website)): ?>
            <tr>
              <th><?php print $localize->getTranslation('website') ?></th>
              <td>
                <p><?php
                  print l(obiba_mica_commons_get_localized_field($study_dto, 'acronym') . ' ' . $localize->getTranslation('website'),
                    $study_dto->model->website,
                    array('attributes' => array('target' => '_blank')));
                  ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($ordered_membership)): ?>
            <?php print theme('obiba_mica_study-detail-members', array(
                    'ordered_membership' => $ordered_membership,
                    'study_dto' => $study_dto)); ?>
          <?php endif; ?>
          </tbody>
        </table>

      </div>
      <?php if (!empty($study_dto->model->harmonizationDesign)): ?>
          <div class="col-lg-6  col-xs-12">
              <!-- harmonization  DESIGN -->
              <h2 id="design"><?php print $localize->getTranslation('study_taxonomy.vocabulary.harmonizationDesign.title') ?></h2>
              <table class="table table-striped">
                  <tbody>
                  <td><?php  print obiba_mica_commons_markdown(obiba_mica_commons_get_localized_field($study_dto->model, 'harmonizationDesign')) ?> </td>
                  </tbody>
              </table>
          </div>
      <?php endif; ?>
    </div>

  </section>

  <!-- DOCUMENTS -->

  <!-- TODO find a way not to show browser if there are no files -->
  <?php if (!empty($file_browser)): ?>
    <section>
      <h2><?php print variable_get_value('files_documents_label'); ?></h2>
      <?php print $file_browser ; ?>
    </section>
  <?php endif; ?>

  <!-- POPULATIONS -->
  <?php if (!empty($populations)): ?>
    <?php $population_array = $populations; unset($population_array['dce-info']); $population_length = sizeof($population_array) ; ?>
    <section>
      <h2 id="populations"><?php if ($population_length > 1) {
          print $localize->getTranslation('study.populations');
        }
        else print '<span id="population-1">' . $localize->getTranslation('study.population') . '</span>' ?></h2>
      <?php if ($population_length == 1): ?>
        <?php print $populations[1]['html']; ?>
      <?php else: ?>

        <div class="row tabbable tabs-left">
          <div class="col-lg-2 col-xs-12  ">
            <ul class="nav nav-pills nav-stacked" id="tab-pane">
              <?php foreach ($populations as $key => $population): ?>
              <?php if ($key != 'dce-info'): ?>
                <li test-ref="population-tab" <?php if ($key == array_keys($populations)[0]) {
                  print 'class="active"';
                } ?>>
                  <a href="#population-<?php print $key; ?>" data-toggle="pill">
                    <?php print obiba_mica_commons_get_localized_field($population['data']['data'], 'name'); ?>
                  </a>
                </li>
              <?php endif;?>
              <?php endforeach ?>
            </ul>
          </div>
          <div class="col-lg-10 col-xs-12  ">
              <div class="tab-content indent" test-ref="population-tab-content">
                <?php foreach ($populations as $key => $population): ?>
                  <?php if ($key != 'dce-info'): ?>
                  <?php $active_population_tab = $key == array_keys($populations)[0]; ?>
                    <div
                            class="tab-pane  <?php print $active_population_tab ? 'active' : '' ?>"
                            id="population-<?php print $key ?>">
                      <?php print $population['html']; ?>
                    </div>
                  <?php endif;?>
                <?php endforeach ?>
              </div>
          </div>
        </div>

      <?php endif ?>
    </section>
  <?php endif; ?>

  <?php if (!empty($study_tables) && variable_get_value('harmo_study_show_individual_studies')): ?>
    <section id="study-tables">
      <?php print render($study_tables); ?>
    </section>
  <?php endif; ?>

  <!-- NETWORKS placeholder -->
  <section id="networks">
    <div><?php print $localize->getTranslation('loading') ?></div>
  </section>

  <!-- DATASETS placeholder -->
  <section id="datasets">
    <div><?php print $localize->getTranslation('loading') ?></div>
  </section>

  <!-- COVERAGE placeholder -->
  <div ng-controller="VariableCoverageChartController">
    <section id="coverage" ng-if="d3Configs && d3Configs.length">
      <h2><?php print $localize->getTranslation('variable-classifications') ?></h2>

      <div ng-repeat="d3Config in d3Configs">
        <obiba-nv-chart chart-config="d3Config"></obiba-nv-chart>
      </div>
    </section>
  </div>
  

  <div><?php !empty($investigators_modal) ? print $investigators_modal : ''; ?></div>
  <div><?php !empty($contacts_modal) ? print $contacts_modal : ''; ?></div>
  <div><?php !empty($members_modal) ? print $members_modal : ''; ?></div>
</article>
<div class="back-to-top t_badge"><i class="glyphicon glyphicon-arrow-up"></i>
</div>
