 
<?php
if (! defined('sugarEntry') || ! sugarEntry) die('Not A Valid Entry Point');
 
function post_install() {
	$autoexecute = false; //execute the SQL
	$show_output = true; //output to the screen
	require_once("modules/Administration/QuickRepairAndRebuild.php");
	$randc = new RepairAndClear();
	$randc->repairAndClearAll(array('clearAll'),array(translate('LBL_ALL_MODULES')), $autoexecute,$show_output);
}