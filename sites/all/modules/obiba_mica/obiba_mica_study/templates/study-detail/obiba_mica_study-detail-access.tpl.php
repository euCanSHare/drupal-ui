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

<?php
$icon = function($value){
  switch ($value){
    case 'yes':
      return 'glyphicon glyphicon-ok';
      break;
    case 'no':
      return 'glyphicon glyphicon-remove';
      break;
    case 'na':
      return 'glyphicon glyphicon-minus';
      break;
    case 'dk':
      return 'fa fa-question';
      break;
  }
};


?>
<h2 id="access"><?php print $localize->getTranslation('study.access.label') ?></h2>

<div class="row legend lg-bottom-margin">

            <div class="col-md-3"><i class="glyphicon glyphicon-ok"></i> <?php print $localize->getTranslation('global.yes'); ?></div>
            <div class="col-md-3"><i class="glyphicon glyphicon-remove"></i> <?php print $localize->getTranslation('global.no'); ?></div>
            <div class="col-md-3"><i class="glyphicon glyphicon-minus"></i> <?php print $localize->getTranslation('study.access.access_data_sharing_cost.na'); ?></div>
            <div class="col-md-3"><i class="fa fa-question"></i> <?php print $localize->getTranslation('global.don-know'); ?></div>
</div>

<ul class="nav nav-tabs">
  <li role="presentation" class="active">
    <a href="#general" id="general-tab" role="tab" data-toggle="tab" >
      <?php print $localize->getTranslation('study.general-info') ?>
    </a>
  </li>
  <?php if (!empty($study_dto->model->access_restrictions)): ?>
    <li role="presentation">
      <a href="#restriction" id="restriction-tab" role="tab" data-toggle="tab">
        <?php print $localize->getTranslation('study.access.access_restrictions.title') ?>
      </a>
    </li>
  <?php endif; ?>
  <?php if (!empty($study_dto->model->access_fees)): ?>
    <li role="presentation">
      <a href="#fees" id="fees-tab" role="tab" data-toggle="tab">
        <?php print $localize->getTranslation('study.access.access_fees.title') ?>
      </a>
    </li>
  <?php endif; ?>
  <?php if (!empty($study_dto->model->access_supplementary_info)): ?>
      <li role="presentation">
          <a href="#supplementary" id="supplementary-tab" role="tab" data-toggle="tab">
            <?php print $localize->getTranslation('study.access.suppl-info') ?>
          </a>
      </li>
  <?php endif; ?>
</ul>

<div style="min-height: 270px" class="tab-content" id="myTabContent">
<!--    General information-->
  <div class="tab-pane active lg-top-padding lg-right-indent" role="tabpanel" aria-labelledby="general-tab" id="general">
      <label><?php print $localize->getTranslation('study.access.access_external_researchers_permitted_foreseen.title') ?></label>
    <div class="table-responsive">
      <table class="table table-striped valign-table-column">
        <tbody>
        <tr>
          <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_data.title'); ?></td>
          <td>
            <p>
                <span class="<?php print !empty($study_dto->model->access->access_data) ?
                  $icon($study_dto->model->access->access_data): '' ?>"></span>
            </p>
          </td>
        </tr>

        <tr>
          <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_bio_samples.title'); ?></td>
          <td>
            <p>
              <span class="<?php print !empty($study_dto->model->access->access_bio_samples) ?
                $icon($study_dto->model->access->access_bio_samples): ''; ?>"></span>
            </p>
          </td>
        </tr>
        <?php $other_access = obiba_mica_commons_get_localized_field($study_dto->model, 'otherAccess'); ?>
        <tr>
          <td><?php print $localize->getTranslation('study.access.other'); ?></td>
          <td>
              <?php if (!empty($other_access)): ?>
                <?php print $other_access; ?>
              <?php else: ?>
                <span class="<?php print !empty($study_dto->model->access->access_other) ?
                  $icon($study_dto->model->access->access_other): ''; ?>"></span>
            <?php endif; ?>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <?php if (!empty($study_dto->model->access_info_location)): ?>
      <label><?php print $localize->getTranslation('study.access.external_researchers_obtaining_study_data_bio_info.title') ?></label>
      <?php if (in_array('study_website', $study_dto->model->access_info_location) &&
        !empty($study_dto->model->website)): ?>
        <p>
          <?php print $localize->getTranslation('study.access.external_researchers_obtaining_study_data_bio_info.access_info_location.study_website') ?>:
          <a href="<?php print t($study_dto->model->website) ?>" target="_blank">
            <?php print obiba_mica_commons_get_localized_field($study_dto->model, 'website'); ?>
          </a>
        </p>
      <?php endif; ?>
      <?php if (in_array('study_representative', $study_dto->model->access_info_location)): ?>
        <?php $representative_study = $study_dto->model->access_info_representative; ?>
        <p>
          <?php print $localize->getTranslation('study.access.external_researchers_obtaining_study_data_bio_info.access_info_location.study_representative') ?>:
          <a href="#" data-toggle="modal" test-ref="membership" data-target="#representative">
            <?php print !empty($representative_study->title) ? obiba_mica_commons_get_localized_field($representative_study, 'title') . ' ': ' ';
                  print !empty($representative_study->name) ? obiba_mica_commons_get_localized_field($representative_study, 'name') . ' ': ' ';
                  print !empty($representative_study->institution) ? '(' . obiba_mica_commons_get_localized_field($representative_study, 'institution') . ')': ''; ?>
          </a>
        </p>
      <?php endif; ?>
    <?php endif; ?>

  </div>
