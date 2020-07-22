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
 * Code for the obiba_mica_dataset modules.
 */

$harmonization_status_configurations = variable_get_value('obiba_mica_dataset_harmonization_status');
?>

<div>
  <?php if (module_exists('obiba_mica_sets') && $variable_dto->variableType != 'Harmonized'): ?>
  <div class="alert-growl-container">
    <obiba-alert id="MainControllerGrowl"></obiba-alert>
  </div>
  <div class="pull-right md-bottom-margin">
    <div ng-controller="VariableToCartController" ng-init="onInit('<?php print $variable_dto->id; ?>')">
      <a href class="btn btn-success" ng-show="canBeAdded" ng-click="onAdd('<?php print $variable_dto->id; ?>')">
        <i class="fa fa-cart-plus"></i> <?php print $localize->getTranslation('sets.cart.add-to-cart') ?>
      </a>
      <a href class="btn btn-danger" ng-show="canBeRemoved" ng-click="onRemove('<?php print $variable_dto->id; ?>')">
        <i class="fa fa-shopping-cart"></i> <?php print $localize->getTranslation('sets.cart.remove-from-cart') ?>
      </a>
    </div>
  </div>
  <?php endif; ?>
</div>

<div class="clearfix"></div>

<article class="bordered-article">
  <section>
    <div class="row">
      <div class="col-lg-6 col-xs-12 ">
        <h2><?php print $localize->getTranslation('client.label.overview') ?></h2>

        <table class="table table-striped">
          <tbody>

          <?php if (!empty($variable_dto->label)): ?>
            <tr>
              <th><?php print $localize->getTranslation('search.variable.label') ?></th>
              <td><?php print $variable_dto->label; ?></td>
            </tr>
          <?php endif; ?>

          <?php if (!empty($variable_dto->description)): ?>
            <tr>
              <th><?php print $localize->getTranslation('description') ?></th>
              <td><p><?php print obiba_mica_commons_markdown($variable_dto->description); ?></p></td>
            </tr>
          <?php endif; ?>
          <?php //ToDo May be removed if we decide to not show the main Harmonization stusyon a specific variable detail page ?>
          <?php if (!empty($dataset_harmonization_study)): ?><tr>
              <th>
                <?php print $localize->getTranslation('global.harmonization-study'); ?>
              </th>
              <td>
                  <?php
                    print DrupalMicaStudyResource::anchorStudy($dataset_harmonization_study);
                  ?>
              </td>
            </tr>
          <?php endif; ?>

          <?php if (variable_get_value('variable_show_studies')): ?>
            <?php if ((!empty($variable_dto->studySummaries))): ?>
                  <tr>
                      <th>
                        <?php if ($variable_dto->variableType == 'Dataschema') :
                          print $localize->getTranslation('studies');
                        elseif (!empty($variable_dto->studySummaries)) :
                          print $localize->getTranslation('study.label');
                        endif;
                        ?>
                      </th>
                      <td>
                        <?php if ($variable_dto->variableType == 'Dataschema'): ?>
                            <ul class="list-unstyled">
                              <?php foreach ($variable_dto->studySummaries as $study_summary): ?>
                                  <li><?php print DrupalMicaStudyResource::anchorStudy($study_summary); ?></li>
                              <?php endforeach ?>
                            </ul>
                        <?php elseif (!empty($variable_dto->studySummaries)):
                          print DrupalMicaStudyResource::anchorStudy($variable_dto->studySummaries[0]);
                        endif ?>
                      </td>
                  </tr>
            <?php endif; ?>
                      <?php if (($variable_dto->variableType !== 'Dataschema') ): ?>
                  <tr>
                      <th>
                          <?php
                          if ($variable_dto->studySummary->studyResourcePath == DrupalMicaStudyResource::HARMONIZATION_STUDY) {
                              print $localize->getTranslation('global.participant-harmonization-study');
                          } elseif ($variable_dto->variableType == 'Collected') {
                              print $localize->getTranslation('global.individual-study');
                          } else {
                              print $localize->getTranslation('global.included-individual-study');
                          }
                          ?>
                      </th>
                      <td>
                        <?php
                          print DrupalMicaStudyResource::anchorStudy($variable_dto->studySummary);
                       ?>
                      </td>
                  </tr>
            <?php endif; ?>
          <?php endif; ?>

          <?php if (!empty($variable_dto->datasetId)): ?>
            <tr>
              <th><?php print $localize->getTranslation('dataset.details'); ?></th>
              <td>
                <p>
                  <?php print DrupalMicaDatasetResource::variableDatasetLink($variable_dto); ?>
                </p>
              </td>
            </tr>
          <?php endif; ?>

          <tr>
            <th><?php print $localize->getTranslation('client.label.variable.value-type'); ?></th>
            <td>
              <p><?php print $localize->getTranslation('variable_taxonomy.vocabulary.valueType.term.' . $variable_dto->valueType . '.title'); ?></p>
            </td>
          </tr>

          <?php if (!empty($variable_dto->unit)): ?>
            <tr>
              <th><?php print $localize->getTranslation('client.label.variable.unit'); ?></th>
              <td>
                <p><?php print t('@varUnit', array('@varUnit' => $variable_dto->unit)); ?></p>
              </td>
            </tr>
          <?php endif; ?>

          <tr>
            <th><?php print $localize->getTranslation('client.label.variable.variable-type'); ?></th>
            <td>
              <p>
                <?php $variable_type = $variable_dto->variableType?>
                <?php if ($show_variable_type_as_dataschema): ?>
                  <?php $variable_type = 'DataSchema'; ?>
                <?php endif; ?>
                <?php $variable_type = $localize->getTranslation('client.variable.type.'.$variable_type); ?>
                <?php print t('@type', array('@type' =>
                  $variable_type)); ?>
                <?php if ($variable_dto->variableType == 'Harmonized'): ?>
                  <?php print '(' . DrupalMicaDatasetResource::variableHarmonized($variable_dto) . ')'; ?>
                <?php endif; ?>
              </p>
            </td>
          </tr>

          </tbody>
        </table>
      </div>
      <div class="col-lg-6 col-xs-12">
        <!-- Taxonomy terms -->
        <?php if (!empty($variable_dto->termAttributes)): ?>
          <h2><?php print $localize->getTranslation('classifications.title') ?></h2>
          <table class="table table-striped">
            <tbody>
            <?php foreach ($variable_dto->termAttributes as $term_attributes) : ?>
              <tr>
                <td colspan="2" data-toggle="tooltip"
                  title="<?php print obiba_mica_commons_get_localized_field($term_attributes->taxonomy, 'descriptions'); ?>">
                  <p class="help-block">
                    <?php print obiba_mica_commons_get_localized_field($term_attributes->taxonomy, 'titles'); ?>
                  </p>
                </td>
              </tr>
              <?php foreach ($term_attributes->vocabularyTerms as $term_attribute) : ?>
                <tr>

                  <th data-toggle="tooltip"
                    title="<?php print obiba_mica_commons_get_localized_field($term_attribute->vocabulary, 'descriptions'); ?>">
                    <?php print obiba_mica_commons_get_localized_field($term_attribute->vocabulary, 'titles'); ?>
                  </th>
                  <td>
                    <?php if (count($term_attribute->terms) == 1): ?>
                      <p data-toggle="tooltip"
                        title="<?php print obiba_mica_commons_get_localized_field($term_attribute->terms[0], 'descriptions'); ?>">
                        <?php print obiba_mica_commons_get_localized_field($term_attribute->terms[0], 'titles'); ?>
                      </p>
                    <?php else: ?>
                      <ul class="list-unstyled">
                        <?php foreach ($term_attribute->terms as $term) : ?>
                          <li data-toggle="tooltip"
                            title="<?php print obiba_mica_commons_get_localized_field($term, 'descriptions'); ?>">
                            <?php print obiba_mica_commons_get_localized_field($term, 'titles'); ?>
                          </li>
                        <?php endforeach; ?>
                      </ul>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endforeach; ?>

            </tbody>
          </table>
        <?php endif; ?>

      </div>
    </div>

  </section>

  <!-- CATEGORIES -->
  <?php if (!empty($variable_dto->categories)): ?>
    <section>
      <h2><?php print $localize->getTranslation('client.label.variable.categories') ?></h2>

      <div class="row">
        <div class="col-md-6 col-sm-12">
          <?php print obiba_mica_dataset_variable_get_categories($variable_dto->categories); ?>
        </div>
      </div>
    </section>
  <?php endif; ?>

  <!-- STATISTICS -->
  <?php if (variable_get_value('mica_statistics')): ?>
    <section id="section-statistics">
      <h2>
        <?php print $localize->getTranslation('client.label.variable.statistics') ?>
        <?php if (strcasecmp($variable_dto->nature, 'CATEGORICAL') === 0 && $variable_dto->variableType !== 'Harmonized'): ?>
          <span class="pull-right">
        <?php if (module_exists('obiba_mica_analysis') && obiba_mica_analysis_user_permission() && variable_get_value('mica_statistics')) :
          print DrupalMicaDatasetResource::variableCrosstab($variable_dto, TRUE);
        endif;
        ?>
      </span>
        <?php endif; ?>
      </h2>
      <?php
      $column_for_detail_statistics = 6;
      if (!variable_get_value('dataset_detailed_var_stats') && $variable_dto->variableType == 'Dataschema') : ?>
        <p><?php print $localize->getTranslation('client.label.variable.cummulative-summary') ?></p>
      <?php endif; ?>
      <?php if ($variable_dto->variableType == 'Dataschema' && variable_get_value('dataset_detailed_var_stats')): ?>
        <div class="scroll-content-tab">
          <div class="table-statistic-var">
            <div id="param-statistics"
              var-id="<?php print $variable_dto->id; ?>"
              <?php if (!variable_get_value('dataset_detailed_var_stats')) : ?> class="statistic-tab"<?php endif; ?> >
              <div id="toempty">
                <img
                  src="<?php print base_path() . drupal_get_path('theme', obiba_mica_commons_get_current_theme()) ?>/img/spin.gif">
              </div>
            </div>
          </div>
        </div>
        <div ng-controller="VariableCoverageChartController">
          <div ng-repeat="d3Config in d3Configs">
            <obiba-nv-chart chart-config="d3Config"></obiba-nv-chart>
          </div>
        </div>
      <?php else: ?>
        <div class="row">
          <div
            class="col-md-6 col-sm-12">
            <div id="param-statistics"
              var-id="<?php print $variable_dto->id; ?>"
              <?php if (!variable_get_value('dataset_detailed_var_stats')) : ?> class="statistic-tab"<?php endif; ?> >
              <div id="toempty">
                <img
                  src="<?php print base_path() . drupal_get_path('theme', obiba_mica_commons_get_current_theme()) ?>/img/spin.gif">
              </div>
            </div>
          </div>
          <div class="col-md-6 col-sm-12">
            <div ng-controller="VariableCoverageChartController">
              <div ng-repeat="d3Config in d3Configs">
                <obiba-nv-chart chart-config="d3Config"></obiba-nv-chart>
              </div>
            </div>
          </div>
        </div>
      <?php endif; ?>
    </section>
  <?php endif; ?>

  <?php if ($variable_dto->variableType != DrupalMicaDatasetResource::COLLECTED_VARIABLE): ?>
    <section>
      <h2><?php print $localize->getTranslation('client.label.variable.harmonization') ?></h2>
      <?php print render($harmonization_table_legend); ?>
      <?php if ($variable_dto->variableType == 'Dataschema'): ?>

        <div id="variable-harmonization-table">
          <div class="row">
            <div class="col-lg-12 col-xs-12">
              <table class="table table-striped"
                id="table-variable-harmonization"></table>
            </div>
          </div>
        </div>

        <div class="scroll-content-tab">
          <?php obiba_mica_dataset_variable_get_harmonizations($variable_dto); ?>
        </div>
        <?php if (!empty($variable_harmonization_algorithms)): ?>
          <?php if (!empty(variable_get_value('variable_algorithm'))): ?>
          <button id="harmo-algo"
            data-loading-text="<?php print $localize->getTranslation('loading') ?>"
            type="button"
            class="btn btn-success md-bottom-margin margin-top-20"
            data-toggle="collapse"
            data-target="#harmo-algo"
            aria-expanded="true"
            aria-controls="harmo-algo"
            var-id="<?php print $variable_dto->id; ?>"
            title-button-var="<?php print $localize->getTranslation('client.label.variable.harmonization-algo'); ?>"
            >

              <?php print $localize->getTranslation('client.label.variable.show-harmo-algo') ?>
            </button>
            <div id="harmo-algo" class="collapse">
              <div id="harmo-algo-empty" class="alert alert-info hidden"><?php print $localize->getTranslation('client.message.variable.no-harmonization-algo'); ?></div>
            </div>
          <?php endif; ?>

        <?php endif; ?>
      <?php else: ?>
        <div class="row">
          <div class="col-md-6 col-xs-12 ">

            <table class="table table-striped">
              <tbody>
              <tr>
                <th><?php print $localize->getTranslation('status'); ?></th>
                <td>
                    <span data-toggle="tooltip" class="<?php print $harmonization_status_configurations[$variable_harmonization['status']]['icon'] ?>"
                          title="<?php print $harmonization_status_configurations[$variable_harmonization['status']]['title']  ?>"></span>
                </td>
              </tr>
              <?php if (!empty($variable_harmonization['status_detail'])): ?>
              <tr>
                <th><?php print $localize->getTranslation('client.label.variable.status-detail'); ?></th>
                <td>
                  <span><?php print t(ucfirst($variable_harmonization['status_detail'])) ?></span>
                </td>
              </tr>
              <?php endif ?>
              <tr>
                <th><?php print $localize->getTranslation('comment-label'); ?></th>
                <td>
                  <p><?php print empty($variable_harmonization['comment']) ? '<i>None</i>' : obiba_mica_commons_markdown(filter_xss($variable_harmonization['comment'], obiba_mica_commons_allowed_filter_xss_tags())); ?></p>
                </td>
              </tr>
              </tbody>
            </table>

          </div>
        </div>
        <?php if (!empty(variable_get_value('variable_algorithm'))): ?>
          <?php if ($variable_harmonization['status'] == 'complete'): ?>
            <?php if (!empty($variable_harmonization['algorithm'])): ?>
              <h2><?php print $localize->getTranslation('config.keys.algo') ?></h2>
              <div class="row">
                <div class="col-md-6 col-sm-12">
                  <?php print $variable_harmonization['algorithm']; ?>
                </div>
              </div>
            <?php elseif (!empty($variable_harmonization['script'])) : ?>
              <h4><?php print $localize->getTranslation('client.label.variable.script'); ?></h4>
              <pre class="prettyprint lang-js">
            <?php print $variable_harmonization['script']; ?>
          </pre>
            <?php endif; ?>
          <?php endif; ?>
        <?php endif; ?>

      <?php endif; ?>
    </section>
  <?php endif; ?>
</article>
