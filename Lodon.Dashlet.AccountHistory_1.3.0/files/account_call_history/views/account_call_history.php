<?php
 if(!defined('sugarEntry') || !sugarEntry) die('Not A Valid Entry Point');

$viewdefs['Accounts']['base']['view']['account_call_history'] = array(
    'dashlets' => array(
        array(
            'label' => 'Account History Dashlet',
            'description' => 'Account History Dashlet',
            'config' => array(
            ),
            'preview' => array(
            ),
            'filter' => array(
                'module' => array(
                    'Accounts',
                    ),
                'view' => 'record'
            ),
        ),
    ),
);
