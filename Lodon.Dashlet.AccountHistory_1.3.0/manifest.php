<?php
$manifest =array(
    'acceptable_sugar_flavors' => array('PRO','CORP','ENT','ULT'),
    'acceptable_sugar_versions' => array(
        'exact_matches' => array(),
        'regex_matches' => array(0 => "7*"),
    ),
    'author' => 'Lodon AB',
    'description' => 'Lodon - Account History Dashlet',
    'icon' => '',
    'is_uninstallable' => true,
    'name' => 'Lodon - Account History Dashlet',
    'published_date' => '2014-04-16',
    'type' => 'module',
    'version' => '1.3.0', //also in dashlet-config.hbs
);

$installdefs = array(
	'id' => 'LodonAccountHistoryDashlet',
	
    'copy' => array(
        array(
            'from' => '<basepath>/files/account_call_history/views',
            'to' => 'custom/modules/Accounts/clients/base/views/account_call_history',
        ),
		array(
            'from' => '<basepath>/files/account_call_history/api/AccountHistoryApi.php',
            'to' => 'custom/modules/Accounts/clients/base/api/AccountHistoryApi.php',
        ),
    ),
    'language' => array(
        array(
            'from' => '<basepath>/files/lang/en_us.lang.php',
            'to_module' => 'application',
            'language' => 'en_us',
            ),
        ),
);
?>
