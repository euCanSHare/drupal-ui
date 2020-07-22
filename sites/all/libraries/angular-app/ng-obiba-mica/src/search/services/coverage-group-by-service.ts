/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

interface ICoverageGroupByService {
  isSingleStudy(): boolean;
  canShowStudyType(): boolean;
  canShowStudy(): boolean;
  canShowDce(bucket: string[]): boolean;
  canShowDataset(): boolean;
  canShowVariableTypeFilter(bucket: string[]): boolean;
  studyTitle(): string;
  studyBucket(): string;
  dceBucket(): string;
  datasetTitle(): string;
  datasetBucket(): string;
  canGroupBy(bucket: string);
  defaultBucket(): string;
}

/* global BUCKET_TYPES  */

class CoverageGroupByService implements ICoverageGroupByService {

  private options;
  private groupByOptions;

  constructor(ngObibaMicaSearch) {
    this.options = ngObibaMicaSearch.getOptions();
    this.groupByOptions = this.options.coverage.groupBy;
  }

  public isSingleStudy(): boolean {
    // coverage => there are datasets and at least one study
    // not showing study means that there is only one
    return !this.options.studies.showSearchTab;
  }

  public canShowStudyType(): boolean {
    // showing study type column means that there are several
    return this.options.studies.studiesColumn.showStudiesTypeColumn;
  }

  public canShowStudy(): boolean {
    return this.groupByOptions.study || this.groupByOptions.dce;
  }

  public canShowDce(bucket: string[]): boolean {
    return (bucket.indexOf("study") > -1 || bucket.indexOf("dce") > -1)
      && this.groupByOptions.study && this.groupByOptions.dce;
  }

  public canShowDataset(): boolean {
    return this.groupByOptions.dataset;
  }

  public canShowVariableTypeFilter(bucket: string[]): boolean {
    const forStudy = (bucket.indexOf("study") > -1 || bucket.indexOf("dce") > -1) && (this.groupByOptions.study);
    const forDataset = bucket.indexOf("dataset") > -1 && this.groupByOptions.dataset;
    return forStudy || forDataset;
  }

  public studyTitle(): string {
    return "search.coverage-buckets.study";
  }

  public studyBucket(): string {
    return BUCKET_TYPES.STUDY;
  }

  public dceBucket(): string {
    if (this.groupByOptions.study && this.groupByOptions.dce) {
      return BUCKET_TYPES.DCE;
    } else {
      return this.studyBucket();
    }
  }

  public datasetTitle(): string {
    return "search.coverage-buckets.dataset";
  }

  public datasetBucket(): string {
    return BUCKET_TYPES.DATASET;
  }

  public canGroupBy(bucket: string) {
    let isAllowed = false;

    switch (bucket) {
      case BUCKET_TYPES.STUDY:
      case BUCKET_TYPES.STUDY_INDIVIDUAL:
      case BUCKET_TYPES.STUDY_HARMONIZATION:
        isAllowed = this.groupByOptions.study;
        break;
      case BUCKET_TYPES.DCE:
      case BUCKET_TYPES.DCE_INDIVIDUAL:
      case BUCKET_TYPES.DCE_HARMONIZATION:
        isAllowed = this.groupByOptions.dce;
        break;
      case BUCKET_TYPES.DATASET:
      case BUCKET_TYPES.DATASET_COLLECTED:
      case BUCKET_TYPES.DATASCHEMA:
      case BUCKET_TYPES.DATASET_HARMONIZED:
        isAllowed = this.groupByOptions.dataset;
    }
    return isAllowed;
  }

  public defaultBucket(): string {
    if (this.groupByOptions.study) {
      if (this.options.studies.showSearchTab) {
        return this.studyBucket();
      } else {
        return this.dceBucket();
      }
    } else if (this.groupByOptions.dataset) {
      return this.datasetBucket();
    }

    return "";
  }
}

ngObibaMica.search.service("CoverageGroupByService", ["ngObibaMicaSearch", CoverageGroupByService]);
