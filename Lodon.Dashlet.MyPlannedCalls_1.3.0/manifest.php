<?php
$manifest =array(
    'acceptable_sugar_flavors' => array('PRO','CORP','ENT','ULT'),
    'acceptable_sugar_versions' => array(
        'exact_matches' => array(),
        'regex_matches' => array(0 => "7*"),
    ),
    'author' => 'Lodon AB',
    'description' => 'Lodon - My Planned Calls',
    'icon' => '',
    'is_uninstallable' => true,
    'name' => 'Lodon - My Planned Calls',
    'published_date' => '2014-05-22',
    'type' => 'module',
    'version' => '1.3.0', //also in dashlet-config.hbs
);

$installdefs = array(
	'id' => 'LodonMyPlannedCalls',
	
    'copy' => array(
        array(
            'from' => '<basepath>/files/my_planned_calls/views',
            'to' => 'custom/clients/base/views/my_planned_calls',
        ),
        array(
            'from' => '<basepath>/files/my_planned_calls/api/MyPlannedCallsApi.php',
            'to' => 'custom/modules/Calls/clients/base/api/MyPlannedCallsApi.php',
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
