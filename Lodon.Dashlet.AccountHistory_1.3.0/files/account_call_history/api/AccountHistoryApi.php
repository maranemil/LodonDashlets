<?php
 
class AccountHistoryApi extends SugarApi
{
	public $return_array;
	public $hash_array;
	public $counter;
	
	public function registerApiRest() {
		return array(
			'getAccounthistory' => array(
				'reqType' => 'GET',
				'path' => array('Accounts','?','account_history'),
				'pathVars' => array('module', 'record'),
				'method' => 'getAccountHistory',
				'shortHelp' => 'Lists extensive call history from an account and related entities.',
				'longHelp' => '/rest/v10/accounts/:recordid/account_history',
			),
		);
	}

	public function getAccountHistory($api, $args)
	{
		$this->return_array = array();
		$this->counter = 0;
		
		// Get calls directly related to the account.
		$this->buildReturnArray($args['module'], $args['record']);

		// Get the contacts related to the account
		$contact_bean_record = BeanFactory::getBean($args['module'], $args['record']);
		if(!$contact_bean_record->load_relationship('contacts')){
			return;
		}
		$linkModuleContacts = $contact_bean_record->contacts->getRelatedModuleName();
		$linkContacts = BeanFactory::newBean($linkModuleContacts);
		$contacts = $contact_bean_record->contacts->getBeans();
		
		if(!empty($contacts)){
			foreach($contacts as $key_contact => $value_contact){
				// Get all calls related to each contact
				$this->buildReturnArray('Contacts', $value_contact->id);
			}
		}
		
		// Get the contacts related to the opportunities
		$opp_bean_record = BeanFactory::getBean($args['module'], $args['record']);
		if(!$opp_bean_record->load_relationship('opportunities')){
			return;
		}
		$linkModuleOpp = $opp_bean_record->opportunities->getRelatedModuleName();
		$linkOpp = BeanFactory::newBean($linkModuleOpp);
		$opp = $opp_bean_record->opportunities->getBeans();
		
		if(!empty($opp)){
			foreach($opp as $key_opp => $value_opp){
				// Get all calls related to each opportunity
				$this->buildReturnArray('Opportunities', $value_opp->id);
			}
		}
		//$unique_array = array_unique($this->return_array, SORT_REGULAR);
		return $this->return_array;
	}
	
	public function buildReturnArray($module, $record)
	{		
		$bean_record = BeanFactory::getBean($module, $record);

		// Get the calls directly related to the account
		if(!$bean_record->load_relationship('calls')){
			return;
		}
		$linkModuleCalls = $bean_record->calls->getRelatedModuleName();
		$linkCalls = BeanFactory::newBean($linkModuleCalls);
		$calls = $bean_record->calls->getBeans();

		if(!empty($calls)){
			foreach($calls as $key_calls => $value_calls){
				if(	(!$value_calls->deleted) &&
					($value_calls->status === "Held") &&
					(!in_array($value_calls->id,$this->hash_array,true)
					)){
					$this->return_array[$this->counter]["id"] = $value_calls->id;
					$this->return_array[$this->counter]["name"] = $value_calls->name;
					$this->return_array[$this->counter]["assigned_user_name"] = $value_calls->assigned_user_name;
					$this->return_array[$this->counter]["parent_name"] = $value_calls->parent_name;
					$this->return_array[$this->counter]["contact_name"] = $value_calls->contact_name;
					$this->return_array[$this->counter]["date_start"] = $value_calls->date_start;
					$this->return_array[$this->counter]["description"] = $value_calls->description;
					$this->return_array[$this->counter]["parent_type"] = $module; //$value_calls->parent_type;
					$this->return_array[$this->counter]["icon_text"] = $value_calls->icon_text;
					$this->return_array[$this->counter]["parent_type_substr"] = substr($module,0,2);
					$this->return_array[$this->counter]["deleted"] = ($value_calls->deleted) ? 'Deleted' : 'Not deleted';
					$this->return_array[$this->counter]["status"] = $value_calls->status;

	            	$this->counter++;
	            	$this->hash_array[] = $value_calls->id;

	            }
			}
		}
	}
}
