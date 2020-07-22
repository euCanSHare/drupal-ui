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
         href="<?php print DrupalMicaStudyResource::study_draft_url($study_dto->id) ?>"
         class="btn btn-default">
        <i class="fa fa-pencil-square-o"></i> <?php print $localize->getTranslation('edit')?></a>
    <?php endif; ?>

    <?php if (variable_get_value('study_detail_show_search_button') && $draft_view === FALSE): ?>
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

          <?php if (!empty($study_dto->model->startYear)): ?>
            <tr>
              <th><?php print $localize->getTranslation('study.start-year') ?></th>
              <td><p><?php print $study_dto->model->startYear; ?></p></td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($study_dto->model->endYear)): ?>
            <tr>
              <th><?php print $localize->getTranslation('study.end-year') ?></th>
              <td><p><?php print $study_dto->model->endYear; ?></p></td>
            </tr>
          <?php endif; ?>
          <?php $funding = obiba_mica_commons_get_localized_field($study_dto->model, 'funding'); ?>
          <?php if ($funding): ?>
            <tr>
              <th><?php print $localize->getTranslation('funding') ?></th>
              <td><p><?php print $funding; ?></p></td>
            </tr>
          <?php endif; ?>
          </tbody>
        </table>

      </div>
      <?php
      $show_participant_design = !empty($study_dto->model->numberOfParticipants->participant->number) || !empty($study_dto->model->numberOfParticipants->participant->noLimit);
      $show_sample_design = !empty($study_dto->model->numberOfParticipants->sample->number) || !empty($study_dto->model->numberOfParticipants->sample->noLimit);

      $show_number_of_participant_part = !empty($study_dto->model->numberOfParticipants) && ($show_participant_design || $show_sample_design);

      if (
          (!empty($study_dto->model->methods) && !empty($show_number_of_participant_part)) ||
          (!empty($study_dto->model->methods) && empty($show_number_of_participant_part)) ||
          (empty($study_dto->model->methods) && !empty($show_number_of_participant_part))
      ) : ?>
      <div class="col-lg-6  col-xs-12">
        <!-- GENERAL DESIGN -->
        <h2 id="design"><?php print $localize->getTranslation('study.general-design') ?></h2>

        <table class="table table-striped">
          <tbody>

          <?php if (!empty($study_dto->model->methods->design)): ?>
            <tr>
              <th><?php print $localize->getTranslation('search.study.design') ?></th>
              <td>
                <?php print $localize->getTranslation("study_taxonomy.vocabulary.methods-design.term." . $study_dto->model->methods->design . ".title"); ?>
                <?php $other_design =obiba_mica_commons_get_localized_field($study_dto->model->methods, 'otherDesign'); ?>
                <?php if (!empty($other_design)): ?>
                    : <?php print $other_design; ?>
                  <?php endif; ?>
              </td>
            </tr>
          <?php endif; ?>

          <?php
            $follow_up_info = false;
            if (!empty($study_dto->model->methods)) :
              $follow_up_info = obiba_mica_commons_get_localized_field($study_dto->model->methods, 'followUpInfo');
            endif;
          ?>
          <?php if (!empty($follow_up_info)): ?>
            <tr>
              <th><?php print $localize->getTranslation('study.follow-up-help') ?></th>
              <td>
                <p><?php print $follow_up_info; ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($study_dto->model->methods->recruitments)): ?>
            <tr>
              <th><?php print $localize->getTranslation('study.recruitment-target') ?></th>
              <td>
                <ul class="list-unstyled">
                  <?php foreach ($study_dto->model->methods->recruitments as $recruitment): ?>
                    <li>
                      <?php print $localize->getTranslation('study_taxonomy.vocabulary.methods-recruitments.term.' . $recruitment . '.title') ; ?>
                      <?php $other_recruitement = obiba_mica_commons_get_localized_field($study_dto->model->methods, 'otherRecruitment');?>
                      <?php if (stristr($recruitment, 'other') && !empty($other_recruitement)): ?>
                         : <?php print $other_recruitement; ?>
                      <?php endif; ?>
                    </li>
                  <?php endforeach; ?>
                </ul>
              </td>
            </tr>
          <?php endif; ?>
          <?php if (!empty($show_participant_design)): ?>
            <tr>
              <th><?php print $localize->getTranslation('numberOfParticipants.participants') ?></th>
              <td>
                <p>
                  <?php if (!empty($study_dto->model->numberOfParticipants->participant->number)) {
                    print obiba_mica_commons_format_number($study_dto->model->numberOfParticipants->participant->number);
                  } ?>
                  <?php if (!empty($study_dto->model->numberOfParticipants->participant->noLimit)): ?>
                    (<?php print $localize->getTranslation('numberOfParticipants.no-limit'); ?>)
                  <?php endif; ?>
                </p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($show_sample_design)): ?>
            <tr>
              <th><?php print $localize->getTranslation('numberOfParticipants.sample') ?></th>
              <td>
                <p>
                  <?php if (!empty($study_dto->model->numberOfParticipants->sample->number)) {
                    print obiba_mica_commons_format_number($study_dto->model->numberOfParticipants->sample->number);
                  } ?>
                  <?php if (!empty($study_dto->model->numberOfParticipants->sample->noLimit)): ?>
                    (<?php print $localize->getTranslation('numberOfParticipants.no-limit'); ?>)
                  <?php endif; ?>
                </p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty(obiba_mica_commons_get_localized_field($study_dto->model->numberOfParticipants, 'info'))): ?>
            <tr>
              <th><?php print $localize->getTranslation('numberOfParticipants.suppl-info') ?></th>
              <td>
                <p><?php print obiba_mica_commons_get_localized_field($study_dto->model->numberOfParticipants, 'info'); ?></p>
              </td>
            </tr>
          <?php endif; ?>
          <?php
            $methods_supp_info = false;
            if (!empty($study_dto->model->methods)) :
              $methods_supp_info = obiba_mica_commons_get_localized_field($study_dto->model->methods, 'info');
            endif;
          ?>
          <?php if (!empty($methods_supp_info)): ?>
            <tr>
              <th><?php print $localize->getTranslation('suppl-info') ?></th>
              <td>
                <p><?php print $methods_supp_info; ?></p>
              </td>
            </tr>
          <?php endif; ?>
          </tbody>
        </table>

      </div>
      <?php endif; ?>
    </div>

  </section>

  <?php if (!empty($study_dto->model->access) || !empty($study_dto->model->markerPaper) || !empty($study_dto->model->pubmedId)): ?>
      <section>

    <div class="row">
          <?php if (!empty($study_dto->model->access)): ?>
      <div class="col-lg-7 col-xs-12">
        <!-- ACCESS -->

          <?php print theme('obiba_mica_study-detail-access', array(
            'study_dto' => $study_dto)); ?>

      </div>
           <?php endif; ?>
      <div class="col-lg-5 col-xs-12">
        <!-- MARKER PAPER -->
        <?php if (!empty($study_dto->model->markerPaper) || !empty($study_dto->model->pubmedId)): ?>
          <h2 id="marker"><?php print $localize->getTranslation('study.marker-paper') ?></h2>
          <?php if (!empty($study_dto->model->markerPaper)): ?>
            <p><?php print filter_xss($study_dto->model->markerPaper, obiba_mica_commons_allowed_filter_xss_tags()); ?></p>
          <?php endif; ?>
          <?php if (!empty($study_dto->model->pubmedId)): ?>
            <p>
              <a
                href="http://www.ncbi.nlm.nih.gov/pubmed/<?php print $study_dto->model->pubmedId; ?>"
                target="_blank">
                PUBMED <?php print filter_xss($study_dto->model->pubmedId, obiba_mica_commons_allowed_filter_xss_tags()); ?>
              </a>
            </p>
          <?php endif; ?>
        <?php endif; ?>
      </div>
    </div>

  </section>
  <?php endif; ?>

  <!-- SUPPLEMENTARY INFORMATION -->
  <?php $sup_info = obiba_mica_commons_get_localized_field($study_dto->model, 'info'); ?>
  <?php if (!empty($sup_info)): ?>
    <section>
      <h2 id="info"><?php print $localize->getTranslation('suppl-info'); ?></h2>

      <p><?php print $sup_info; ?></p>
    </section>
  <?php endif; ?>

  <!-- DOCUMENTS -->

  <!-- TODO find a way not to show browser if there are no files -->
  <?php if (!empty($file_browser)): ?>
    <section>
      <h2><?php print variable_get_value('files_documents_label'); ?></h2>
      <?php print $file_browser ; ?>
    </section>
  <?php endif; ?>

  <!-- TIMELINE -->
  <?php if (!empty($timeline)): ?>
    <section>
      <h2 id="timeline"><?php print $localize->getTranslation('study.timeline'); ?></h2>

      <p class="help-block">
        <?php print $localize->getTranslation('study.help-text-timeline'); ?>
      </p>

      <div class="scroll-content-tab">
        <?php print $timeline; ?>
      </div>
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
        <?php print reset($populations)['html']; ?>
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
                <?php endif; ?>
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
                  <?php endif; ?>
                <?php endforeach ?>
              </div>
          </div>
        </div>

      <?php endif ?>
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
  <div><?php !empty($dce_fix_modal) ? print $dce_fix_modal : ''; ?></div>
</article>
<div class="back-to-top t_badge"><i class="glyphicon glyphicon-arrow-up"></i>
</div>
