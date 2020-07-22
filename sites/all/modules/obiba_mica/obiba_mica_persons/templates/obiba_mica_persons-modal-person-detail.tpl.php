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

<div id="<?php print $person_uid ?>" class="modal fade" xmlns="http://www.w3.org/1999/html">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3
          class="modal-title">
          <?php print !empty($person->title)?filter_xss($person->title, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
          <?php print !empty($person->firstName)?filter_xss($person->firstName, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
          <?php print !empty($person->lastName)?filter_xss($person->lastName, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
          <?php if (!empty($person->academicLevel)) {
            print ', ' . filter_xss($person->academicLevel, obiba_mica_commons_allowed_filter_xss_tags());
          } ?></h3>
      </div>
      <div class="modal-body" test-ref="modal-body">

        <section>
          <div>
            <table class="table table-striped">
              <tbody>
              <?php if (!empty($person->email)): ?>
                <tr>
                  <th><?php print $localize->getTranslation('contact.email') ?></th>
                  <td test-ref="email"><p><?php print $person->email; ?></p></td>
                </tr>
              <?php endif; ?>

              <?php if (!empty($person->phone)): ?>
                <tr>
                  <th><?php print $localize->getTranslation('contact.phone') ?></th>
                  <td test-ref="phone"><p><?php print $person->phone; ?></p></td>
                </tr>
              <?php endif; ?>

              <?php if (!empty($person->dataAccessCommitteeMember)): ?>
                <tr>
                  <th><?php print $localize->getTranslation('contact.dataAccessCommitteeMember') ?></th>
                  <td test-ref="dataAccessCommitteeMember">
                    <?php print !empty($person->dataAccessCommitteeMember) ? 'YES' : 'NO'; ?>
                  </td>
                </tr>
              <?php endif; ?>

              <?php if (!empty($person->institution->name) ||
                !empty($person->institution->department)
              ): ?>
                <tr>
                  <th><?php print $localize->getTranslation('contact.institution') ?></th>
                  <td test-ref="institutionIdentifier">
                    <?php if (!empty($person->institution->name)): ?>
                      <p>
                        <?php print obiba_mica_commons_get_localized_field($person->institution, 'name'); ?>
                      </p>
                    <?php endif; ?>
                    <?php if (!empty($person->institution->department)): ?>
                      <p>
                        <?php print obiba_mica_commons_get_localized_field($person->institution, 'department'); ?>
                      </p>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endif; ?>
              <?php
              if (!empty($person->institution->address->street) ||
                !empty($person->institution->address->city) ||
                !empty($person->institution->address->zip) ||
                !empty($person->institution->address->state) ||
                !empty($person->institution->address->country)
              ): ?>
                <tr>
                  <th><?php print $localize->getTranslation('address.label') ?></th>
                  <td test-ref="institutionAddress">
                    <?php if (!empty($person->institution->address->street)): ?>
                      <p>
                        <?php print obiba_mica_commons_get_localized_field($person->institution->address, 'street'); ?>
                      </p>
                    <?php endif; ?>
                    <?php if (!empty($person->institution->address->city)): ?>
                      <p>
                        <?php print obiba_mica_commons_get_localized_field($person->institution->address, 'city'); ?>
                      </p>
                    <?php endif; ?>
                    <?php if (!empty($person->institution->address->zip)): ?>
                      <p>
                        <?php print filter_xss($person->institution->address->zip, obiba_mica_commons_allowed_filter_xss_tags()); ?>
                      </p>
                    <?php endif; ?>
                    <?php if (!empty($person->institution->address->country)): ?>
                      <p>
                        <?php if (!empty($person->institution->address->state)): ?>
                          <?php print filter_xss($person->institution->address->state, obiba_mica_commons_allowed_filter_xss_tags()) . ', '; ?>
                        <?php endif; ?>
                        <?php print obiba_mica_commons_countries($person->institution->address->country->iso); ?>
                      </p>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endif; ?>

              </tbody>
            </table>

        </section>
      </div>
    </div>
  </div>
</div>
