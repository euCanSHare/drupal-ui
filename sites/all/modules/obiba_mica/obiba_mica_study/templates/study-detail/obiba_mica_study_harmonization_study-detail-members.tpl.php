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

foreach ($ordered_membership as $membership): ?>
  <?php if (!empty($membership->members)): ?>
    <tr>
      <th><?php print $localize->getTranslation('contact.label-plurial.' . $membership->role); ?></th>
      <td>
        <ul class="list-unstyled">
          <?php foreach ($membership->members as  $key_member => $member) : ?>
            <li>
              <a href="#" data-toggle="modal" test-ref="membership"
                 data-target="#<?php print obiba_mica_person_generate_target_id($membership->role, $study_dto->id, $key_member); ?>">
                <?php print !empty($member->title)?filter_xss($member->title, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
                <?php print !empty($member->firstName)?filter_xss($member->firstName, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
                <?php print !empty($member->lastName)?filter_xss($member->lastName, obiba_mica_commons_allowed_filter_xss_tags()):''; ?>
                <?php if (!empty($member->academicLevel)) {
                  print ', ' . filter_xss($member->academicLevel, obiba_mica_commons_allowed_filter_xss_tags());
                } ?>
                <?php if (!empty($member->institution->name)): ?>
                  (<?php print obiba_mica_commons_get_localized_field($member->institution, 'name'); ?>)
                <?php endif; ?>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      </td>
    </tr>
  <?php endif; ?>
<?php endforeach; ?>