<!--    Restriction-->
  <?php if (!empty($study_dto->model->access_restrictions)): ?>
    <div class="tab-pane lg-top-padding lg-right-indent" role="tabpanel" aria-labelledby="restriction-tab" id="restriction" >
      <label ><?php print $localize->getTranslation('study.access.access_restrictions.sector-of-research.title') ?></label>
      <table class="table table-responsive table-striped lg-bottom-margin">
        <tr>
          <td></td>
          <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_data.title') ?></td>
          <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_bio_samples.title') ?></td>
        </tr>
        <tr>
          <td><?php print $localize->getTranslation('study.access.access_permission_data.public_sector') ?></td>
          <td><i class="<?php print !empty($study_dto->model->access_permission_data->public_sector) ?
              $icon($study_dto->model->access_permission_data->public_sector): ''; ?>"></i>
          </td>
          <td><i class="<?php print !empty($study_dto->model->access_permission_biological_samples->public_sector) ?
              $icon($study_dto->model->access_permission_biological_samples->public_sector): ''; ?>"></i>
          </td>
        </tr>
        <tr>
          <td><?php print $localize->getTranslation('study.access.access_permission_data.private_sector') ?></td>
          <td><i class="<?php print !empty($study_dto->model->access_permission_data->private_sector) ?
              $icon($study_dto->model->access_permission_data->private_sector): ''; ?>"></i>
          </td>
          <td><i class="<?php print !empty($study_dto->model->access_permission_biological_samples->private_sector) ?
              $icon($study_dto->model->access_permission_biological_samples->private_sector): ''; ?>"></i>
          </td>
        </tr>
        <tr>
          <td><?php print $localize->getTranslation('study.access.access_permission_data.not_for_profit_organization') ?></td>
          <td><i class="<?php print !empty($study_dto->model->access_permission_data->not_for_profit_organization) ?
              $icon($study_dto->model->access_permission_data->not_for_profit_organization): ''; ?>"></i>
          </td>
          <td><i class="<?php print !empty($study_dto->model->access_permission_biological_samples->not_for_profit_organization) ?
              $icon($study_dto->model->access_permission_biological_samples->not_for_profit_organization): ''; ?>"></i>
          </td>
        </tr>
      </table>
      <?php if (!empty($study_dto->model->access_permission_additional_info)): ?>
        <label ><?php print $localize->getTranslation('study.access.access_permission_additional_info.label') ?></label>
        <p class="lg-bottom-margin">
          <?php print obiba_mica_commons_get_localized_field($study_dto->model, 'access_permission_additional_info'); ?>
        </p>
      <?php endif; ?>
        <label ><?php print $localize->getTranslation('study.access.access_restrictions.transfer.title') ?></label>
        <table class="table table-responsive table-striped lg-bottom-margin">
            <tr>
                <td></td>
                <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_data.title') ?></td>
                <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_bio_samples.title') ?></td>
            </tr>
            <tr>
                <td><?php print $localize->getTranslation('study.access.access_data_can_leave.study_facility') ?></td>
                <td><i class="<?php print !empty($study_dto->model->access_data_can_leave->study_facility) ?
                    $icon($study_dto->model->access_data_can_leave->study_facility): ''; ?>"></i>
                </td>
                <td><i class="<?php print !empty($study_dto->model->access_biological_samples_can_leave->study_facility) ?
                    $icon($study_dto->model->access_biological_samples_can_leave->study_facility): ''; ?>"></i>
                </td>
            </tr>
            <tr>
                <td><?php print $localize->getTranslation('study.access.access_data_can_leave.country') ?></td>
                <td><i class="<?php print !empty($study_dto->model->access_data_can_leave->country) ?
                    $icon($study_dto->model->access_data_can_leave->country): ''; ?>"></i>
                </td>
                <td><i class="<?php print !empty($study_dto->model->access_biological_samples_can_leave->country) ?
                    $icon($study_dto->model->access_biological_samples_can_leave->country): ''; ?>"></i>
                </td>
            </tr>
        </table>
      <?php if (!empty($study_dto->model->access_special_conditions_to_leave)): ?>
          <label ><?php print $localize->getTranslation('study.access.access_special_conditions_to_leave.label') ?></label>
          <p>
            <?php print  obiba_mica_commons_get_localized_field($study_dto->model, 'access_special_conditions_to_leave'); ?>
          </p>
      <?php endif; ?>
    </div>
  <?php endif; ?>
