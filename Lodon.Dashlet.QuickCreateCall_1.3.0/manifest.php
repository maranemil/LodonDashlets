<?php
$manifest = array(
    'acceptable_sugar_flavors'  => array('PRO', 'CORP', 'ENT', 'ULT'),
    'acceptable_sugar_versions' => array(
        'exact_matches' => array(),
        'regex_matches' => array(0 => "7*"),
    ),
    'author'                    => 'Lodon AB',
    'description'               => 'Lodon - Quick Create Call',
    'icon'                      => '',
    'is_uninstallable'          => true,
    'name'                      => 'Lodon - Quick Create Call',
    'published_date'            => '2014-04-16',
    'type'                      => 'module',
    'version'                   => '1.3.0', //also in dashlet-config.hbs
);

$installdefs = array(
    'id' => 'LodonQuickCreateCall',

    'copy'     => array(
        array(
            'from' => '<basepath>/files/quick_create_call',
            'to'   => 'custom/clients/base/views/quick_create_call',
        ),
    ),
    'language' => array(
        array(
            'from'      => '<basepath>/files/lang/en_us.lang.php',
            'to_module' => 'application',
            'language'  => 'en_us',
        ),
    ),
);
?>
