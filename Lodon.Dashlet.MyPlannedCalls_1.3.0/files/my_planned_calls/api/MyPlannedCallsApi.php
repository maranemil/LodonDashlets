<?php /** @noinspection PhpUnused */

class MyPlannedCallsApi extends SugarApi
{
    public function registerApiRest()
    {
        return array(
            'getMyPlannedCalls' => array(
                'reqType'   => 'GET',
                'path'      => array('Calls', 'my_planned_calls'),
                'pathVars'  => array('module'),
                'method'    => 'getMyPlannedCalls',
                'shortHelp' => 'Lists all held calls.',
                'longHelp'  => '/rest/v10/calls/my_planned_calls',
            ),
        );
    }

    public function getMyPlannedCalls($api, $args)
    {
        require_once('include/SugarQuery/SugarQuery.php');
        require_once('log4php/LoggerManager.php');
        $GLOBALS['log'] = LoggerManager::getLogger('SugarCRM');
        $GLOBALS['log']->info("running getmyplannedcalls");

        $calls = $this->getCalls($api, $args);

        return $this->collectData($api, $args, $calls);
    }

    private function getCalls($api, $args)
    {
        $bean = BeanFactory::newBean('Calls');
        $query = new SugarQuery();
        $query->select(array('id'));
        $query->from($bean);
        $query->where()->equals('status', 'Planned');
        $query->where()->equals('assigned_user_id', $api->user->id);
        if (isset($args["id"])) {
            $query->where()->equals('calls.id', $args["id"]);
        }
        $query->orderBy('date_start', 'ASC');
        return $query->execute();
    }

    private function collectData($api, $args, $records)
    {
        $output = array();
        $index = 0;
        foreach ($records as $record) {
            $current = array();
            $call = BeanFactory::getBean('Calls', $record["id"]);
            if (!empty($call->contact_id)) {
                $contact = BeanFactory::getBean('Contacts', $call->contact_id);
                $current["contact_name"] = $contact->name;
                $current["phone_mobile"] = $contact->phone_mobile;
                $current["phone_work"] = $contact->phone_work;
            } else if (!empty($call->parent_id) && !empty($call->parent_type)) {
                if ($call->parent_type === "Leads" || $call->parent_type === "Prospects") {
                    $parent = BeanFactory::getBean($call->parent_type, $call->parent_id);
                    $current["contact_name"] = $parent->name;
                    $current["phone_mobile"] = $parent->phone_mobile;
                    $current["phone_work"] = $parent->phone_work;
                }
            }

            if (!empty($call->parent_id) && !empty($call->parent_type)) {
                $parent = BeanFactory::getBean($call->parent_type, $call->parent_id);
                $current["related_to"] = $parent->name;
            }
            $current["id"] = $call->id;
            $current["name"] = $call->name;
            $current["description"] = $call->description;
            $current["date_start"] = $call->date_start;
            if (!empty($call->parent_type)) {
                $current["parent_id"] = $call->parent_id;
                $current["parent_type"] = $call->parent_type;
                $current["parent_type_substr"] = substr($call->parent_type, 0, 2);
                if ($call->parent_type === "Prospects") {
                    $current["parent_type_substr"] = "Ta";
                }

            }
            $current["index"] = $index;
            ++$index;
            $output[] = $current;
        }
        return $output;
    }

}
