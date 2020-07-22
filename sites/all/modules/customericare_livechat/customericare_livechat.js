
(function ($) {

    'use strict';

    var accountNew = $('#account-new');
    var accountExisting = $('#account-existing');

    var toggleForms = function(val) {
        if('new' == val)
        {
            accountNew.show();
            accountExisting.hide();
        } else
        {
            accountNew.hide();
            accountExisting.show();
        }
    };

    toggleForms($('.account-choice:checked').val());

    $('.account-choice').change(function(){
        if(!$(this).attr('checked'))
        {
            return;
        }

        toggleForms($(this).val());
    });

    $('#account-login').click(function(e){
        e.preventDefault();

        var token = $(this).attr('data-token'),
            email = $('#account-email input').val(),
            appUrl = 'https://app.customericare.com';

        if(token.length && email.length)
        {
            appUrl += '/login/token/?email=' + email + '&token=' + token;
        }

        window.open(appUrl, '_blank');
    });

}(jQuery));
