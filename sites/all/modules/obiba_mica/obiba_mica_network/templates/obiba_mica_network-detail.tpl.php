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
        <?php if (!empty($network_dto->logo->id)): ?>
              <?php if (!empty($logo_network)): ?>
                <div class="col-xs-12 col-md-6">
                    <?php print render($logo_network); ?>
                </div>
              <?php endif; ?>
        <?php endif; ?>
        <?php if (!empty($network_dto->description)): ?>
          <div class="md-top-margin col-xs-12">
            <?php print obiba_mica_commons_markdown(obiba_mica_commons_get_localized_field($network_dto, 'description')); ?>
          </div>
        <?php endif; ?>
    </div>


  <div class="pull-right md-bottom-margin">
  <?php if ($can_edit_draf_document): ?>
    <a title="<?php print $localize->getTranslation('edit') ?>"
       target="_blank"
       href="<?php print MicaClientPathProvider::network_draft_url($network_dto->id) ?>"
       class="btn btn-default">
      <i class="fa fa-pencil-square-o"></i> <?php print $localize->getTranslation('edit') ?></a>
  <?php endif; ?>
  <?php if (!empty($network_dto->studyIds)): ?>
      <?php if (variable_get_value('network_detail_show_search_button') && $draft_view === FALSE): ?>
        <?php print theme('obiba_mica_search_bouton', array(
          'method' => 'MicaClientAnchorHelper::networkVariables',
          'document_id' => $network_dto->id,
          'anchor_attributes' => array('class' =>  MicaClientAnchorHelper::DEFAULT_PRIMARY_BUTTON_CLASSES),
        )); ?>
      <?php endif; ?>
    </div>
  <?php endif; ?>
</div>

<div class="clearfix"></div>

<article class="bordered-article">

  <section>
    <h2><?php print $localize->getTranslation('client.label.overview') ?></h2>

    <div class="row">
      <div class="col-lg-6 col-xs-12">

        <table class="table table-striped">
          <tbody>
          <?php if (!empty($network_dto->acronym)): ?>
            <tr>
              <th><?php print $localize->getTranslation('network.acronym') ?></th>
              <td>
                <p><?php print obiba_mica_commons_get_localized_field($network_dto, 'acronym'); ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($network_dto->model->website)): ?>
            <tr>
              <th><?php print $localize->getTranslation('website') ?></th>
              <td>
                <p><?php
                  print l(obiba_mica_commons_get_localized_field($network_dto, 'acronym') . ' ' . t('website'),
                    $network_dto->model->website,
                    array('attributes' => array('target' => '_blank')));
                  ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($network_dto->memberships)): ?>
            <?php foreach ($network_dto->memberships as $membership): ?>
              <?php if (!empty($membership->members)) : ?>
              <tr>
                <th><?php print $localize->getTranslation('contact.label-plurial.' . $membership->role); ?></th>
                <td>
                  <ul class="list-unstyled">
                      <?php foreach ($membership->members as  $key_member => $member) : ?>
                        <li>
                          <a href="#" data-toggle="modal" test-ref="membership"
                             data-target="#<?php print obiba_mica_person_generate_target_id($membership->role, $network_dto->id, $key_member); ?>">
                            <?php print !empty($member->title)?filter_xss($member->title, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
                            <?php print !empty($member->firstName)?filter_xss($member->firstName, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
                            <?php print !empty($member->lastName)?filter_xss($member->lastName, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
                            <?php if (!empty($member->academicLevel)) {
                              print ', ' . filter_xss($member->academicLevel, obiba_mica_commons_allowed_filter_xss_tags());
                            } ?>
                            (<?php print obiba_mica_commons_get_localized_field($member->institution, 'name'); ?>)
                          </a>
                        </li>
                      <?php endforeach; ?>
                  </ul>
                </td>
              </tr>
              <?php endif; ?>
            <?php endforeach; ?>
          <?php endif; ?>

          </tbody>
        </table>
        <?php if (!empty($associated_people_button)): ?>
          <?php print render($associated_people_button); ?>
          <?php if (!empty($associated_people_modal)): ?>
            <?php print render($associated_people_modal); ?>
          <?php endif; ?>
        <?php endif; ?>
      </div>

      <?php if (!empty($network_dto->attributes)): ?>
        <div class="col-lg-6 col-xs-12">
          <h4><?php print $localize->getTranslation('attributes') ?></h4>

          <p><?php print obiba_mica_dataset_attributes_tab($network_dto->attributes, 'maelstrom'); ?></p>
        </div>
      <?php endif; ?>
    </div>

  </section>
  <?php if (!empty($statistics)): ?>
    <section>
      <h2><?php print $localize->getTranslation('client.label.network.summary-stats'); ?></h2>
      <?php print render($statistics); ?>
    </section>
  <?php endif; ?>

  <?php if (!empty($file_browser)): ?>
    <section>
      <h2><?php print variable_get_value('files_documents_label'); ?></h2>
      <?php print $file_browser; ?>
    </section>
  <?php endif; ?>

  <!-- STUDIES and NETWORKS -->
  <?php if (!empty($network_dto->studySummaries) || !empty($network_dto->networkSummaries)): ?>
    <section>

      <?php if (!empty($network_dto->networkSummaries)): ?>
        <div>
          <h2><?php print $localize->getTranslation('networks') ?></h2>

          <div id="networks-table">
            <div class="row">
              <div class="col-lg-12 col-xs-12">
                <table class="table table-striped" id="table-networks"></table>
              </div>
            </div>
          </div>
        </div>
      <?php endif; ?>

        <div id="individual-studies-report" class="pull-right md-bottom-margin">
            <a href="<?= url('mica/repository/studies/_report_by_network/' . $network_dto->id . '/' . $current_lang . '/ws'); ?>"
               class="btn btn-primary">
                <i class="fa fa-download"></i>
                <?= $localize->getTranslation('report-group.study.button-name') ?>
            </a>
        </div>

        <div id="individual-studies-table">
          <h2><?php print $localize->getTranslation('global.individual-studies') ?></h2>

          <div>
            <div class="row">
              <div class="col-lg-12 col-xs-12">
                <table class="table table-striped" id="table-individual-studies"></table>
              </div>
            </div>
          </div>
        </div>
          <div id="harmonization-studies-table">
              <h2><?php print $localize->getTranslation('global.harmonization-studies') ?></h2>

              <div>
                  <div class="row">
                      <div class="col-lg-12 col-xs-12">
                          <table class="table table-striped" id="table-harmo-studies"></table>
                      </div>
                  </div>
              </div>
          </div>


    </section>
  <?php endif; ?>

  <!-- COVERAGE placeholder -->
  <div ng-controller="VariableCoverageChartController">
    <section id="coverage" ng-if="d3Configs && d3Configs.length">
      <h2><?php print $localize->getTranslation('variable-classifications') ?></h2>

      <div ng-repeat="d3Config in d3Configs" style="margin-top: 50px">
        <obiba-nv-chart chart-config="d3Config"></obiba-nv-chart>
      </div>
    </section>
  </div>

  <div><?php !empty($investigators_modal) ? print $investigators_modal : ''; ?></div>
  <div><?php !empty($contacts_modal) ? print $contacts_modal : ''; ?></div>

</article>