<!--    fees-->
  <?php if (!empty($study_dto->model->access_fees)): ?>
    <div class="tab-pane lg-top-padding lg-right-indent" role="tabpanel" aria-labelledby="fees-tab"  id="fees" >
      <?php if (!empty($study_dto->model->access_data_sharing_cost->data) || !empty($study_dto->model->access_data_sharing_cost->biological_samples)): ?>
        <label ><?php print $localize->getTranslation('study.access.access_data_sharing_cost.cost-title') ?></label>
        <table class="table table-striped valign-table-column">
            <tbody>
            <?php if (!empty($study_dto->model->access_data_sharing_cost->data)): ?>
            <tr>
                <td> <?php print $localize->getTranslation('study_taxonomy.vocabulary.access_data.title') ?></td>
                <td><?php print $localize->getTranslation('study.access.access_data_sharing_cost.'.$study_dto->model->access_data_sharing_cost->data) ?></td>
            </tr>
            <?php endif; ?>
            <?php if (!empty($study_dto->model->access_data_sharing_cost->biological_samples)): ?>
            <tr>
                <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_bio_samples.title') ?></td>
                <td><?php print $localize->getTranslation('study.access.access_data_sharing_cost.'.$study_dto->model->access_data_sharing_cost->biological_samples) ?></td>
            </tr>
            <?php endif; ?>
            </tbody>
        </table>
      <?php endif; ?>
      <?php if (!empty($study_dto->model->access_cost_reduction_consideration->data) || !empty($study_dto->model->access_cost_reduction_consideration->bio_samples)): ?>
        <label ><?php print $localize->getTranslation('study.access.access_data_sharing_cost.cost-reduction-title') ?></label>
        <div class="table-responsive">
            <table class="table table-striped valign-table-column">
                <tbody>
                <tr>
                    <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_data.title'); ?></td>
                    <td>
                        <p>
                <span class="<?php print !empty($study_dto->model->access_cost_reduction_consideration->data) ?
                  $icon($study_dto->model->access_cost_reduction_consideration->data): '' ?>"></span>
                        </p>
                    </td>
                </tr>

                <tr>
                    <td><?php print $localize->getTranslation('study_taxonomy.vocabulary.access_bio_samples.title'); ?></td>
                    <td>
                        <p>
              <span class="<?php print !empty($study_dto->model->access_cost_reduction_consideration->bio_samples) ?
                $icon($study_dto->model->access_cost_reduction_consideration->bio_samples): ''; ?>"></span>
                        </p>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
      <?php endif; ?>
      <?php if (!empty($study_dto->model->access_cost_reduction_consideration_specification)): ?>
          <label ><?php print $localize->getTranslation('study.access.access_cost_reduction_consideration_specification.title') ?></label>
        <p class="lg-bottom-margin">
          <?php print obiba_mica_commons_get_localized_field($study_dto->model, 'access_cost_reduction_consideration_specification') ?>
        </p>
        <?php if (!empty($study_dto->model->access_cost_additional_information)): ?>
              <label ><?php print $localize->getTranslation('study.access.access_cost_additional_information.title') ?></label>
        <p>
          <?php print obiba_mica_commons_get_localized_field($study_dto->model, 'access_cost_additional_information') ?>
        </p>
        <?php endif; ?>
      <?php endif; ?>
    </div>
  <?php endif; ?>
<!--    Supp Info-->
  <?php if (!empty($study_dto->model->access_supplementary_info)): ?>

      <div class="tab-pane lg-top-padding lg-right-indent" role="tabpanel" aria-labelledby="supplementary-tab" id="supplementary" >
          <p>
            <?php print  obiba_mica_commons_get_localized_field($study_dto->model, 'access_supplementary_info') ?>
          </p>

      </div>
  <?php endif; ?>
</div>

<?php if (!empty($study_dto->model->access_info_representative)): ?>
  <?php print theme('obiba_mica_access_representative_modal', array(
    'person' => $study_dto->model->access_info_representative)); ?>
<?php endif; ?>


