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
 * Get the dar research project
 */
function obiba_mica_research_project_get_dar_projects() {
  $research_project_resource = new DrupalMicaResearchProjectResource(NULL);
  $response = $research_project_resource->getProjectsWithAccessibleDAR();
  return $response;
}

/**
 * Get the research project form config
 */
function obiba_mica_project_form_get_config() {
  $mica_client = new DrupalMicaResearchProjectResource(NULL);
  $config = $mica_client->getFormDefinition();
  return $config;
}