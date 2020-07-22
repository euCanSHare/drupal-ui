<?php if (!empty($dataset_type_dto->studyTables) && !empty(variable_get_value('dataset_show_collected_studies'))): ?>
  <h2>
    <?php  print $localize->getTranslation('global.included-individual-studies');    ?>
  </h2>

    <div id="studies-table">
      <div class="row">
        <div class="col-lg-12 col-xs-12">
          <table class="table table-striped" id="table-studies"></table>
        </div>
      </div>
    </div>

<?php endif ?>
<?php if (!empty($dataset_type_dto->harmonizationTables) && !empty(variable_get_value('dataset_show_harmonization_studies'))): ?>
  <h2>
    <?php
    print $localize->getTranslation('global.participant-harmonization-studies');
    ?>
  </h2>
  <div id="studies-table">
    <div class="row">
      <div class="col-lg-12 col-xs-12">
        <table class="table table-striped" id="table-harmonization-studies"></table>
      </div>
    </div>
  </div>
<?php endif; ?>