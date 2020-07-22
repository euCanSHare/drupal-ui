<div>
  <uib-tabset active="activeTab" class="voffset5">

    <uib-tab heading="{{'graphics.geo-charts' | translate}}" ng-show="getVocabulary('populations-selectionCriteria-countriesIso')">
    </uib-tab>
    
    <uib-tab heading="{{'graphics.study-design' | translate}}" ng-show="getVocabulary('methods-design')">
    </uib-tab>
    
    <uib-tab heading="{{'graphics.number-participants' | translate}}" ng-show="getVocabulary('numberOfParticipants-participant-range')">
    </uib-tab>
    
    <uib-tab heading="{{'graphics.bio-samples' | translate}}" ng-show="getVocabulary('populations-dataCollectionEvents-bioSamples')">
    </uib-tab>
    <uib-tab heading="{{'graphics.study-start-year' | translate}}" ng-show="getVocabulary('start-range')">
    </uib-tab>
    
  </uib-tabset>
  <!-- Content -->
  <graphic-chart-container type="activeTab"></graphic-chart-container>
</div>
