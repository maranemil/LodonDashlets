<?php
if (!defined('sugarEntry') || !sugarEntry) {
    die('Not A Valid Entry Point');
}
/*
 * For customization and extended functionality,
 * please contact martin.forsberg@lodon.se
 *
 * Copyright © 2014 Lodon AB, www.lodon.se
 */

$viewdefs['base']['view']['quick_create_meeting'] = array(
    'dashlets' => array(
        array(
            'label'       => 'LBL_DASHLET_QUICK_CREATE_MEETING_NAME',
            'description' => 'LBL_DASHLET_QUICK_CREATE_MEETING_DESCRIPTION_TEXT',
            'config'      => array(),
            'preview'     => array(),
            'filter'      => array(
                'module' => array(
                    'Accounts',
                    'Contacts',
                    'Prospects',
                    'Leads',
                ),
                'view'   => 'record'
            ),
        ),
    ),
);
