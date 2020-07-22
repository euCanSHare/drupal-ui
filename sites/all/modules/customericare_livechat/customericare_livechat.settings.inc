<?php

function customericare_livechat_settings_form()
{
    $moduleDir = drupal_get_path('module', 'customericare_livechat');

    drupal_add_css($moduleDir.'/customericare_livechat.css');
    drupal_add_js($moduleDir.'/customericare_livechat.js', array(
        'type' => 'file',
        'scope' => 'footer',
    ));

    if(variable_get('cic_apikey', false))
    {
        return customericare_livechat_form_reset();
    } else
    {
        return customericare_livechat_form_create();
    }
}

function customericare_livechat_form_create()
{
    // choice fields
    $form['account'] = array(
        '#type' => 'fieldset',
        '#collapsible' => false,
    );

    $form['account']['choice'] = array(
        '#type' => 'radios',
        '#options' => array(
            'new' => 'No, create new account for free',
            'existing' => 'Yes, I already have an account',
        ),
        '#default_value' => 'new',
        '#required' => true,
        '#attributes' => array(
            'class' => array('account-choice'),
        ),
        '#prefix' => '<div id="account-choice"><h3>'.t('Do you already have an account?').'</h3>',
        '#suffix' => '</div>',
    );

    // fields for new account
    $form['account-new'] = array(
        '#type' => 'fieldset',
        '#prefix' => '<div id="account-new"><h3>'.t('Create a new account').'</h3>',
        '#suffix' => '</div>',
    );

    $form['account-new']['email_new'] = array(
        '#type' => 'textfield',
        '#title' => t('E-mail'),
        '#size' => 40,
        '#maxlength' => 70,
        '#required' => false,
        '#attributes' => array(
            'autocomplete' => 'off'
        ),
    );

    $form['account-new']['password'] = array(
        '#type' => 'password',
        '#title' => t('Password'),
        '#size' => 40,
        '#required' => false,
        '#attributes' => array(
            'autocomplete' => 'off'
        ),
    );

    // fields for existing account
    $form['account-existing'] = array(
        '#type' => 'fieldset',
        '#prefix' => '<div id="account-existing"><h3>'.t('Account details').'</h3>',
        '#suffix' => '</div>',
    );

    $form['account-existing']['email_existing'] = array(
        '#type' => 'textfield',
        '#title' => t('E-mail'),
        '#size' => 40,
        '#maxlength' => 70,
        '#required' => false,
        '#attributes' => array(
            'autocomplete' => 'off'
        ),
    );

    // override default submit
    $form['submit'] = array(
        '#type' => 'submit',
        '#value' => t('Save configuration'),
        '#validate' => array('customericare_livechat_settings_validate'),
        '#submit' => array('customericare_livechat_settings_save'),
    );

    return $form;
}

function customericare_livechat_settings_validate($form, $form_state)
{
    if('new' == $form_state['values']['choice'])
    {
        if(empty($form_state['values']['email_new']))
        {
            form_set_error('email_new', t('A valid e-mail is required.'));
        }

        if(!filter_var($form_state['values']['email_new'], FILTER_VALIDATE_EMAIL))
        {
            form_set_error('email_new', t('"'.$form_state['values']['email_new'].'" is not a valid email address in the basic format local-part@hostname'));
        }

        if(strlen($form_state['values']['password']) < 6)
        {
            form_set_error('password', t('Password must be at least 6 characters long'));
        }
    }

    if('existing' == $form_state['values']['choice'])
    {
        if(empty($form_state['values']['email_existing']))
        {
            form_set_error('email_existing', t('A valid e-mail is required.'));
        }

        if(!filter_var($form_state['values']['email_existing'], FILTER_VALIDATE_EMAIL))
        {
            form_set_error('email_existing', t('"'.$form_state['values']['email_existing'].'" is not a valid email address in the basic format local-part@hostname'));
        }
    }
}

function customericare_livechat_settings_save($form, $form_state)
{
    global $base_url;

    if('new' == $form_state['values']['choice'])
    {
        $path = '';
        $query = array(
            'email' => $form_state['values']['email_new'],
            'password' => $form_state['values']['password'],
            'company' => $form_state['values']['email_new'],
            'lng' => 'en',
            'add_type' => 'plugin_drupal_6',
            'link' => $base_url,
            'url' => '',
        );
    } else
    {
        $path = '/get-apikey-from-admin-email';
        $query = array(
            'email' => $form_state['values']['email_existing'],
        );
    }

    $c = curl_init();

    curl_setopt($c, CURLOPT_URL, 'https://app.customericare.com/ajax'.$path);
    curl_setopt($c, CURLOPT_POST, true);
    curl_setopt($c, CURLOPT_POSTFIELDS, http_build_query($query, null, '&'));
    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);

    if(false == $response = curl_exec($c))
    {
        return somethingWentWrong();
    }

    $data = json_decode($response);

    if(empty($data))
    {
        return somethingWentWrong();
    }

    if(!$data->res)
    {
        return drupal_set_message($data->msg, 'error');
    }

    variable_set('cic_api_email', $query['email']);
    variable_set('cic_apikey', empty($data->user) ? $data->apikey : $data->user->apikey);
    variable_set('cic_api_token', empty($data->user) ? $data->token : $data->user->token);

    return drupal_set_message((empty($data->user) ? 'Licence created.' : 'Success!').' Check it out! <span id="background-login"></span>');
}

function somethingWentWrong()
{
    return drupal_set_message('Whoops, looks like something went wrong.', 'error');
}

function customericare_livechat_form_reset()
{
    $form['account_settings'] = array(
        '#type' => 'fieldset',
        '#prefix' => '<div id="account-email">',
        '#suffix' => '</div>',
    );

    $form['account_settings']['account'] = array(
        '#type' => 'textfield',
        '#title' => t('Your licence e-mail'),
        '#default_value' => variable_get('cic_api_email', ''),
        '#attributes' => array(
            'disabled' => 'disabled'
        ),
    );

    $form['account_login'] = array(
        '#type' => 'fieldset',
        '#collapsible' => false,
    );

    $form['account_login']['button'] = array(
        '#type' => 'item',
        '#markup' => '<button id="account-login" data-token="'.variable_get('cic_api_token', '').'">'.t('Click here to log into the app').'</button>',
    );

    $form['submit'] = array(
        '#type' => 'submit',
        '#value' => t('Reset to defaults'),
        '#submit' => array('customericare_livechat_settings_reset'),
    );

    return $form;
}

function customericare_livechat_settings_reset()
{
    variable_set('cic_api_email', '');
    variable_set('cic_apikey', '');
    variable_set('cic_api_token', '');
}
