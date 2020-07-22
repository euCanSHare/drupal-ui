<div id="dce-modal" class="modal fade" xmlns="http://www.w3.org/1999/html">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3 class="dce-modal-title">@dce-modal-title</h3>
      </div>
      <div class="modal-body">
        <section>
          <div test-ref="modal-dce-description">
              <p class="modal-dce-description">
                  @dce-description
              </p>
          </div>

          <div class="clearfix"></div>

          <table class="table table-striped">
            <tbody>

              <tr class="dce-start-year">
                <th class="start-year-title">@dce-start-year-title</th>
                <td test-ref="modal-dce-startYear" class="start-year"><p>@dce-start-year</p></td>
              </tr>


            <tr class="dce-end-year">
              <th class="end-year-title">@dce-end-year-title</th>
                <td test-ref="modal-dce-endYear" class="end-year"><p>@dce-end-year</p></td>
            </tr>

              <tr class="dce-data-sources">
                <th class="data-sources-title">@data-sources-title</th>
                <td class="data-sources-list">
                    @data-sources-list
                </td>
              </tr>

              <tr class="dce-bio-samples">
                <th class="bio-samples-title">@bio-samples-title</th>
                <td class="bio-samples-list">
                  @bio-samples-list
                </td>
              </tr>

              <tr class="dce-admin-databases">
                  <th class="admin-databases-title">@admin-databases-title</th>
                  <td  class="admin-databases-list">
                      @admin-databases-list
                  </td>
              </tr>

            </tbody>
          </table>
        </section>
          <div class="dce-file-browser">
              <span class="files-documents"><div file-browser doc-path="/" doc-id="" token-key="" refresh="false">
               </div></span>
          </div>
      </div>
    </div>
  </div>
</div>
